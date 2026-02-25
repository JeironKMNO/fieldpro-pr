"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { TrendingUp } from "lucide-react";

interface ProfitMetrics {
  completedJobValue: number;
  totalExpenses: number;
  totalPaidInvoices: number;
  netProfit: number;
  profitMargin: number;
}

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function MarginBadge({ margin }: { margin: number }) {
  let label: string;
  let className: string;

  if (margin >= 30) {
    label = "Excelente";
    className = "bg-emerald-100 text-emerald-700";
  } else if (margin >= 15) {
    label = "Bueno";
    className = "bg-amber-100 text-amber-700";
  } else if (margin >= 0) {
    label = "Ajustado";
    className = "bg-orange-100 text-orange-700";
  } else {
    label = "Pérdida";
    className = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function MarginBar({ margin }: { margin: number }) {
  const pct = Math.max(0, Math.min(100, margin));
  let barColor: string;

  if (margin >= 30) barColor = "bg-emerald-500";
  else if (margin >= 15) barColor = "bg-amber-500";
  else if (margin >= 0) barColor = "bg-orange-500";
  else barColor = "bg-red-500";

  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 mt-2">
      <div
        className={`h-full rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProfitMarginCard({
  profitMetrics,
}: {
  profitMetrics: ProfitMetrics;
}) {
  const { completedJobValue, totalExpenses, netProfit, profitMargin } =
    profitMetrics;

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-slate-900">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Rentabilidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Valor Completado */}
          <div>
            <p className="text-xs text-slate-500">Trabajos Completados</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900 tabular-nums">
              {fmt(completedJobValue)}
            </p>
          </div>

          {/* Gastos Totales */}
          <div>
            <p className="text-xs text-slate-500">Gastos Totales</p>
            <p className="mt-0.5 text-xl font-bold text-orange-600 tabular-nums">
              {fmt(totalExpenses)}
            </p>
          </div>

          {/* Ganancia Neta */}
          <div>
            <p className="text-xs text-slate-500">Ganancia Neta</p>
            <p
              className={`mt-0.5 text-xl font-bold tabular-nums ${
                netProfit >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {fmt(netProfit)}
            </p>
          </div>

          {/* Margen % */}
          <div>
            <p className="text-xs text-slate-500">Margen</p>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                {profitMargin.toFixed(1)}%
              </p>
              <MarginBadge margin={profitMargin} />
            </div>
            <MarginBar margin={profitMargin} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
