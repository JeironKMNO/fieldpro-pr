"use client";

import { Badge } from "@fieldpro/ui/components/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: { label: "Borrador", className: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200" },
  SENT: { label: "Enviada", className: "bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100" },
  VIEWED: { label: "Vista", className: "bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100" },
  ACCEPTED: { label: "Aceptada", className: "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100" },
  REJECTED: { label: "Rechazada", className: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100" },
  EXPIRED: { label: "Expirada", className: "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200" },
};

export function QuoteStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
