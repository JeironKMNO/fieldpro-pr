import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@fieldpro/db";
import { Button } from "@fieldpro/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { QuotePreview } from "@/components/quotes/quote-preview";
import { PrintButton } from "@/components/quotes/print-button";

type QuoteSection = Prisma.QuoteSectionGetPayload<{
  include: { category: true; items: true };
}>;
type QuoteItem = Prisma.QuoteItemGetPayload<Record<string, never>>;

export default async function QuotePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const caller = await api();
    const quote = await caller.quote.byId({ id });

    // Serialize Decimal and Date fields — Next.js cannot pass non-plain objects
    // from Server Components to Client Components.
    const serializedQuote = {
      ...quote,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      validUntil: quote.validUntil?.toISOString() ?? null,
      sentAt: quote.sentAt?.toISOString() ?? null,
      viewedAt: quote.viewedAt?.toISOString() ?? null,
      respondedAt: quote.respondedAt?.toISOString() ?? null,
      lastFollowUpAt: quote.lastFollowUpAt?.toISOString() ?? null,
      subtotal: Number(quote.subtotal),
      taxRate: Number(quote.taxRate),
      taxAmount: Number(quote.taxAmount),
      total: Number(quote.total),
      sections: quote.sections.map((section: QuoteSection) => ({
        ...section,
        subtotal: Number(section.subtotal),
        items: section.items.map((item: QuoteItem) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          markupPct: Number(item.markupPct),
          total: Number(item.total),
          length: item.length !== null ? Number(item.length) : null,
          width: item.width !== null ? Number(item.width) : null,
          height: item.height !== null ? Number(item.height) : null,
        })),
      })),
      activities:
        quote.activities?.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        })) ?? [],
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Link href={`/quotes/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Button>
          </Link>
          <PrintButton />
        </div>
        <QuotePreview quote={serializedQuote} />
      </div>
    );
  } catch {
    notFound();
  }
}
