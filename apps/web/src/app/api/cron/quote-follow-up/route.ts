import { NextResponse } from "next/server";
import { prisma } from "@fieldpro/db";
import {
  sendFollowUpToClient,
  sendExpiryReminderToClient,
} from "@/server/services/email";

const MAX_FOLLOW_UPS_PER_QUOTE = 2;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { followUps: 0, reminders: 0, expired: 0 };

  // Get all orgs with auto follow-up enabled
  const orgs = await prisma.organization.findMany({
    where: { autoFollowUp: true },
    select: {
      id: true,
      name: true,
      followUpDays: true,
      expiryReminderDays: true,
    },
  });

  for (const org of orgs) {
    const followUpThreshold = new Date(
      now.getTime() - org.followUpDays * 24 * 60 * 60 * 1000
    );

    // 1. Follow-up: quotes SENT but not viewed after followUpDays
    const quotesNeedingFollowUp = await prisma.quote.findMany({
      where: {
        organizationId: org.id,
        status: "SENT",
        sentAt: { lt: followUpThreshold },
        OR: [
          { lastFollowUpAt: null },
          { lastFollowUpAt: { lt: followUpThreshold } },
        ],
      },
      include: {
        client: { select: { name: true, email: true } },
        _count: {
          select: {
            activities: {
              where: { type: "FOLLOW_UP_SENT" },
            },
          },
        },
      },
    });

    for (const quote of quotesNeedingFollowUp) {
      if (quote._count.activities >= MAX_FOLLOW_UPS_PER_QUOTE) continue;
      if (!quote.client.email) continue;

      const shareUrl = `${APP_URL}/quotes/share/${quote.shareToken}`;

      await sendFollowUpToClient(
        quote.client.email,
        quote.client.name,
        quote.quoteNumber,
        org.name,
        shareUrl
      );

      await prisma.$transaction([
        prisma.quoteActivity.create({
          data: { quoteId: quote.id, type: "FOLLOW_UP_SENT" },
        }),
        prisma.quote.update({
          where: { id: quote.id },
          data: { lastFollowUpAt: now },
        }),
      ]);

      results.followUps++;
    }

    // 2. Expiry reminders: quotes expiring within expiryReminderDays
    const expiryThreshold = new Date(
      now.getTime() + org.expiryReminderDays * 24 * 60 * 60 * 1000
    );

    const quotesExpiringSoon = await prisma.quote.findMany({
      where: {
        organizationId: org.id,
        status: { in: ["SENT", "VIEWED"] },
        validUntil: { gt: now, lte: expiryThreshold },
        activities: {
          none: { type: "REMINDER_SENT" },
        },
      },
      include: {
        client: { select: { name: true, email: true } },
      },
    });

    for (const quote of quotesExpiringSoon) {
      if (!quote.client.email || !quote.validUntil) continue;

      const daysLeft = Math.ceil(
        (quote.validUntil.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const shareUrl = `${APP_URL}/quotes/share/${quote.shareToken}`;

      await sendExpiryReminderToClient(
        quote.client.email,
        quote.client.name,
        quote.quoteNumber,
        org.name,
        shareUrl,
        daysLeft
      );

      await prisma.quoteActivity.create({
        data: { quoteId: quote.id, type: "REMINDER_SENT" },
      });

      results.reminders++;
    }

    // 3. Auto-expire: quotes past validUntil
    const expiredQuotes = await prisma.quote.findMany({
      where: {
        organizationId: org.id,
        status: { in: ["SENT", "VIEWED"] },
        validUntil: { lt: now },
      },
      select: { id: true },
    });

    for (const quote of expiredQuotes) {
      await prisma.$transaction([
        prisma.quote.update({
          where: { id: quote.id },
          data: { status: "EXPIRED" },
        }),
        prisma.quoteActivity.create({
          data: { quoteId: quote.id, type: "EXPIRED" },
        }),
      ]);

      results.expired++;
    }
  }

  return NextResponse.json({
    ok: true,
    ...results,
    processedOrgs: orgs.length,
  });
}
