"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { FileText, Plus } from "lucide-react";
import { QuoteStatusBadge } from "../quotes/quote-status-badge";

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

export function ClientQuotes({ clientId }: { clientId: string }) {
  const { data, isLoading } = trpc.quote.list.useQuery({
    clientId,
    limit: 5,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Cotizaciones
        </CardTitle>
        <Link href={`/quotes/new?clientId=${clientId}`}>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : !data?.quotes.length ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay cotizaciones para este cliente.
          </p>
        ) : (
          <div className="space-y-2">
            {data.quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{quote.quoteNumber}</span>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                  {quote.title && (
                    <p className="text-sm text-muted-foreground">
                      {quote.title}
                    </p>
                  )}
                </div>
                <span className="font-semibold">
                  {formatCurrency(quote.total)}
                </span>
              </Link>
            ))}
            {data.pagination.total > 5 && (
              <Link
                href={`/quotes?clientId=${clientId}`}
                className="block text-center text-sm text-primary hover:underline"
              >
                Ver las {data.pagination.total} cotizaciones
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
