import { prisma } from "@fieldpro/db";
import { notFound } from "next/navigation";
import { PublicQuoteView } from "@/components/quotes/public-quote-view";
import { sendQuoteViewedNotification } from "@/server/services/email";

export default async function ShareQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const quote = await prisma.quote.findUnique({
    where: { shareToken: token },
    include: {
      organization: {
        select: { name: true, logoUrl: true, phone: true, license: true },
      },
      client: {
        include: {
          addresses: { where: { isPrimary: true }, take: 1 },
        },
      },
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          category: true,
          items: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  // Check expiration
  const isExpired =
    quote.validUntil &&
    new Date(quote.validUntil) < new Date() &&
    !["ACCEPTED", "REJECTED"].includes(quote.status);

  if (isExpired) {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: "EXPIRED" },
    });
    await prisma.quoteActivity.create({
      data: { quoteId: quote.id, type: "EXPIRED" },
    });
    quote.status = "EXPIRED";
  }

  // Mark as viewed if SENT
  if (quote.status === "SENT") {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    });
    await prisma.quoteActivity.create({
      data: { quoteId: quote.id, type: "VIEWED" },
    });

    // Notify contractor via email
    const creator = await prisma.user.findUnique({
      where: { id: quote.createdById },
      select: { email: true },
    });
    if (creator?.email) {
      sendQuoteViewedNotification(
        creator.email,
        quote.quoteNumber,
        quote.client.name,
        quote.id
      ).catch(() => {});
    }
  }

  const canRespond =
    !isExpired &&
    (quote.status === "SENT" || quote.status === "VIEWED");

  return (
    <PublicQuoteView
      quote={quote}
      token={token}
      canRespond={canRespond}
      isExpired={!!isExpired}
    />
  );
}
