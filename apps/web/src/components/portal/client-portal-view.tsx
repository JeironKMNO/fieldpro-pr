import Link from "next/link";
import type { PortalData } from "@/server/data/portal";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

function fmtUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-PR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function ClientPortalView({ data }: { data: PortalData }) {
  const { client, organization, quotes, invoices, stats } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          {organization.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.logoUrl}
              alt={organization.name}
              className="h-12 w-12 rounded-lg object-contain border border-slate-100"
            />
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {organization.name}
            </h1>
            {organization.phone && (
              <p className="text-sm text-slate-500">{organization.phone}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Hola, {client.name}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Aquí puedes ver el estado de tus cotizaciones y facturas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Cotizaciones"
            value={String(stats.totalQuotes)}
            sub={`${stats.acceptedQuotes} aceptadas`}
          />
          <StatCard
            label="Aceptadas"
            value={String(stats.acceptedQuotes)}
            sub={
              stats.totalQuotes > 0
                ? `${Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100)}% del total`
                : undefined
            }
          />
          <StatCard
            label="Balance Pendiente"
            value={fmtUSD(stats.outstandingAmount)}
            sub="por pagar"
          />
          <StatCard label="Total Pagado" value={fmtUSD(stats.paidAmount)} />
        </div>

        {/* Quotes */}
        <section>
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            Cotizaciones
          </h3>
          {quotes.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-6 text-center text-sm text-slate-400">
              No hay cotizaciones aún.
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                      Número
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                      Estado
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                      Fecha
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {q.quoteNumber}
                      </td>
                      <td className="px-4 py-3">
                        <QuoteStatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular-nums">
                        {fmtUSD(q.total)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {fmtDate(q.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/quotes/share/${q.shareToken}`}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Invoices */}
        <section>
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            Facturas
          </h3>
          {invoices.length === 0 ? (
            <div className="rounded-xl bg-white border border-slate-200 p-6 text-center text-sm text-slate-400">
              No hay facturas aún.
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                      Número
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                      Estado
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">
                      Vence
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular-nums">
                        {fmtUSD(inv.total)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {inv.paidAt
                          ? `Pagada ${fmtDate(inv.paidAt)}`
                          : fmtDate(inv.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/invoices/share/${inv.shareToken}`}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="rounded-xl bg-white border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            ¿Tienes preguntas?
          </h3>
          <p className="text-sm text-slate-500">
            Contáctanos directamente con {organization.name}.
          </p>
          {organization.phone && (
            <a
              href={`tel:${organization.phone}`}
              className="inline-block mt-2 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              {organization.phone}
            </a>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 pb-8">
          Powered by FieldPro PR
        </footer>
      </main>
    </div>
  );
}
