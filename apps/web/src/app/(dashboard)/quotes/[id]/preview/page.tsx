import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@fieldpro/ui/components/button";
import { ArrowLeft, Printer } from "lucide-react";
import { QuotePreview } from "@/components/quotes/quote-preview";

export default async function QuotePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const caller = await api();
    const quote = await caller.quote.byId({ id });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Link href={`/quotes/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="print:hidden"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
        <QuotePreview quote={quote} />
      </div>
    );
  } catch {
    notFound();
  }
}
