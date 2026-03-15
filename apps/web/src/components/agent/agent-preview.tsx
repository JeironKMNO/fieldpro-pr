"use client";

import { useEffect, useState } from "react";
import type {
  PreviewPayload,
  PreviewQuote,
  ClientSummary,
  DashboardStats,
} from "@/server/services/agent-tools";
import { QuotePreview } from "@/components/quotes/quote-preview";

// ── Lazy-loaded detail components ─────────────────────────────
import dynamic from "next/dynamic";

const JobDetail = dynamic(
  () => import("@/components/jobs/job-detail").then((m) => m.JobDetail),
  { ssr: false, loading: () => <PreviewSkeleton label="Cargando trabajo..." /> }
);

const InvoiceDetail = dynamic(
  () =>
    import("@/components/invoices/invoice-detail").then((m) => m.InvoiceDetail),
  { ssr: false, loading: () => <PreviewSkeleton label="Cargando factura..." /> }
);

// ── Skeletons ─────────────────────────────────────────────────

function PreviewSkeleton({ label }: { label?: string }) {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-400">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      {label ?? "Cargando..."}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────

function EmptyPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-3xl">
        ✦
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">
          Vista previa en vivo
        </p>
        <p className="mt-1 max-w-xs text-xs text-gray-400">
          El panel se actualizará automáticamente mientras el agente trabaja
          contigo.
        </p>
      </div>
    </div>
  );
}

// ── Dashboard Stats ───────────────────────────────────────────

function DashboardPreview({ data }: { data: DashboardStats }) {
  const stats = [
    {
      label: "Clientes Activos",
      value: data.activeClients,
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: "Cotizaciones Abiertas",
      value: data.openQuotes,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Trabajos en Progreso",
      value: data.activeJobs,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Facturas Pendientes",
      value: data.pendingInvoices,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        Resumen del Negocio
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-0.5 text-xs opacity-80">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <p className="text-xs text-gray-500">Total cobrado (pagado)</p>
        <p className="mt-1 text-xl font-semibold text-gray-800">
          $
          {data.totalPaid.toLocaleString("en-PR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

// ── Client List ───────────────────────────────────────────────

function ClientListPreview({ data }: { data: ClientSummary[] }) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        No se encontraron clientes.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Clientes encontrados
      </h3>
      <div className="flex flex-col gap-2">
        {data.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">{c.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  c.type === "COMMERCIAL"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-teal-50 text-teal-700"
                }`}
              >
                {c.type === "COMMERCIAL" ? "Comercial" : "Residencial"}
              </span>
            </div>
            {c.email && (
              <p className="mt-0.5 text-xs text-gray-400">{c.email}</p>
            )}
            {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

interface AgentPreviewProps {
  preview: PreviewPayload | null;
}

export function AgentPreview({ preview }: AgentPreviewProps) {
  const [clientKey, setClientKey] = useState(0);

  // Force re-render when client id changes
  useEffect(() => {
    if (preview?.type === "client") {
      setClientKey((k) => k + 1);
    }
  }, [preview]);

  const content = (() => {
    if (!preview) return <EmptyPreview />;

    switch (preview.type) {
      case "quote":
        return (
          <div className="overflow-auto">
            <QuotePreview quote={preview.data as PreviewQuote} />
          </div>
        );

      case "client":
        // ClientDetail fetches its own data via tRPC using the id
        // We use a ClientPreviewWrapper to avoid edit buttons
        return (
          <ClientPreviewWrapper
            key={`${clientKey}-${preview.id}`}
            clientId={preview.id}
          />
        );

      case "job":
        return <JobDetail initialJob={{ id: preview.id }} />;

      case "invoice":
        return <InvoiceDetail initialInvoice={{ id: preview.id }} />;

      case "client-list":
        return <ClientListPreview data={preview.data} />;

      case "dashboard":
        return <DashboardPreview data={preview.data} />;

      default:
        return <EmptyPreview />;
    }
  })();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50">
      {/* Preview header */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-2.5">
        <div className="h-2 w-2 rounded-full bg-teal-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Vista previa en vivo
        </span>
        {preview && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
            {preview.type === "quote" && "Cotización"}
            {preview.type === "client" && "Cliente"}
            {preview.type === "job" && "Trabajo"}
            {preview.type === "invoice" && "Factura"}
            {preview.type === "client-list" && "Búsqueda"}
            {preview.type === "dashboard" && "Dashboard"}
          </span>
        )}
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto">{content}</div>
    </div>
  );
}

// ── Client Preview Wrapper ────────────────────────────────────
// Wraps ClientDetail in read-only context (just renders it; the
// existing component already handles its own data fetching)

import { trpc } from "@/lib/trpc/client";

function ClientPreviewWrapper({ clientId }: { clientId: string }) {
  const { data, isLoading } = trpc.clients.byId.useQuery({ id: clientId });

  if (isLoading) return <PreviewSkeleton label="Cargando cliente..." />;
  if (!data)
    return (
      <div className="p-6 text-sm text-gray-400">Cliente no encontrado.</div>
    );

  return (
    <div className="p-4">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {data.name}
            </h3>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                data.type === "COMMERCIAL"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-teal-50 text-teal-700"
              }`}
            >
              {data.type === "COMMERCIAL" ? "Comercial" : "Residencial"}
            </span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              data.status === "ACTIVE"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {data.status === "ACTIVE" ? "Activo" : data.status}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-gray-600">
          {data.email && (
            <p>
              <span className="font-medium">Email:</span> {data.email}
            </p>
          )}
          {data.phone && (
            <p>
              <span className="font-medium">Teléfono:</span> {data.phone}
            </p>
          )}
          {data.addresses?.[0] && (
            <p>
              <span className="font-medium">Dirección:</span>{" "}
              {data.addresses[0].street}, {data.addresses[0].city}, PR{" "}
              {data.addresses[0].zipCode}
            </p>
          )}
        </div>

        {data.notes && data.notes.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <p className="mb-1.5 text-xs font-medium text-gray-500">
              Notas recientes
            </p>
            {data.notes
              .slice(0, 2)
              .map((note: { id: string; content: string }) => (
                <p key={note.id} className="text-xs text-gray-600">
                  {note.content}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
