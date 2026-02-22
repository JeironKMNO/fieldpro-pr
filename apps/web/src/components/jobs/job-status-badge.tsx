"use client";

import { Badge } from "@fieldpro/ui/components/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  SCHEDULED: { label: "Programado", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  IN_PROGRESS: { label: "En Progreso", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  ON_HOLD: { label: "En Espera", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" },
  COMPLETED: { label: "Completado", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

export function JobStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.SCHEDULED;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
