"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
  },
  companyDetail: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  quoteNumber: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  quoteTitle: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 2,
  },
  dateText: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 12,
  },
  billToLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  clientInfo: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 16,
  },
  sectionDescription: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 6,
    lineHeight: 1.4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    borderStyle: "dashed",
    paddingVertical: 4,
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
  sectionSubtotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 6,
    paddingBottom: 2,
  },
  sectionSubtotalLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  sectionSubtotalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    width: 70,
    textAlign: "right",
  },
  totalsContainer: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
    marginBottom: 3,
  },
  totalsLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    fontSize: 10,
  },
  totalsValue: {
    width: 80,
    textAlign: "right",
    fontSize: 10,
  },
  totalFinal: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    marginTop: 4,
  },
  termsLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 6,
  },
  termsText: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#9ca3af",
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

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Descripciones detalladas por etapa para el PDF */
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
  Piso:
    "Instalación de pisos y superficies incluyendo preparación de base, material de piso seleccionado, mortero, sellador y acabado final.",
  Pintura:
    "Trabajos de pintura y acabados de superficie incluyendo preparación, sellador, primer, pintura de acabado y recubrimientos protectores.",
  Acabados:
    "Acabados finales y detalles del proyecto incluyendo molduras, zócalos, herrajes y elementos decorativos.",
  "Ventanas/Puertas":
    "Instalación de ventanas y puertas incluyendo marcos, herrajes, sellado contra intemperie y ajustes finales.",
  Otros: "Trabajos adicionales especializados según se describe a continuación.",
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? (
              <Image src={logoUrl} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.companyName}>
                {quote.organization.name}
              </Text>
              {hasCompanyDetails ? (
                <Text style={styles.companyDetail}>
                  {[
                    license ? `Lic. ${license}` : null,
                    phone ? `Tel. ${phone}` : null,
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </Text>
              ) : null}
            </View>
          </View>
          <View>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
            {quote.title ? (
              <Text style={styles.quoteTitle}>{quote.title}</Text>
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

        <View style={styles.separator} />

        {/* Bill To */}
        <View>
          <Text style={styles.billToLabel}>Cliente</Text>
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

        {/* Etapas del Proyecto */}
        {quote.sections.map((section, sectionIndex) => {
          const categoryName = section.category.name;
          const description =
            CATEGORY_DESCRIPTIONS[categoryName] ?? null;

          return (
            <View key={section.id} wrap={false}>
              <Text style={styles.sectionTitle}>
                {toRoman(sectionIndex)}. {categoryName}
              </Text>

              {/* Descripción de la etapa */}
              {description ? (
                <Text style={styles.sectionDescription}>
                  {description}
                </Text>
              ) : null}

              {/* Encabezado de tabla */}
              <View style={styles.tableHeader}>
                <Text
                  style={[styles.tableHeaderText, styles.colDescription]}
                >
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

              {/* Items */}
              {section.items.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={styles.colDescription}>
                    <Text>{item.description}</Text>
                    {Number(item.length) > 0 &&
                    Number(item.width) > 0 ? (
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
                  <Text style={styles.colPrice}>
                    {fmt(item.unitPrice)}
                  </Text>
                  <Text
                    style={[
                      styles.colTotal,
                      { fontFamily: "Helvetica-Bold" },
                    ]}
                  >
                    {fmt(item.total)}
                  </Text>
                </View>
              ))}

              {/* Subtotal de la etapa */}
              <View style={styles.sectionSubtotalRow}>
                <Text style={styles.sectionSubtotalLabel}>
                  Subtotal Etapa {toRoman(sectionIndex)}:
                </Text>
                <Text style={styles.sectionSubtotalValue}>
                  {fmt(section.subtotal)}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.separator} />

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{fmt(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              IVU ({(Number(quote.taxRate) * 100).toFixed(1)}%)
            </Text>
            <Text style={styles.totalsValue}>
              {fmt(quote.taxAmount)}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, styles.totalFinal]}>
              Total
            </Text>
            <Text style={[styles.totalsValue, styles.totalFinal]}>
              {fmt(quote.total)}
            </Text>
          </View>
        </View>

        {/* Notas y Condiciones */}
        {quote.notes ? (
          <View>
            <Text style={styles.termsLabel}>Notas y Condiciones</Text>
            <Text style={styles.termsText}>{quote.notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by FieldPro
        </Text>
      </Page>
    </Document>
  );
}
