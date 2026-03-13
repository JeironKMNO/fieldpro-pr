"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";

interface MonthData {
  month: string;
  label: string;
  invoiceRevenue: number; // total billed (paid + pending)
  invoicePaid: number; // cash actually collected
  invoicePending: number; // billed but not yet paid
  expenses: number;
}

function fmtUSD(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-slate-500">
            {p.name === "invoiceRevenue"
              ? "Facturado:"
              : p.name === "invoicePaid"
                ? "Cobrado:"
                : "Gastos:"}
          </span>
          <span className="font-medium text-slate-800">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({
  data,
  rangeLabel = "Últimos 6 meses",
}: {
  data: MonthData[];
  rangeLabel?: string;
}) {
  const totalRevenue = data.reduce((s, d) => s + d.invoiceRevenue, 0);

  return (
    <Card className="h-full border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-slate-900">
          Ingresos vs Gastos
        </CardTitle>
        <p className="text-sm text-slate-500">
          {rangeLabel} &middot;{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(totalRevenue)}{" "}
          facturado
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">
            Aún no hay datos financieros
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmtUSD}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) =>
                  value === "invoiceRevenue"
                    ? "Facturado"
                    : value === "invoicePaid"
                      ? "Cobrado"
                      : "Gastos"
                }
              />
              <Area
                type="monotone"
                dataKey="invoicePaid"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradRevenue)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981" }}
              />
              <Area
                type="monotone"
                dataKey="invoiceRevenue"
                stroke="#059669"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                fill="none"
                dot={false}
                activeDot={{ r: 3, fill: "#059669" }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#gradExpenses)"
                dot={false}
                activeDot={{ r: 4, fill: "#f97316" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
