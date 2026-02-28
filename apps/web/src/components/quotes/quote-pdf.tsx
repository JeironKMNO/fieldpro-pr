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
// Clean professional palette — no loud colors
// Headings:  #111827   Body: #374151   Meta: #6b7280   Muted: #9ca3af
// Borders:   #e5e7eb   Table header bg: #f3f4f6   Alt row: #f9fafb
// ─────────────────────────────────────────────────────────────────

const PAGE_PADDING = 40;

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 28,
    paddingBottom: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#374151",
  },
  // ── Header (Premium) ──
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
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  companyDetail: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#94a3b8",
    marginTop: 4,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  cotizacionLabel: {
    fontSize: 8,
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
  // ── Client Meta Block ──
  clientMetaBlock: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  clientCol: {
    flex: 6,
  },
  metaCol: {
    flex: 4,
    alignItems: "flex-end",
  },
  billToLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  clientName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  clientInfo: {
    fontSize: 10,
    color: "#475569",
    marginTop: 2,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
    marginTop: 6,
  },
  metaValue: {
    fontSize: 10,
    color: "#0f172a",
  },
  // ── Sections ──
  sectionContainer: {
    marginBottom: 20,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionNumberCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  sectionNumberText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeaderRow: {
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowOdd: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  bulletPoint: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#34d399",
    marginTop: 4,
    marginRight: 6,
  },
  itemDescription: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.4,
    flex: 1,
  },
  dimText: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 2,
    marginLeft: 9,
  },
  // ── Totals Box ──
  totalsContainer: {
    marginTop: 24,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 220,
    borderWidth: 2,
    borderColor: "#10b981",
    borderRadius: 6,
    backgroundColor: "#ecfdf5",
  },
  totalsHeader: {
    backgroundColor: "#10b981",
    paddingVertical: 6,
    alignItems: "center",
  },
  totalsHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  totalsBody: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },
  totalSubtext: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginTop: 6,
    textTransform: "uppercase",
  },
  // ── Signatures ──
  signaturesContainer: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 24,
  },
  termsBlock: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  termsLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  termsText: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.4,
  },
  agreementText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    marginBottom: 16,
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
  },
  sigHeader: {
    backgroundColor: "#f8fafc",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  sigHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sigBody: {
    paddingTop: 40,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    marginBottom: 6,
  },
  sigName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
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

export function QuotePdfDocument({ quote }: { quote: PdfQuote }) {
  const address = quote.client.addresses[0];
  const { logoUrl, phone, license } = quote.organization;
  const hasCompanyDetails = phone || license;

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
            <Text style={styles.cotizacionLabel}>Propuesta de Servicios</Text>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
            {quote.title ? (
              <Text style={{ fontSize: 10, color: "#cbd5e1", marginTop: 4 }}>
                {quote.title}
              </Text>
            ) : null}
            <Text style={styles.dateText}>{fmtDate(quote.createdAt)}</Text>
            {quote.validUntil ? (
              <Text style={styles.dateText}>
                Válida hasta: {fmtDate(quote.validUntil)}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.accentStripe} fixed />

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
        </View>

        {/* ── Sections ── */}
        {quote.sections.map((section, sectionIndex) => {
          const categoryName = section.category.name;

          return (
            <View key={section.id} style={styles.sectionContainer} wrap={false}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionNumberCircle}>
                  <Text style={styles.sectionNumberText}>
                    {sectionIndex + 1}
                  </Text>
                </View>
                <Text style={styles.sectionTitle}>{categoryName}</Text>
              </View>

              <View style={styles.tableContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderText}>
                    Desglose de Trabajo
                  </Text>
                </View>

                {section.items.map((item, rowIndex) => (
                  <View
                    key={item.id}
                    style={
                      rowIndex % 2 === 0
                        ? styles.tableRowEven
                        : styles.tableRowOdd
                    }
                  >
                    <View style={styles.bulletPoint} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                      {Number(item.length) > 0 && Number(item.width) > 0 ? (
                        <Text style={styles.dimText}>
                          Dimensiones: {Number(item.length)} x{" "}
                          {Number(item.width)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* ── Totals ── */}
        <View style={styles.totalsContainer} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsHeader}>
              <Text style={styles.totalsHeaderText}>Inversión Total</Text>
            </View>
            <View style={styles.totalsBody}>
              <Text style={styles.totalValue}>{fmt(quote.total)}</Text>
              <Text style={styles.totalSubtext}>
                (Materiales, Mano de Obra e Impuestos)
              </Text>
            </View>
          </View>
        </View>

        {/* ── Signatures & Terms ── */}
        <View style={styles.signaturesContainer} wrap={false}>
          {quote.notes ? (
            <View style={styles.termsBlock}>
              <Text style={styles.termsLabel}>Términos y Condiciones</Text>
              <Text style={styles.termsText}>{quote.notes}</Text>
            </View>
          ) : null}

          <Text style={styles.agreementText}>
            Al firmar este documento, ambas partes acuerdan los trabajos y la
            inversión descritos anteriormente.
          </Text>

          <View style={styles.signatureBoxes}>
            <View style={styles.sigBox}>
              <View style={styles.sigHeader}>
                <Text style={styles.sigHeaderText}>Contratista</Text>
              </View>
              <View style={styles.sigBody}>
                <View style={styles.sigLine} />
                <Text style={styles.sigName}>{quote.organization.name}</Text>
              </View>
            </View>

            <View style={styles.sigBox}>
              <View style={styles.sigHeader}>
                <Text style={styles.sigHeaderText}>Cliente</Text>
              </View>
              <View style={styles.sigBody}>
                <View style={styles.sigLine} />
                <Text style={styles.sigName}>{quote.client.name}</Text>
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
          <Text style={styles.footerText}>FieldPro</Text>
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
