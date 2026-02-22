"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@fieldpro/ui/components/card";
import { Button } from "@fieldpro/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fieldpro/ui/components/table";
import { Search } from "lucide-react";
import { QuoteStatusBadge } from "./quote-status-badge";

type StatusFilter = "" | "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "EXPIRED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Todas", value: "" },
  { label: "Borrador", value: "DRAFT" },
  { label: "Enviada", value: "SENT" },
  { label: "Aceptada", value: "ACCEPTED" },
  { label: "Rechazada", value: "REJECTED" },
];

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-PR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function QuoteList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const { data, isLoading } = trpc.quote.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por número, cliente o título..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === tab.value
                ? "bg-background text-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {data && (
        <p className="text-sm text-muted-foreground">
          {data.pagination.total} {data.pagination.total !== 1 ? "cotizaciones" : "cotización"}
        </p>
      )}

      {!data?.quotes.length ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {search || statusFilter
              ? "Ninguna cotización coincide con los filtros."
              : "Sin cotizaciones aún. Crea tu primera cotización para comenzar."}
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead># Cotización</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.quotes.map((quote) => (
                  <TableRow key={quote.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="font-heading font-semibold text-gold-600 hover:text-gold-700 hover:underline tracking-wide"
                      >
                        {quote.quoteNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{quote.client.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {quote.title ?? "—"}
                    </TableCell>
                    <TableCell>
                      <QuoteStatusBadge status={quote.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(quote.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Página {page} de {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
