import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import { QuoteBuilder } from "@/components/quotes/quote-builder";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const caller = await api();
    const quote = await caller.quote.byId({ id });
    return <QuoteBuilder initialQuote={quote} />;
  } catch {
    notFound();
  }
}
