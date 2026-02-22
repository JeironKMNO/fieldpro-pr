"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fieldpro/ui/components/table";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { ArrowRight } from "lucide-react";

interface RecentQuote {
  id: string;
  quoteNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  clientName: string;
}

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)}sem`;
  return `hace ${Math.floor(diffDays / 30)}m`;
}

export function RecentQuotesTable({ quotes }: { quotes: RecentQuote[] }) {
  return (
    <Card className="h-full border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base text-slate-900">Cotizaciones Recientes</CardTitle>
        <Link
          href="/quotes"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          Ver Todas <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-500">
            Sin cotizaciones aún
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="w-[100px] text-slate-500">#</TableHead>
                <TableHead className="text-slate-500">Cliente</TableHead>
                <TableHead className="text-slate-500">Estado</TableHead>
                <TableHead className="text-right text-slate-500">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <Link
                      href={`/quotes/${q.id}`}
                      className="font-medium text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      {q.quoteNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-slate-900">{q.clientName}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {timeAgo(q.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-900">
                    {fmt(q.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
