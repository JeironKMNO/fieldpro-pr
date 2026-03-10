"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── Design system ────────────────────────────────────────────────
// Headings: #111827  Body: #374151  Meta: #6b7280  Muted: #9ca3af
// Borders:  #e5e7eb  Table header bg: #f3f4f6  Alt row: #f9fafb
// Accent:   #10b981 (emerald)  Dark header: #0f172a
// ─────────────────────────────────────────────────────────────────

const PAGE_PADDING = 40;

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 28,
    paddingBottom: 52,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#374151",
  },

  // ── Header ──
  headerBackground: {
    backgroundColor: "#0f172a",
    marginHorizontal: -PAGE_PADDING,
    marginTop: -28,
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  accentStripe: {
    backgroundColor: "#10b981",
    height: 4,
    marginHorizontal: -PAGE_PADDING,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  companyTagline: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 3,
  },
  companyDetail: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  cotizacionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#34d399",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  quoteNumber: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  dateText: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 4,
  },

  // ── Client + Project Info Block ──
  infoBlock: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoCardLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  infoCardName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 3,
  },
  infoCardText: {
    fontSize: 9,
    color: "#475569",
    marginTop: 2,
    lineHeight: 1.4,
  },

  // ── Project Description Block ──
  descriptionBlock: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  descriptionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  descriptionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },

  // ── Section Divider Label ──
  sectionDivider: {
    marginBottom: 12,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  sectionDividerText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // ── Scope Sections ──
  sectionContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#0f172a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionNumberCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionNumberText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    flex: 1,
  },
  sectionSubtotalText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#34d399",
  },
  itemsLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRowEven: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRowOdd: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10b981",
    marginTop: 4,
    marginRight: 8,
    flexShrink: 0,
  },
  itemDescription: {
    fontSize: 9.5,
    color: "#1e293b",
    lineHeight: 1.45,
    flex: 1,
  },
  dimText: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 2,
    marginLeft: 12,
  },

  // ── Included Materials Block ──
  includedBlock: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  includedLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  includedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  checkMark: {
    fontSize: 8,
    color: "#10b981",
    marginRight: 6,
    marginTop: 1,
  },
  includedText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
    flex: 1,
  },

  // ── Totals ──
  totalsContainer: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 240,
    borderWidth: 2,
    borderColor: "#10b981",
    borderRadius: 6,
    overflow: "hidden",
  },
  totalsHeader: {
    backgroundColor: "#10b981",
    paddingVertical: 7,
    alignItems: "center",
  },
  totalsHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  totalsLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  totalsValue: {
    fontSize: 9,
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#ecfdf5",
  },
  totalsFinalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
  },
  totalsFinalValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },

  // ── Conditions ──
  conditionsBlock: {
    marginTop: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  conditionsLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  conditionNumber: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#d97706",
    marginRight: 6,
    width: 12,
  },
  conditionText: {
    fontSize: 8.5,
    color: "#374151",
    lineHeight: 1.4,
    flex: 1,
  },

  // ── Terms ──
  termsBlock: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  termsLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  termsText: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.5,
  },

  // ── Signatures ──
  signaturesContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 16,
  },
  agreementText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 14,
    textAlign: "center",
  },
  signatureBoxes: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  sigBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    overflow: "hidden",
  },
  sigBoxHeader: {
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sigBoxHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sigBody: {
    padding: 12,
  },
  sigSpaceTop: {
    height: 36,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginBottom: 6,
  },
  sigFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  sigFieldLabel: {
    fontSize: 8,
    color: "#9ca3af",
    width: 48,
  },
  sigFieldLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    marginLeft: 4,
  },
  sigName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
  },
  sigSubtext: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 2,
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
    borderTopColor: "#e5e7eb",
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
  },
});

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

const DEFAULT_CONDITIONS = [
  "Cualquier trabajo adicional no especificado en esta propuesta será considerado trabajo extra y requerirá una orden de cambio aprobada y firmada por el cliente.",
  "El tiempo estimado de ejecución podrá variar dependiendo de condiciones imprevistas del proyecto o factores fuera del control del contratista.",
  "Cambios solicitados por el cliente durante la ejecución del proyecto podrían afectar el costo final y el tiempo de entrega.",
  "Esta cotización tiene validez de 30 días a partir de la fecha de emisión, sujeta a disponibilidad de materiales y mano de obra.",
];

const INCLUDED_SERVICES = [
  "Materiales necesarios para la ejecución del proyecto (excepto los especificados como provistos por el propietario)",
  "Mano de obra especializada y supervisión técnica",
  "Herramientas y equipo necesario para la ejecución",
  "Disposición y transporte de escombros generados durante el proyecto",
];

export function QuotePdfDocument({ quote }: { quote: PdfQuote }) {
  const address = quote.client.addresses[0];
  const { logoUrl, phone, license } = quote.organization;
  const taxRate = Number(quote.taxRate);
  const taxAmount = Number(quote.taxAmount);
  const subtotal = Number(quote.subtotal);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.headerBackground} fixed>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <View>
              <Text style={styles.companyName}>{quote.organization.name}</Text>
              <Text style={styles.companyTagline}>
                Servicios de Construcción y Remodelación
              </Text>
              {phone ? (
                <Text style={styles.companyDetail}>Tel. {phone}</Text>
              ) : null}
              {license ? (
                <Text style={styles.companyDetail}>Licencia: {license}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.cotizacionLabel}>Cotización de Servicios</Text>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
            {quote.title ? (
              <Text style={{ fontSize: 9, color: "#cbd5e1", marginTop: 4 }}>
                {quote.title}
              </Text>
            ) : null}
            <Text style={styles.dateText}>
              Fecha: {fmtDate(quote.createdAt)}
            </Text>
            {quote.validUntil ? (
              <Text style={styles.dateText}>
                Válida hasta: {fmtDate(quote.validUntil)}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.accentStripe} fixed />

        {/* ── Client + Project Info ── */}
        <View style={styles.infoBlock}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Cliente</Text>
            <Text style={styles.infoCardName}>{quote.client.name}</Text>
            {quote.client.email ? (
              <Text style={styles.infoCardText}>{quote.client.email}</Text>
            ) : null}
            {quote.client.phone ? (
              <Text style={styles.infoCardText}>{quote.client.phone}</Text>
            ) : null}
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Dirección del Proyecto</Text>
            {address ? (
              <>
                <Text style={styles.infoCardText}>{address.street}</Text>
                <Text style={styles.infoCardText}>
                  {address.city}, {address.state} {address.zipCode}
                </Text>
              </>
            ) : (
              <Text style={styles.infoCardText}>—</Text>
            )}
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Detalles</Text>
            <Text style={styles.infoCardText}>
              Fecha de emisión:{"\n"}
              {fmtDate(quote.createdAt)}
            </Text>
            {quote.validUntil ? (
              <Text style={[styles.infoCardText, { marginTop: 6 }]}>
                Válida hasta:{"\n"}
                {fmtDate(quote.validUntil)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Project Description ── */}
        {quote.title ? (
          <View style={styles.descriptionBlock}>
            <Text style={styles.descriptionLabel}>
              Descripción del Proyecto
            </Text>
            <Text style={styles.descriptionTitle}>{quote.title}</Text>
            <Text style={styles.descriptionText}>
              El presente documento describe los trabajos de construcción y
              remodelación a realizar en la propiedad del cliente. Los trabajos
              incluyen{" "}
              {quote.sections
                .map((s) => s.category.name.toLowerCase())
                .join(", ")}
              {". "}
              Todos los trabajos serán ejecutados por personal especializado
              siguiendo los estándares de construcción aplicables en Puerto
              Rico.
            </Text>
          </View>
        ) : null}

        {/* ── Scope Divider ── */}
        <View style={styles.sectionDivider}>
          <View style={styles.sectionDividerLine} />
          <Text style={styles.sectionDividerText}>Alcance de los Trabajos</Text>
          <View style={styles.sectionDividerLine} />
        </View>

        {/* ── Work Sections ── */}
        {quote.sections.map((section, sectionIndex) => (
          <View key={section.id} style={styles.sectionContainer} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumberCircle}>
                <Text style={styles.sectionNumberText}>{sectionIndex + 1}</Text>
              </View>
              <Text style={styles.sectionTitle}>{section.category.name}</Text>
            </View>

            <Text style={styles.itemsLabel}>Trabajos incluidos:</Text>

            {section.items.map((item, rowIndex) => (
              <View
                key={item.id}
                style={
                  rowIndex % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                }
              >
                <View style={styles.bulletPoint} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  {Number(item.length) > 0 && Number(item.width) > 0 ? (
                    <Text style={styles.dimText}>
                      Dimensiones: {Number(item.length)} × {Number(item.width)}{" "}
                      ft
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* ── Materials & Services Included ── */}
        <View style={styles.sectionDivider}>
          <View style={styles.sectionDividerLine} />
          <Text style={styles.sectionDividerText}>
            Materiales y Servicios Incluidos
          </Text>
          <View style={styles.sectionDividerLine} />
        </View>

        <View style={styles.includedBlock} wrap={false}>
          <Text style={styles.includedLabel}>
            El contratista será responsable de proveer:
          </Text>
          {INCLUDED_SERVICES.map((item, i) => (
            <View key={i} style={styles.includedRow}>
              <Text style={styles.checkMark}>✓</Text>
              <Text style={styles.includedText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={styles.totalsContainer} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsHeader}>
              <Text style={styles.totalsHeaderText}>
                Inversión del Proyecto
              </Text>
            </View>
            {subtotal > 0 && taxAmount > 0 ? (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal</Text>
                  <Text style={styles.totalsValue}>{fmt(subtotal)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>
                    IVU ({(taxRate * 100).toFixed(1)}%)
                  </Text>
                  <Text style={styles.totalsValue}>{fmt(taxAmount)}</Text>
                </View>
              </>
            ) : null}
            <View style={styles.totalsFinalRow}>
              <Text style={styles.totalsFinalLabel}>COSTO TOTAL</Text>
              <Text style={styles.totalsFinalValue}>{fmt(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── General Conditions ── */}
        <View style={styles.conditionsBlock} wrap={false}>
          <Text style={styles.conditionsLabel}>Condiciones Generales</Text>
          {DEFAULT_CONDITIONS.map((condition, i) => (
            <View key={i} style={styles.conditionRow}>
              <Text style={styles.conditionNumber}>{i + 1}.</Text>
              <Text style={styles.conditionText}>{condition}</Text>
            </View>
          ))}
        </View>

        {/* ── Terms / Notes ── */}
        {quote.notes ? (
          <View style={styles.termsBlock} wrap={false}>
            <Text style={styles.termsLabel}>
              Notas y Condiciones Adicionales
            </Text>
            <Text style={styles.termsText}>{quote.notes}</Text>
          </View>
        ) : null}

        {/* ── Signatures ── */}
        <View style={styles.signaturesContainer} wrap={false}>
          <Text style={styles.agreementText}>
            Al firmar este documento, ambas partes están de acuerdo con el
            alcance del trabajo, el costo y las condiciones estipuladas en esta
            propuesta.
          </Text>

          <View style={styles.signatureBoxes}>
            {/* Contractor */}
            <View style={styles.sigBox}>
              <View style={styles.sigBoxHeader}>
                <Text style={styles.sigBoxHeaderText}>Contratista</Text>
              </View>
              <View style={styles.sigBody}>
                <View style={styles.sigSpaceTop} />
                <View style={styles.sigLine} />
                <Text style={styles.sigName}>{quote.organization.name}</Text>
                {license ? (
                  <Text style={styles.sigSubtext}>Lic. {license}</Text>
                ) : null}
                <View style={styles.sigFieldRow}>
                  <Text style={styles.sigFieldLabel}>Nombre:</Text>
                  <View style={styles.sigFieldLine} />
                </View>
                <View style={styles.sigFieldRow}>
                  <Text style={styles.sigFieldLabel}>Fecha:</Text>
                  <View style={styles.sigFieldLine} />
                </View>
              </View>
            </View>

            {/* Client */}
            <View style={styles.sigBox}>
              <View style={styles.sigBoxHeader}>
                <Text style={styles.sigBoxHeaderText}>Cliente</Text>
              </View>
              <View style={styles.sigBody}>
                <View style={styles.sigSpaceTop} />
                <View style={styles.sigLine} />
                <Text style={styles.sigName}>{quote.client.name}</Text>
                <View style={styles.sigFieldRow}>
                  <Text style={styles.sigFieldLabel}>Nombre:</Text>
                  <View style={styles.sigFieldLine} />
                </View>
                <View style={styles.sigFieldRow}>
                  <Text style={styles.sigFieldLabel}>Fecha:</Text>
                  <View style={styles.sigFieldLine} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {quote.organization.name}
            {license ? `  ·  Lic. ${license}` : ""}
          </Text>
          <Text style={styles.footerText}>FieldPro PR</Text>
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
