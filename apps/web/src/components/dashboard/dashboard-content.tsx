"use client";

import { trpc } from "@/lib/trpc/client";
import { DollarSign, Clock, FileText, Users, TrendingUp, Building2, PenLine, Briefcase, Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { KpiCard } from "./kpi-card";
import { QuotePipeline } from "./quote-pipeline";
import { RevenueChart } from "./revenue-chart";
import { RecentQuotesTable } from "./recent-quotes-table";
import { RecentClients } from "./recent-clients";
import { NeedsAttention } from "./needs-attention";

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
            <div key={i} className="h-4 w-full animate-pulse rounded bg-stone-200" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const { data, isLoading } = trpc.organization.dashboardStats.useQuery();

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
      {/* Row 1: KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Cobrado"
          value={fmt(data.invoiceRevenue.paid)}
          icon={DollarSign}
          description={`${data.invoiceCounts.PAID} facturas pagadas`}
          variant="primary"
        />
        <KpiCard
          title="Por Cobrar"
          value={fmt(data.invoiceRevenue.outstanding)}
          icon={Receipt}
          description={`${data.invoiceCounts.outstanding} facturas por cobrar`}
        />
        <KpiCard
          title="Pipeline"
          value={fmt(data.revenue.pending)}
          icon={Clock}
          description={`${data.quoteCounts.SENT + data.quoteCounts.VIEWED} cotizaciones pendientes`}
        />
      </div>

      {/* Row 2: Activity KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Cotizaciones"
          value={String(data.quoteCounts.total)}
          icon={FileText}
          description={`${data.quoteCounts.DRAFT} borradores, ${data.quoteCounts.SENT + data.quoteCounts.VIEWED} pendientes`}
        />
        <KpiCard
          title="Trabajos Activos"
          value={String(data.jobCounts.active)}
          icon={Briefcase}
          description={`${data.jobCounts.SCHEDULED} programados, ${data.jobCounts.IN_PROGRESS} en progreso`}
        />
        <KpiCard
          title="Facturas"
          value={String(data.invoiceCounts.DRAFT + data.invoiceCounts.SENT + data.invoiceCounts.VIEWED)}
          icon={Receipt}
          description={`${data.invoiceCounts.DRAFT} borradores, ${data.invoiceCounts.OVERDUE} vencidas`}
        />
        <KpiCard
          title="Clientes"
          value={String(data.clientCounts.total)}
          icon={Users}
          description={`${data.clientCounts.active} activos`}
        />
      </div>

      {/* Needs Attention */}
      {data.needsAttention.length > 0 && (
        <NeedsAttention items={data.needsAttention} />
      )}

      {/* Row 2: Pipeline + Revenue Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuotePipeline
          counts={data.quoteCounts}
          total={data.quoteCounts.total}
        />
        <RevenueChart data={data.monthlyRevenue} />
      </div>

      {/* Row 3: Recent Quotes + Recent Clients */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentQuotesTable quotes={data.recentQuotes} />
        <RecentClients clients={data.recentClients} />
      </div>

      {/* Row 4: Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Conversion Rate */}
        <Card className="card-fieldpro">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <TrendingUp className="h-4 w-4" />
              Tasa de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="font-heading text-3xl font-bold text-stone-900">{data.conversionRate}%</div>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{
                      width: `${data.conversionRate}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {data.quoteCounts.ACCEPTED} aceptadas de{" "}
                  {data.quoteCounts.ACCEPTED + data.quoteCounts.REJECTED} decididas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Breakdown */}
        <Card className="card-fieldpro">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <Building2 className="h-4 w-4" />
              Tipos de Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-400">Residencial</span>
                <span className="font-heading text-lg font-bold text-stone-900">{data.clientCounts.residential}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-400">Comercial</span>
                <span className="font-heading text-lg font-bold text-stone-900">{data.clientCounts.commercial}</span>
              </div>
              {data.clientCounts.total > 0 ? (
                <div className="flex h-2 overflow-hidden rounded-full bg-stone-200 mt-1">
                  <div
                    className="rounded-l-full bg-blue-600"
                    style={{
                      width: `${(data.clientCounts.residential / data.clientCounts.total) * 100}%`,
                    }}
                  />
                  <div
                    className="rounded-r-full bg-orange-500"
                    style={{
                      width: `${(data.clientCounts.commercial / data.clientCounts.total) * 100}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Draft Pipeline Value */}
        <Card className="card-fieldpro">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-500">
              <PenLine className="h-4 w-4" />
              Borradores en Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-bold text-stone-900">{fmt(data.revenue.draft)}</div>
            <p className="mt-1.5 text-xs text-stone-500">
              {data.quoteCounts.DRAFT} cotizaciones en borrador
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
