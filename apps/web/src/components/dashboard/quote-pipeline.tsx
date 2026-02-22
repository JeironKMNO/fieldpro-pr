"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";

const STATUS_CONFIG: {
  key: string;
  label: string;
  color: string;
  bg: string;
}[] = [
  { key: "DRAFT", label: "Borrador", color: "bg-slate-600", bg: "bg-slate-100" },
  { key: "SENT", label: "Enviada", color: "bg-blue-500", bg: "bg-stone-100" },
  { key: "VIEWED", label: "Vista", color: "bg-orange-500", bg: "bg-stone-100" },
  { key: "ACCEPTED", label: "Aceptada", color: "bg-emerald-500", bg: "bg-stone-100" },
  { key: "REJECTED", label: "Rechazada", color: "bg-red-500", bg: "bg-stone-100" },
  { key: "EXPIRED", label: "Expirada", color: "bg-slate-500", bg: "bg-stone-100" },
];

interface QuotePipelineProps {
  counts: Record<string, number>;
  total: number;
}

export function QuotePipeline({ counts, total }: QuotePipelineProps) {
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <Card className="h-full card-fieldpro">
      <CardHeader className="pb-4">
        <CardTitle className="text-base text-stone-900">Pipeline de Cotizaciones</CardTitle>
        <p className="text-sm text-slate-500">
          {total} cotizaciones en total
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {STATUS_CONFIG.map(({ key, label, color, bg }) => {
          const count = counts[key] ?? 0;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-stone-600">{label}</span>
                <span className="text-stone-500 font-medium">{count}</span>
              </div>
              <div className={`h-2 w-full rounded-full ${bg}`}>
                <div
                  className={`h-full rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
