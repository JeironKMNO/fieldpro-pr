"use client";

interface PreviewQuote {
  quoteNumber: string;
  title: string | null;
  createdAt: Date | string;
  validUntil: Date | string | null;
  notes: string | null;
  subtotal: unknown;
  taxRate: unknown;
  taxAmount: unknown;
  total: unknown;
  organization: {
    name: string;
    logoUrl?: string | null;
    phone?: string | null;
    license?: string | null;
  };
  client: {
    name: string;
    email: string | null;
    phone: string | null;
    addresses: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    }[];
  };
  sections: {
    id: string;
    subtotal: unknown;
    category: { name: string };
    items: {
      id: string;
      description: string;
      unitType: string;
      quantity: unknown;
      unitPrice: unknown;
      total: unknown;
      length: unknown;
      width: unknown;
    }[];
  }[];
}

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-PR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function QuotePreview({ quote }: { quote: PreviewQuote }) {
  const primaryAddress = quote.client.addresses[0];
  const { logoUrl, phone, license } = quote.organization;
  const hasCompanyDetails = phone || license;

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden print:border-none print:shadow-none">
      {/* ── Header ── */}
      <div className="bg-slate-900 px-10 py-8 text-white relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt={quote.organization.name}
                className="h-16 w-16 rounded-lg object-contain bg-white/10 p-1.5 shadow-inner"
              />
            ) : null}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {quote.organization.name}
              </h1>
              {hasCompanyDetails ? (
                <p className="mt-1.5 text-xs text-slate-400 font-medium tracking-wide">
                  {[
                    license ? `Lic. ${license}` : null,
                    phone ? `Tel. ${phone}` : null,
                  ]
                    .filter(Boolean)
                    .join("  |  ")}
                </p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              Propuesta de Servicios
            </p>
            <h2 className="text-xl font-bold tracking-tight">
              {quote.quoteNumber}
            </h2>
            {quote.title ? (
              <p className="mt-1 text-sm text-slate-300">{quote.title}</p>
            ) : null}
            <p className="mt-2 text-xs text-slate-400">
              {formatDate(quote.createdAt)}
            </p>
            {quote.validUntil ? (
              <p className="text-xs text-slate-400 mt-0.5">
                Válida hasta: {formatDate(quote.validUntil)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Emerald Accent Stripe */}
      <div className="h-1.5 w-full bg-emerald-500" />

      {/* ── Client info ── */}
      <div className="bg-slate-50 px-10 py-6 border-b border-slate-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Facturar a
        </p>
        <p className="font-bold text-slate-900 text-lg">{quote.client.name}</p>
        <div className="mt-2 space-y-1">
          {quote.client.email ? (
            <p className="text-sm text-slate-600">{quote.client.email}</p>
          ) : null}
          {quote.client.phone ? (
            <p className="text-sm text-slate-600">{quote.client.phone}</p>
          ) : null}
          {primaryAddress ? (
            <p className="text-sm text-slate-600">
              {primaryAddress.street}, {primaryAddress.city},{" "}
              {primaryAddress.state} {primaryAddress.zipCode}
            </p>
          ) : null}
        </div>
      </div>

      <div className="px-10 pb-10 pt-8">
        {/* ── Sections ── */}
        <div className="space-y-10">
          {quote.sections.map((section, sectionIndex) => (
            <div key={section.id} className="relative">
              <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 rounded-full" />
              <div className="pl-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700">
                    {sectionIndex + 1}
                  </span>
                  {section.category.name}
                </h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-xs text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-5 text-left font-semibold">
                          Desglose de Trabajo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {section.items.map((item, rowIndex) => (
                        <tr
                          key={item.id}
                          className={
                            rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }
                        >
                          <td className="py-3 px-5 text-slate-700">
                            <div className="flex items-start gap-3">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="leading-relaxed">
                                {item.description}
                              </span>
                            </div>
                            {Number(item.length) > 0 &&
                            Number(item.width) > 0 ? (
                              <div className="ml-4.5 mt-1 text-xs text-slate-400">
                                Dimensiones: {Number(item.length)} ×{" "}
                                {Number(item.width)}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Totals ── */}
        <div className="mt-12 flex justify-end">
          <div className="w-full max-w-sm rounded-xl border-2 border-emerald-500 bg-emerald-50/30 overflow-hidden shadow-sm">
            <div className="bg-emerald-500 px-4 py-2 text-center">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">
                Inversión Total
              </h4>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-700 tracking-tight">
                {formatCurrency(quote.total)}
              </div>
              <p className="mt-3 text-[10px] font-medium text-emerald-600/80 uppercase tracking-widest">
                (Materiales, Mano de Obra e Impuestos)
              </p>
            </div>
          </div>
        </div>

        {/* ── Terms & Signatures ── */}
        <div className="mt-12 pt-8 border-t border-slate-200 space-y-10">
          {quote.notes ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Términos y Condiciones
              </p>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {quote.notes}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Al firmar este documento, ambas partes acuerdan los trabajos y la
              inversión descritos anteriormente.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    Contratista
                  </p>
                </div>
                <div className="p-5 pt-16">
                  <div className="border-b border-slate-300 mb-3" />
                  <p className="text-xs font-medium text-slate-600">
                    {quote.organization.name}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    Cliente
                  </p>
                </div>
                <div className="p-5 pt-16">
                  <div className="border-b border-slate-300 mb-3" />
                  <p className="text-xs font-medium text-slate-600">
                    {quote.client.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
