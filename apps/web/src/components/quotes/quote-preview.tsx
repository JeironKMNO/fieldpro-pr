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
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const DEFAULT_CONDITIONS = [
  "Cualquier trabajo adicional no especificado en esta propuesta será considerado trabajo extra y requerirá una orden de cambio aprobada y firmada por el cliente.",
  "El tiempo estimado de ejecución podrá variar dependiendo de condiciones imprevistas del proyecto o factores fuera del control del contratista.",
  "Cambios solicitados por el cliente durante la ejecución del proyecto podrían afectar el costo final y el tiempo de entrega.",
  "Esta cotización tiene validez de 30 días a partir de la fecha de emisión, sujeta a disponibilidad de materiales y mano de obra.",
];

const INCLUDED_SERVICES = [
  {
    text: "Los materiales necesarios para la ejecución del proyecto (excepto los provistos por el cliente).",
    bold: false,
  },
  { text: "Mano de obra especializada.", bold: false },
  { text: "Herramientas y equipo necesario.", bold: false },
  {
    text: "Disposición de escombros generados durante el proyecto.",
    bold: true,
  },
];

function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-start gap-3 mt-7 mb-3">
      <span
        className="text-2xl font-bold leading-none"
        style={{ color: "#C9962B" }}
      >
        {num}
      </span>
      <h3 className="text-xl font-bold" style={{ color: "#1B2661" }}>
        {title}
      </h3>
    </div>
  );
}

export function QuotePreview({ quote }: { quote: PreviewQuote }) {
  const primaryAddress = quote.client.addresses[0];
  const { logoUrl, phone, license } = quote.organization;
  const taxRate = Number(quote.taxRate);
  const taxAmount = Number(quote.taxAmount);
  const subtotal = Number(quote.subtotal);
  const hasTax = taxAmount > 0 && subtotal > 0;

  const categoryList = quote.sections
    .map((s) => s.category.name.toLowerCase())
    .join(", ");

  const projectDesc = `El presente documento describe los trabajos de ${categoryList} a realizar en la propiedad${primaryAddress ? ` ubicada en ${primaryAddress.city}` : " del cliente"}. Los trabajos incluyen ${categoryList}. Todos los trabajos serán ejecutados por personal especializado siguiendo los estándares de construcción aplicables en Puerto Rico.`;

  return (
    <div
      className="mx-auto max-w-3xl bg-white shadow-xl overflow-hidden print:shadow-none print:border-none"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ── HEADER ── */}
      <div className="px-10 pt-8 pb-4 flex items-start gap-4">
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={quote.organization.name}
            className="h-16 w-16 object-contain border border-gray-200 rounded"
          />
        ) : null}
        <div>
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ color: "#1B2661" }}
          >
            {quote.organization.name}
          </h1>
          <p className="text-[11px] text-gray-400 tracking-widest uppercase mt-1">
            SERVICIOS DE CONSTRUCCIÓN Y REMODELACIÓN
          </p>
          {license ? (
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-semibold text-gray-600">Licencia:</span>{" "}
              {license}
            </p>
          ) : null}
          {phone ? (
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-semibold text-gray-600">Teléfono:</span>{" "}
              {phone}
            </p>
          ) : null}
        </div>
      </div>

      {/* ── WATERMARK ── */}
      <div className="text-center px-10 py-1 select-none overflow-hidden">
        <p
          className="text-7xl font-bold tracking-[0.25em] leading-none"
          style={{ color: "#EBEBEB" }}
        >
          COTIZACIÓN
        </p>
      </div>

      {/* ── SEPARATOR ── */}
      <div className="mx-10 border-t border-gray-300 my-3" />

      {/* ── INFO BOX ── */}
      <div
        className="mx-10 mb-6 rounded-md p-4 space-y-1.5"
        style={{ backgroundColor: "#EBF2FD" }}
      >
        {quote.title ? (
          <p className="text-sm">
            <span className="font-bold" style={{ color: "#1B2661" }}>
              Proyecto:
            </span>{" "}
            <span style={{ color: "#1B2661" }}>{quote.title}</span>
          </p>
        ) : null}
        <p className="text-sm">
          <span className="font-bold" style={{ color: "#1B2661" }}>
            Fecha:
          </span>{" "}
          <span style={{ color: "#1B2661" }}>
            {formatDate(quote.createdAt)}
          </span>
        </p>
        <p className="text-sm">
          <span className="font-bold" style={{ color: "#1B2661" }}>
            Cliente:
          </span>{" "}
          <span style={{ color: "#1B2661" }}>{quote.client.name}</span>
        </p>
        {primaryAddress ? (
          <p className="text-sm">
            <span className="font-bold" style={{ color: "#1B2661" }}>
              Dirección:
            </span>{" "}
            <span style={{ color: "#1B2661" }}>
              {primaryAddress.street}, {primaryAddress.city},{" "}
              {primaryAddress.state}
            </span>
          </p>
        ) : null}
      </div>

      {/* ── CONTENT ── */}
      <div className="px-10 pb-10">
        {/* SECCIÓN 1: DESCRIPCIÓN */}
        <SectionHeader num={1} title="Descripción del Proyecto" />
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {projectDesc}
        </p>

        {/* SECCIÓN 2: ALCANCE */}
        <SectionHeader num={2} title="Alcance de los Trabajos" />
        <div className="space-y-6">
          {quote.sections.map((section, idx) => (
            <div key={section.id}>
              <h4 className="text-sm font-bold text-gray-700 border-b border-gray-300 pb-2 mb-3">
                2.{idx + 1} {section.category.name}
              </h4>
              <p className="text-sm text-gray-700 mb-2">Trabajos incluidos:</p>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-0.5 text-gray-500 shrink-0">•</span>
                    <div>
                      <span>{item.description}</span>
                      {Number(item.length) > 0 && Number(item.width) > 0 ? (
                        <span className="block text-xs text-gray-400 mt-0.5">
                          Dimensiones: {Number(item.length)} ×{" "}
                          {Number(item.width)} ft
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SECCIÓN 3: MATERIALES */}
        <SectionHeader num={3} title="Materiales y Servicios Incluidos" />
        <p className="text-sm text-gray-700 mb-3">
          El contratista será responsable de proveer:
        </p>
        <ul className="space-y-2 mb-4">
          {INCLUDED_SERVICES.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="mt-0.5 text-gray-500 shrink-0">•</span>
              <span className={s.bold ? "font-bold" : ""}>{s.text}</span>
            </li>
          ))}
        </ul>

        {/* SECCIÓN 4: INVERSIÓN */}
        <div
          className="rounded-lg py-8 px-6 text-center mt-6 mb-2"
          style={{ backgroundColor: "#1B2661" }}
        >
          <p
            className="font-bold text-base tracking-widest uppercase mb-3"
            style={{ color: "#C9962B" }}
          >
            4. INVERSIÓN DEL PROYECTO
          </p>
          <p className="text-blue-200 text-xs tracking-widest uppercase mb-3">
            COSTO TOTAL DEL PROYECTO
          </p>
          <p className="text-white text-5xl font-bold tracking-tight">
            {formatCurrency(quote.total)}
          </p>
          {hasTax ? (
            <div className="mt-4 pt-4 border-t border-blue-700">
              <div className="flex justify-center gap-10 text-sm text-blue-300">
                <span>Subtotal: {formatCurrency(subtotal)}</span>
                <span>
                  IVU ({(taxRate * 100).toFixed(1)}%):{" "}
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            </div>
          ) : null}
          <p className="text-blue-300 text-xs mt-4 max-w-sm mx-auto leading-relaxed">
            Este precio incluye materiales, mano de obra y disposición de
            escombros necesarios para completar los trabajos descritos en esta
            propuesta, excluyendo los materiales especificados como provistos
            por el propietario.
          </p>
        </div>

        {/* SECCIÓN 5: CONDICIONES */}
        <SectionHeader num={5} title="Condiciones Generales" />
        <ul className="space-y-2 mb-4">
          {DEFAULT_CONDITIONS.map((cond, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <span className="mt-0.5 text-gray-500 shrink-0">•</span>
              <span>{cond}</span>
            </li>
          ))}
        </ul>
        {quote.notes ? (
          <div className="bg-amber-50 border-l-4 border-amber-300 rounded px-4 py-3 mb-4">
            <p className="text-xs text-amber-900 leading-relaxed">
              {quote.notes}
            </p>
          </div>
        ) : null}

        {/* SECCIÓN 6: ACEPTACIÓN */}
        <SectionHeader num={6} title="Aceptación de la Propuesta" />
        <p className="text-sm text-gray-600 mb-10 leading-relaxed">
          Al firmar este documento, ambas partes están de acuerdo con el alcance
          del trabajo, el costo y las condiciones estipuladas.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="h-14 border-b border-gray-400 mb-2" />
            <p className="text-sm font-bold text-gray-700">Firma del Cliente</p>
            <p className="text-xs text-gray-400">Nombre: {quote.client.name}</p>
          </div>
          <div>
            <div className="h-14 border-b border-gray-400 mb-2" />
            <p className="text-sm font-bold text-gray-700">
              {quote.organization.name}
            </p>
            {license || phone ? (
              <p className="text-xs text-gray-400">
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
      </div>
    </div>
  );
}
