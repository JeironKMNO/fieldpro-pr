"use client";

import Link from "next/link";
import { Card } from "@fieldpro/ui/components/card";
import { Button } from "@fieldpro/ui/components/button";
import { AlertCircle, MessageCircle, Mail, ExternalLink } from "lucide-react";

interface OverdueInvoiceItem {
  id: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date | null;
  shareToken: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
}

function fmtUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OverdueInvoicesWidget({
  items,
}: {
  items: OverdueInvoiceItem[];
}) {
  if (items.length === 0) return null;

  const now = new Date();

  return (
    <Card className="border-red-500/30 bg-red-500/5">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-slate-900">Facturas Vencidas</h3>
          <span className="ml-auto rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-500">
            {items.length}
          </span>
        </div>
        <div className="space-y-3">
          {items.map((item) => {
            const daysOverdue = item.dueDate
              ? Math.floor(
                  (now.getTime() - new Date(item.dueDate).getTime()) /
                    (24 * 60 * 60 * 1000)
                )
              : 0;

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/invoices/${item.id}`}
                      className="font-medium text-sm text-slate-800 hover:text-red-500 transition-colors"
                    >
                      {item.invoiceNumber}
                    </Link>
                    <span className="text-xs font-semibold text-red-500">
                      {fmtUSD(item.total)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    {item.clientName}
                  </p>
                  <p className="text-xs text-red-400/80 mt-1">
                    Vencida hace {daysOverdue} día{daysOverdue !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {item.clientPhone ? (
                    <a
                      href={`https://wa.me/${item.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${item.clientName}, te recordamos que tienes una factura pendiente de pago por ${fmtUSD(item.total)}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : null}
                  {item.clientEmail ? (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(item.clientEmail)}&su=${encodeURIComponent(`Recordatorio de pago: ${item.invoiceNumber}`)}&body=${encodeURIComponent(`Hola ${item.clientName},\n\nTe recordamos que tienes una factura pendiente de pago por ${fmtUSD(item.total)}.\n\nSaludos`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : null}
                  <Link href={`/invoices/${item.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
