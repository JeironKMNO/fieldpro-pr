"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  DollarSign,
  Clock,
  FileText,
  Users,
  TrendingUp,
  Briefcase,
  Receipt,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { KpiCard } from "./kpi-card";
import { QuotePipeline } from "./quote-pipeline";
import { RevenueChart } from "./revenue-chart";
import { ProfitMarginCard } from "./profit-margin-card";
import { RecentQuotesTable } from "./recent-quotes-table";
import { RecentClients } from "./recent-clients";
import { NeedsAttention } from "./needs-attention";
import { OverdueInvoicesWidget } from "./overdue-invoices";
import { TopClientsWidget } from "./top-clients";
import { DateRangeSelector, type DateRange } from "./date-range-selector";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function SkeletonCard() {
  return (
    <Card className="card-fieldpro">
      <CardHeader className="pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-stone-100" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-32 animate-pulse rounded bg-stone-200" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-stone-200" />
      </CardContent>
    </Card>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <Card className={`card-fieldpro ${className || ""}`}>
      <CardHeader className="pb-3">
        <div className="h-5 w-36 animate-pulse rounded bg-stone-200" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full animate-pulse rounded bg-stone-200"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const [range, setRange] = useState<DateRange>("6m");

  const { data, isLoading, error } = trpc.organization.dashboardStats.useQuery({
    range,
  });

  if (error) {
    const isNoOrg = error.data?.code === "UNAUTHORIZED";
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        {isNoOrg ? (
          <>
            <div className="text-4xl mb-3">🏢</div>
            <p className="text-stone-700 font-medium text-sm">
              Selecciona o crea una organización
            </p>
            <p className="text-stone-400 text-xs mt-1 max-w-xs">
              Usa el selector de organización en la barra superior para
              seleccionar tu empresa o crear una nueva.
            </p>
          </>
        ) : (
          <>
            <p className="text-stone-500 text-sm">
              No se pudo cargar el panel.
            </p>
            <p className="text-stone-400 text-xs mt-1">
              Error: {error.data?.code ?? "UNKNOWN"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs text-teal-600 underline hover:text-teal-700"
            >
              Reintentar
            </button>
          </>
        )}
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonBlock className="h-full" />
          <SkeletonBlock className="h-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonBlock className="h-full" />
          <SkeletonBlock className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex justify-end">
        <DateRangeSelector value={range} onRangeChange={setRange} />
      </div>

      {/* Row 1: Vital Financial KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ganancia Neta"
          value={fmt(data.profitMetrics.netProfit)}
          icon={TrendingUp}
          description={`Margen: ${data.profitMetrics.profitMargin.toFixed(1)}%`}
          variant="primary"
        />
        <KpiCard
          title="Cobrado"
          value={fmt(data.profitMetrics.completedJobValue)}
          icon={DollarSign}
          description={`${data.jobCounts.COMPLETED} trabajos completados`}
          variant="default"
        />
        <KpiCard
          title="Por Cobrar"
          value={fmt(data.invoiceRevenue.outstanding)}
          icon={Receipt}
          description={`${data.invoiceCounts.outstanding} facturas pendientes`}
          variant="default"
        />
        <KpiCard
          title="Gastos Totales"
          value={fmt(data.profitMetrics.totalExpenses)}
          icon={Clock}
          description="Total acumulado"
          variant="default"
        />
      </div>

      {/* Row 2: Additional KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Tasa de Conversión"
          value={`${data.conversionRate}%`}
          icon={Target}
          description={`${data.quoteCounts.ACCEPTED} aceptadas / ${data.quoteCounts.ACCEPTED + data.quoteCounts.REJECTED} respondidas`}
          variant="default"
        />
        <KpiCard
          title="Facturas Vencidas"
          value={String(data.invoiceCounts.OVERDUE)}
          icon={Receipt}
          description={
            data.invoiceCounts.OVERDUE > 0
              ? "Requieren cobro inmediato"
              : "Todo al día"
          }
          variant="default"
        />
        <KpiCard
          title="Trabajos Activos"
          value={String(data.jobCounts.active)}
          icon={Briefcase}
          description={`${data.jobCounts.SCHEDULED} programados, ${data.jobCounts.IN_PROGRESS} en progreso`}
          variant="default"
        />
      </div>

      {/* Row 3: Alert widgets */}
      {data.needsAttention.length > 0 && (
        <div className="pt-2">
          <NeedsAttention items={data.needsAttention} />
        </div>
      )}
      {data.overdueInvoices.length > 0 && (
        <div className="pt-2">
          <OverdueInvoicesWidget items={data.overdueInvoices} />
        </div>
      )}

      {/* Row 4: Pipeline + Revenue Chart */}
      <div className="grid gap-4 md:grid-cols-2 pt-2">
        <RevenueChart
          data={data.monthlyFinancials}
          rangeLabel={data.rangeLabel}
        />
        <QuotePipeline
          counts={data.quoteCounts}
          total={data.quoteCounts.total}
        />
      </div>

      {/* Row 5: Operational Metrics & Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3 pt-4">
        {/* Total Quotes vs Pending */}
        <Card className="card-fieldpro">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <FileText className="h-4 w-4" />
              Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-stone-900 tabular-nums">
              {data.quoteCounts.total}
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              {data.quoteCounts.SENT + data.quoteCounts.VIEWED} pendientes de
              aprobación
            </p>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="card-fieldpro">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <Users className="h-4 w-4" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-stone-900 tabular-nums">
              {data.clientCounts.total}
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              {data.clientCounts.active} clientes activos actualmente
            </p>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <ProfitMarginCard profitMetrics={data.profitMetrics} />
      </div>

      {/* Row 6: Recent Quotes + Recent Clients */}
      <div className="grid gap-4 md:grid-cols-2 pt-2">
        <RecentQuotesTable quotes={data.recentQuotes} />
        <RecentClients clients={data.recentClients} />
      </div>

      {/* Row 7: Top Clients */}
      {data.topClients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 pt-2">
          <TopClientsWidget clients={data.topClients} />
        </div>
      )}
    </div>
  );
}
