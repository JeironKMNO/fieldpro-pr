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
import { Search, Receipt } from "lucide-react";
import { InvoiceStatusBadge } from "./invoice-status-badge";

type StatusFilter =
  | ""
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Todas", value: "" },
  { label: "Borrador", value: "DRAFT" },
  { label: "Enviada", value: "SENT" },
  { label: "Vista", value: "VIEWED" },
  { label: "Pagada", value: "PAID" },
  { label: "Vencida", value: "OVERDUE" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-PR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoiceList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const { data, isLoading } = trpc.invoice.list.useQuery({
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
          placeholder="Buscar por número de factura o cliente..."
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
          {data.pagination.total} factura{data.pagination.total !== 1 ? "s" : ""}
        </p>
      )}

      {!data?.invoices.length ? (
        <Card className="p-12 text-center space-y-3">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            {search || statusFilter
              ? "Ninguna factura coincide con los filtros."
              : "Sin facturas aún. Crea una desde un trabajo completado."}
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead># Factura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Trabajo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Emitida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.map((inv) => (
                  <TableRow key={inv.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-heading font-semibold text-gold-600 hover:text-gold-700 hover:underline tracking-wide"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{inv.client.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {inv.job?.jobNumber ?? "—"}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(inv.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inv.createdAt)}
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
