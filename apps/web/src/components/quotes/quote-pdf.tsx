"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── Design tokens ─────────────────────────────────────────────────
const NAVY = "#1B2661";
const GOLD = "#C9962B";
const BLUE_BG = "#EBF2FD";
const BODY = "#374151";
const GRAY_MID = "#6B7280";
const SEPARATOR = "#D1D5DB";
const WATERMARK = "#EBEBEB";
const BLUE_NOTE_BG = "#EBF5FB";
const BLUE_NOTE_TEXT = "#1D4ED8";
// ────────────────────────────────────────────────────────────────────

const H_PAD = 50;

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: H_PAD,
    paddingTop: 36,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: BODY,
    backgroundColor: "#FFFFFF",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 6,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  companyInfo: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  companyTagline: {
    fontSize: 7,
    color: "#9CA3AF",
    letterSpacing: 2,
    marginBottom: 3,
  },
  companyDetailRow: {
    flexDirection: "row",
    gap: 0,
    marginTop: 1,
  },
  companyDetailLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: GRAY_MID,
  },
  companyDetailValue: {
    fontSize: 8.5,
    color: GRAY_MID,
  },

  // ── Watermark ──
  watermarkWrap: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 2,
  },
  watermark: {
    fontSize: 54,
    fontFamily: "Helvetica-Bold",
    color: WATERMARK,
    letterSpacing: 16,
  },

  // ── Separator ──
  separator: {
    height: 1,
    backgroundColor: SEPARATOR,
    marginVertical: 10,
  },

  // ── Info box ──
  infoBox: {
    backgroundColor: BLUE_BG,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    width: 70,
  },
  infoValue: {
    fontSize: 9.5,
    color: NAVY,
    flex: 1,
    lineHeight: 1.3,
  },

  // ── Numbered section header ──
  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionNum: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    width: 16,
    lineHeight: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    flex: 1,
    lineHeight: 1.2,
  },

  // ── Subsection (2.1, 2.2…) ──
  subsectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BODY,
    marginTop: 12,
    marginBottom: 6,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: SEPARATOR,
  },

  // ── Body text ──
  bodyText: {
    fontSize: 9.5,
    color: BODY,
    lineHeight: 1.5,
    marginBottom: 8,
  },

  // ── Bullets ──
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 6,
  },
  bulletDot: {
    fontSize: 9.5,
    color: BODY,
    width: 10,
    lineHeight: 1.45,
  },
  bulletText: {
    fontSize: 9.5,
    color: BODY,
    lineHeight: 1.45,
    flex: 1,
  },
  bulletTextBold: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: BODY,
    lineHeight: 1.45,
    flex: 1,
  },

  // ── Blue italic note box ──
  blueNote: {
    backgroundColor: BLUE_NOTE_BG,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 2,
  },
  blueNoteText: {
    fontSize: 8.5,
    color: BLUE_NOTE_TEXT,
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.4,
  },

  // ── Amber note box ──
  amberNote: {
    backgroundColor: "#FFFBEB",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  amberNoteText: {
    fontSize: 8.5,
    color: "#92400E",
    lineHeight: 1.4,
  },

  // ── Section 4: Investment card ──
  investmentCard: {
    backgroundColor: NAVY,
    borderRadius: 8,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
    alignItems: "center",
  },
  investmentTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    letterSpacing: 1,
    marginBottom: 10,
  },
  investmentSubtitle: {
    fontSize: 8,
    color: "#CBD5E1",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  investmentPrice: {
    fontSize: 40,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  investmentNote: {
    fontSize: 8,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 1.45,
    maxWidth: 300,
  },
  investmentBreakdown: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#2D3E8A",
    paddingTop: 10,
    alignItems: "center",
  },
  breakdownRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginBottom: 3,
  },
  breakdownLabel: {
    fontSize: 8.5,
    color: "#94A3B8",
  },
  breakdownValue: {
    fontSize: 8.5,
    color: "#CBD5E1",
  },

  // ── Signatures ──
  sigNote: {
    fontSize: 9,
    color: GRAY_MID,
    marginBottom: 16,
    lineHeight: 1.4,
  },
  sigBoxes: {
    flexDirection: "row",
    gap: 24,
  },
  sigBox: {
    flex: 1,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    marginBottom: 6,
    height: 40,
  },
  sigBoxLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BODY,
    marginBottom: 2,
  },
  sigBoxSub: {
    fontSize: 8,
    color: "#9CA3AF",
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 18,
    left: H_PAD,
    right: H_PAD,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
    paddingTop: 5,
  },
  footerText: {
    fontSize: 7,
    color: "#9CA3AF",
  },
});

// ─── Helpers ────────────────────────────────────────────────────────
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

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionNum}>{num}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Constants ──────────────────────────────────────────────────────
const DEFAULT_CONDITIONS = [
  "Cualquier trabajo adicional no especificado en esta propuesta será considerado trabajo extra y requerirá una orden de cambio aprobada y firmada por el cliente.",
  "El tiempo estimado de ejecución podrá variar dependiendo de condiciones imprevistas del proyecto o factores fuera del control del contratista.",
  "Cambios solicitados por el cliente durante la ejecución del proyecto podrían afectar el costo final y el tiempo de entrega.",
  "Esta cotización tiene validez de 30 días a partir de la fecha de emisión, sujeta a disponibilidad de materiales y mano de obra.",
];

const INCLUDED_SERVICES: { text: string; bold?: boolean }[] = [
  {
    text: "Los materiales necesarios para la ejecución del proyecto (excepto los provistos por el cliente).",
  },
  { text: "Mano de obra especializada." },
  { text: "Herramientas y equipo necesario." },
  {
    text: "Disposición de escombros generados durante el proyecto.",
    bold: true,
  },
];

// ─── Public interface ────────────────────────────────────────────────
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

// ─── Component ───────────────────────────────────────────────────────
export function QuotePdfDocument({ quote }: { quote: PdfQuote }) {
  const address = quote.client.addresses[0];
  const { logoUrl, phone, license } = quote.organization;
  const taxRate = Number(quote.taxRate);
  const taxAmount = Number(quote.taxAmount);
  const subtotal = Number(quote.subtotal);
  const hasTax = taxAmount > 0 && subtotal > 0;

  const categoryList = quote.sections
    .map((s) => s.category.name.toLowerCase())
    .join(", ");

  const projectDesc = `El presente documento describe los trabajos de ${categoryList} a realizar en la propiedad${address ? ` ubicada en ${address.city}` : " del cliente"}. Los trabajos incluyen ${categoryList}. Todos los trabajos serán ejecutados por personal especializado siguiendo los estándares de construcción aplicables en Puerto Rico.`;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{quote.organization.name}</Text>
            <Text style={styles.companyTagline}>
              SERVICIOS DE CONSTRUCCIÓN Y REMODELACIÓN
            </Text>
            {license ? (
              <View style={styles.companyDetailRow}>
                <Text style={styles.companyDetailLabel}>Licencia: </Text>
                <Text style={styles.companyDetailValue}>{license}</Text>
              </View>
            ) : null}
            {phone ? (
              <View style={styles.companyDetailRow}>
                <Text style={styles.companyDetailLabel}>Teléfono: </Text>
                <Text style={styles.companyDetailValue}>{phone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── WATERMARK ── */}
        <View style={styles.watermarkWrap}>
          <Text style={styles.watermark}>COTIZACIÓN</Text>
        </View>

        {/* ── SEPARATOR ── */}
        <View style={styles.separator} />

        {/* ── INFO BOX ── */}
        <View style={styles.infoBox}>
          {quote.title ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Proyecto:</Text>
              <Text style={styles.infoValue}>{quote.title}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{fmtDate(quote.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>{quote.client.name}</Text>
          </View>
          {address ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección:</Text>
              <Text style={styles.infoValue}>
                {address.street}, {address.city}, {address.state}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── SECCIÓN 1: DESCRIPCIÓN ── */}
        <SectionHeader num="1" title="Descripción del Proyecto" />
        <Text style={styles.bodyText}>{projectDesc}</Text>

        {/* ── SECCIÓN 2: ALCANCE ── */}
        <SectionHeader num="2" title="Alcance de los Trabajos" />
        {quote.sections.map((section, idx) => (
          <View key={section.id} wrap={false}>
            <Text style={styles.subsectionTitle}>
              2.{idx + 1} {section.category.name}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 4 }]}>
              Trabajos incluidos:
            </Text>
            {section.items.map((item) => (
              <View key={item.id} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulletText}>{item.description}</Text>
                  {Number(item.length) > 0 && Number(item.width) > 0 ? (
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#9CA3AF",
                        marginTop: 1,
                      }}
                    >
                      Dimensiones: {Number(item.length)} × {Number(item.width)}{" "}
                      ft
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* ── SECCIÓN 3: MATERIALES ── */}
        <SectionHeader num="3" title="Materiales y Servicios Incluidos" />
        <Text style={styles.bodyText}>
          El contratista será responsable de proveer:
        </Text>
        {INCLUDED_SERVICES.map((s, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={s.bold ? styles.bulletTextBold : styles.bulletText}>
              {s.text}
            </Text>
          </View>
        ))}

        {/* ── SECCIÓN 4: INVERSIÓN ── */}
        <View style={styles.investmentCard} wrap={false}>
          <Text style={styles.investmentTitle}>4. INVERSIÓN DEL PROYECTO</Text>
          <Text style={styles.investmentSubtitle}>
            COSTO TOTAL DEL PROYECTO
          </Text>
          <Text style={styles.investmentPrice}>{fmt(quote.total)}</Text>
          {hasTax ? (
            <View style={styles.investmentBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>{fmt(subtotal)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  IVU ({(taxRate * 100).toFixed(1)}%)
                </Text>
                <Text style={styles.breakdownValue}>{fmt(taxAmount)}</Text>
              </View>
            </View>
          ) : null}
          <Text style={styles.investmentNote}>
            Este precio incluye materiales, mano de obra y disposición de
            escombros necesarios para completar los trabajos descritos en esta
            propuesta, excluyendo los materiales especificados como provistos
            por el propietario.
          </Text>
        </View>

        {/* ── SECCIÓN 5: CONDICIONES ── */}
        <SectionHeader num="5" title="Condiciones Generales" />
        {DEFAULT_CONDITIONS.map((cond, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{cond}</Text>
          </View>
        ))}
        {quote.notes ? (
          <View style={[styles.amberNote, { marginTop: 12 }]}>
            <Text style={styles.amberNoteText}>{quote.notes}</Text>
          </View>
        ) : null}

        {/* ── SECCIÓN 6: ACEPTACIÓN ── */}
        <SectionHeader num="6" title="Aceptación de la Propuesta" />
        <Text style={styles.sigNote}>
          Al firmar este documento, ambas partes están de acuerdo con el alcance
          del trabajo, el costo y las condiciones estipuladas.
        </Text>
        <View style={styles.sigBoxes} wrap={false}>
          {/* Firma del Cliente */}
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigBoxLabel}>Firma del Cliente</Text>
            <Text style={styles.sigBoxSub}>Nombre: {quote.client.name}</Text>
          </View>
          {/* Firma del Contratista */}
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={styles.sigBoxLabel}>{quote.organization.name}</Text>
            {license || phone ? (
              <Text style={styles.sigBoxSub}>
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

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {quote.organization.name}
            {license ? `  ·  Lic. ${license}` : ""}
          </Text>
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
