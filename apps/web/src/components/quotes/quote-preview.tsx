"use client";

import { Separator } from "@fieldpro/ui/components/separator";

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

const UNIT_LABELS: Record<string, string> = {
  SQ_FT: "pie²",
  LINEAR_FT: "pie lin.",
  CUBIC_YD: "yd³",
  UNIT: "unidad",
  HOUR: "hora",
  LUMP_SUM: "global",
};

export function QuotePreview({ quote }: { quote: PreviewQuote }) {
  const primaryAddress = quote.client.addresses[0];
  const { logoUrl, phone, license } = quote.organization;
  const hasCompanyDetails = phone || license;

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-lg border bg-white p-8 shadow-sm print:border-none print:shadow-none">
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={quote.organization.name}
              className="h-12 w-12 rounded object-contain"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {quote.organization.name}
            </h1>
            {hasCompanyDetails ? (
              <p className="text-sm text-muted-foreground">
                {[
                  license ? `Lic. ${license}` : null,
                  phone ? `Tel. ${phone}` : null,
                ]
                  .filter(Boolean)
                  .join(" | ")}
              </p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">{quote.quoteNumber}</h2>
          {quote.title && (
            <p className="text-muted-foreground">{quote.title}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Fecha: {formatDate(quote.createdAt)}
          </p>
          {quote.validUntil && (
            <p className="text-sm text-muted-foreground">
              Válida Hasta: {formatDate(quote.validUntil)}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Bill To */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Facturar A
        </p>
        <p className="mt-1 font-semibold">{quote.client.name}</p>
        {quote.client.email && (
          <p className="text-sm text-muted-foreground">{quote.client.email}</p>
        )}
        {quote.client.phone && (
          <p className="text-sm text-muted-foreground">{quote.client.phone}</p>
        )}
        {primaryAddress && (
          <p className="text-sm text-muted-foreground">
            {primaryAddress.street}, {primaryAddress.city},{" "}
            {primaryAddress.state} {primaryAddress.zipCode}
          </p>
        )}
      </div>

      {/* Sections */}
      {quote.sections.map((section) => (
        <div key={section.id}>
          <h3 className="mb-3 font-semibold uppercase tracking-wider text-primary">
            {section.category.name}
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Descripción</th>
                <th className="pb-2 font-medium text-right">Cant.</th>
                <th className="pb-2 font-medium text-right">Unidad</th>
                <th className="pb-2 font-medium text-right">Precio</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => (
                <tr key={item.id} className="border-b border-dashed">
                  <td className="py-2">
                    {item.description}
                    {Number(item.length) > 0 && Number(item.width) > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({Number(item.length)} x {Number(item.width)} ft)
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {Number(item.quantity).toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    {UNIT_LABELS[item.unitType] ?? item.unitType}
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="pt-2 text-right font-medium">
                  Subtotal Sección:
                </td>
                <td className="pt-2 text-right font-medium">
                  {formatCurrency(section.subtotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}

      <Separator />

      {/* Totals */}
      <div className="ml-auto max-w-xs space-y-1">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(quote.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>IVU ({(Number(quote.taxRate) * 100).toFixed(1)}%)</span>
          <span>{formatCurrency(quote.taxAmount)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>{formatCurrency(quote.total)}</span>
        </div>
      </div>

      {/* Terms */}
      {quote.notes && (
        <div>
          <Separator />
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Términos y Condiciones
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {quote.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
