"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── Design system ───────────────────────────────────────────────
// Primary dark: #0f172a   Accent emerald: #10b981
// Table header: #1e293b   Alt row: #f8fafc
// Total highlight: #ecfdf5  Total value: #10b981
// Labels: #64748b         Body: #0f172a
// ─────────────────────────────────────────────────────────────────

const PAGE_PADDING = 40;

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 0,
    paddingBottom: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  // ── Header band ──
  headerBand: {
    backgroundColor: "#0f172a",
    marginHorizontal: -PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    objectFit: "contain",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  companyName: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  companyDetail: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  cotizacionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#10b981",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  quoteNumber: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  dateText: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 3,
  },
  // ── Accent stripe ──
  accentStripe: {
    height: 3,
    backgroundColor: "#10b981",
    marginHorizontal: -PAGE_PADDING,
    marginBottom: 18,
  },
  // ── Client / meta block ──
  clientMetaBlock: {
    flexDirection: "row",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#10b981",
    marginBottom: 18,
  },
  clientCol: {
    flex: 6,
  },
  metaCol: {
    flex: 4,
    alignItems: "flex-end",
  },
  billToLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  clientInfo: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 1,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
    marginTop: 6,
  },
  metaValue: {
    fontSize: 9,
    color: "#0f172a",
  },
  // ── Section titles ──
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 18,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
    paddingLeft: 8,
  },
  sectionDescription: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 6,
    lineHeight: 1.4,
    paddingLeft: 11,
  },
  // ── Table ──
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 0,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowOdd: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  colDescription: { flex: 3 },
  colQty: { width: 55, textAlign: "right" },
  colUnit: { width: 50, textAlign: "right" },
  colPrice: { width: 65, textAlign: "right" },
  colTotal: { width: 70, textAlign: "right" },
  dimText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  // ── Section subtotal ──
  sectionSubtotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 6,
    paddingBottom: 2,
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
  },
  sectionSubtotalLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    marginRight: 8,
  },
  sectionSubtotalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    width: 70,
    textAlign: "right",
    color: "#0f172a",
  },
  // ── Totals ──
  totalsContainer: {
    marginTop: 24,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    width: 220,
    marginBottom: 4,
  },
  totalsLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    fontSize: 9,
    color: "#64748b",
  },
  totalsValue: {
    width: 80,
    textAlign: "right",
    fontSize: 9,
    color: "#0f172a",
  },
  totalHighlightRow: {
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
    borderRadius: 4,
    width: 220,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  totalValue: {
    width: 80,
    textAlign: "right",
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#10b981",
  },
  // ── Notes ──
  termsLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 6,
  },
  termsText: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.4,
  },
  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 16,
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

const UNIT_LABELS: Record<string, string> = {
  SQ_FT: "p²",
  LINEAR_FT: "p lin",
  CUBIC_YD: "yd³",
  UNIT: "ud",
  HOUR: "hr",
  LUMP_SUM: "global",
};

const ROMAN_NUMERALS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Demolicion:
    "Trabajos de demolición y preparación del área incluyendo remoción de estructuras existentes, disposición de escombros y limpieza del terreno para iniciar la nueva construcción.",
  Estructura:
    "Fase estructural del proyecto incluyendo cimentación, columnas, vigas, losas y todo elemento portante necesario para la integridad de la obra.",
  Plomeria:
    "Instalaciones de plomería incluyendo tuberías de agua potable, drenaje, accesorios, llaves de paso y conexiones a la red principal.",
  Electrico:
    "Sistema eléctrico completo incluyendo paneles, cableado, tomacorrientes, interruptores, luminarias y conexiones según código eléctrico vigente.",
  Techado:
    "Trabajos de techado y protección exterior incluyendo estructura, impermeabilización, aislamiento y acabados de cubierta.",
  Piso: "Instalación de pisos y superficies incluyendo preparación de base, material de piso seleccionado, mortero, sellador y acabado final.",
  Pintura:
    "Trabajos de pintura y acabados de superficie incluyendo preparación, sellador, primer, pintura de acabado y recubrimientos protectores.",
  Acabados:
    "Acabados finales y detalles del proyecto incluyendo molduras, zócalos, herrajes y elementos decorativos.",
  "Ventanas/Puertas":
    "Instalación de ventanas y puertas incluyendo marcos, herrajes, sellado contra intemperie y ajustes finales.",
  Otros:
    "Trabajos adicionales especializados según se describe a continuación.",
};

function fmt(value: unknown): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function fmtDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-PR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toRoman(index: number): string {
  return ROMAN_NUMERALS[index] ?? String(index + 1);
}

export interface PdfQuote {
  quoteNumber: string;
  title: string | null;
  createdAt: Date;
  validUntil: Date | null;
  notes: string | null;
  subtotal: unknown;
  taxRate: unknown;
  taxAmount: unknown;
  total: unknown;
  organization: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    license: string | null;
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

export function QuotePdfDocument({ quote }: { quote: PdfQuote }) {
  const address = quote.client.addresses[0];
  const { logoUrl, phone, license } = quote.organization;
  const hasCompanyDetails = phone || license;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* ── Dark header band ── */}
        <View style={styles.headerBand}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <View>
              <Text style={styles.companyName}>{quote.organization.name}</Text>
              {hasCompanyDetails ? (
                <Text style={styles.companyDetail}>
                  {[
                    license ? `Lic. ${license}` : null,
                    phone ? `Tel. ${phone}` : null,
                  ]
                    .filter(Boolean)
                    .join("  |  ")}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.cotizacionLabel}>Cotización</Text>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
            <Text style={styles.dateText}>{fmtDate(quote.createdAt)}</Text>
            {quote.validUntil ? (
              <Text style={styles.dateText}>
                Válida hasta: {fmtDate(quote.validUntil)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Emerald accent stripe ── */}
        <View style={styles.accentStripe} />

        {/* ── Client info + meta ── */}
        <View style={styles.clientMetaBlock}>
          <View style={styles.clientCol}>
            <Text style={styles.billToLabel}>Facturar a</Text>
            <Text style={styles.clientName}>{quote.client.name}</Text>
            {quote.client.email ? (
              <Text style={styles.clientInfo}>{quote.client.email}</Text>
            ) : null}
            {quote.client.phone ? (
              <Text style={styles.clientInfo}>{quote.client.phone}</Text>
            ) : null}
            {address ? (
              <Text style={styles.clientInfo}>
                {address.street}, {address.city}, {address.state}{" "}
                {address.zipCode}
              </Text>
            ) : null}
          </View>
          <View style={styles.metaCol}>
            {quote.title ? (
              <>
                <Text style={styles.metaLabel}>Proyecto</Text>
                <Text style={styles.metaValue}>{quote.title}</Text>
              </>
            ) : null}
            <Text style={styles.metaLabel}>Fecha</Text>
            <Text style={styles.metaValue}>{fmtDate(quote.createdAt)}</Text>
            {quote.validUntil ? (
              <>
                <Text style={styles.metaLabel}>Válida hasta</Text>
                <Text style={styles.metaValue}>
                  {fmtDate(quote.validUntil)}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* ── Sections ── */}
        {quote.sections.map((section, sectionIndex) => {
          const categoryName = section.category.name;
          const description = CATEGORY_DESCRIPTIONS[categoryName] ?? null;

          return (
            <View key={section.id} wrap={false}>
              <Text style={styles.sectionTitle}>
                {toRoman(sectionIndex)}. {categoryName}
              </Text>

              {description ? (
                <Text style={styles.sectionDescription}>{description}</Text>
              ) : null}

              {/* Table header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderText, styles.colDescription]}>
                  Descripción
                </Text>
                <Text style={[styles.tableHeaderText, styles.colQty]}>
                  Cant.
                </Text>
                <Text style={[styles.tableHeaderText, styles.colUnit]}>
                  Unidad
                </Text>
                <Text style={[styles.tableHeaderText, styles.colPrice]}>
                  Precio
                </Text>
                <Text style={[styles.tableHeaderText, styles.colTotal]}>
                  Total
                </Text>
              </View>

              {/* Rows */}
              {section.items.map((item, rowIndex) => (
                <View
                  key={item.id}
                  style={
                    rowIndex % 2 === 0
                      ? styles.tableRowEven
                      : styles.tableRowOdd
                  }
                >
                  <View style={styles.colDescription}>
                    <Text>{item.description}</Text>
                    {Number(item.length) > 0 && Number(item.width) > 0 ? (
                      <Text style={styles.dimText}>
                        ({Number(item.length)} x {Number(item.width)} p²)
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.colQty}>
                    {Number(item.quantity).toFixed(2)}
                  </Text>
                  <Text style={styles.colUnit}>
                    {UNIT_LABELS[item.unitType] ?? item.unitType}
                  </Text>
                  <Text style={styles.colPrice}>{fmt(item.unitPrice)}</Text>
                  <Text
                    style={[styles.colTotal, { fontFamily: "Helvetica-Bold" }]}
                  >
                    {fmt(item.total)}
                  </Text>
                </View>
              ))}

              {/* Section subtotal */}
              <View style={styles.sectionSubtotalRow}>
                <Text style={styles.sectionSubtotalLabel}>
                  Subtotal {toRoman(sectionIndex)}:
                </Text>
                <Text style={styles.sectionSubtotalValue}>
                  {fmt(section.subtotal)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* ── Totals ── */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{fmt(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              IVU ({(Number(quote.taxRate) * 100).toFixed(1)}%)
            </Text>
            <Text style={styles.totalsValue}>{fmt(quote.taxAmount)}</Text>
          </View>
          <View style={styles.totalHighlightRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmt(quote.total)}</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        {quote.notes ? (
          <View>
            <Text style={styles.termsLabel}>Notas y Condiciones</Text>
            <Text style={styles.termsText}>{quote.notes}</Text>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {quote.organization.name}
            {license ? `  •  Lic. ${license}` : ""}
          </Text>
          <Text style={styles.footerText}>Generado por FieldPro</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
