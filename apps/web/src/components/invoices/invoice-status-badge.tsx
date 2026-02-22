import { Badge } from "@fieldpro/ui/components/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Borrador",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
  SENT: {
    label: "Enviada",
    className: "bg-sky-50 text-sky-700 border-sky-300",
  },
  VIEWED: {
    label: "Vista",
    className: "bg-teal-50 text-teal-700 border-teal-300",
  },
  PAID: {
    label: "Pagada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  OVERDUE: {
    label: "Vencida",
    className: "bg-red-50 text-red-700 border-red-300",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-slate-100 text-slate-500 border-slate-300",
  },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
