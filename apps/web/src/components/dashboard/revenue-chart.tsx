"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";

interface MonthData {
  month: string;
  label: string;
  total: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(0)}`;
}

export function RevenueChart({ data }: { data: MonthData[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const totalRevenue = data.reduce((s, d) => s + d.total, 0);

  return (
    <Card className="h-full border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-base text-slate-900">Ingresos Mensuales</CardTitle>
        <p className="text-sm text-slate-500">
          Últimos 6 meses &middot;{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(totalRevenue)}{" "}
          total
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">
            Aún no hay datos de ingresos
          </div>
        ) : (
          <div className="flex h-48 items-end gap-3">
            {data.map((d) => {
              const heightPct = (d.total / maxTotal) * 100;
              return (
                <div
                  key={d.month}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs text-slate-500">
                    {formatCurrency(d.total)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-emerald-500/80 transition-all hover:bg-emerald-500"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                    }}
                  />
                  <span className="text-xs font-medium text-slate-500">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
