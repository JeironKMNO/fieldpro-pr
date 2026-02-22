"use server";

import { prisma } from "@fieldpro/db";
import { sendQuoteResponseNotification } from "@/server/services/email";

export async function respondToQuote(
  token: string,
  response: "ACCEPTED" | "REJECTED"
) {
  const quote = await prisma.quote.findUnique({
    where: { shareToken: token },
    include: {
      client: { select: { name: true } },
    },
  });

  if (!quote) {
    return { error: "Quote not found" };
  }

  if (quote.status !== "SENT" && quote.status !== "VIEWED") {
    return { error: "This quote can no longer be responded to" };
  }

  if (quote.validUntil && new Date(quote.validUntil) < new Date()) {
    return { error: "This quote has expired" };
  }

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: response,
      respondedAt: new Date(),
    },
  });

  // Create activity record
  await prisma.quoteActivity.create({
    data: { quoteId: quote.id, type: response },
  });

  // Auto-create Job when accepted
  if (response === "ACCEPTED") {
    const counter = await prisma.jobCounter.upsert({
      where: { organizationId: quote.organizationId },
      update: { lastNumber: { increment: 1 } },
      create: { organizationId: quote.organizationId, lastNumber: 1 },
    });
    const jobNumber = `JB-${String(counter.lastNumber).padStart(3, "0")}`;

    await prisma.job.create({
      data: {
        organizationId: quote.organizationId,
        clientId: quote.clientId,
        quoteId: quote.id,
        createdById: quote.createdById,
        jobNumber,
        title: quote.title,
        value: quote.total,
        status: "SCHEDULED",
      },
    });
  }

  // Notify contractor via email
  const creator = await prisma.user.findUnique({
    where: { id: quote.createdById },
    select: { email: true },
  });
  if (creator?.email) {
    sendQuoteResponseNotification(
      creator.email,
      quote.quoteNumber,
      quote.client.name,
      response,
      quote.id
    ).catch(() => {});
  }

  return { success: true };
}
