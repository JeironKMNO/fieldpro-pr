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
    await caller.quote.byId({ id }); // verify exists, throws if not found
    return <QuoteBuilder initialQuote={{ id }} />;
  } catch {
    notFound();
  }
}
