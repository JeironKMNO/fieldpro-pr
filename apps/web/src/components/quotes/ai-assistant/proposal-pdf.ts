"use client";

import jsPDF from "jspdf";

// ═══════════════════════════════════════════════════════════════
// Proposal PDF Generator — Premium Edition
//
// Design system:
//   Header band: #0f172a (dark slate)
//   Accent stripe: #10b981 (emerald, 3px)
//   Section circles: emerald filled with white number
//   Sub-headings: 3px emerald left bar
//   Investment box: emerald border + emerald-50 bg
//   Signature boxes: slate border with header strip
//   Footer: slate-400, thin top border
//
// Structure:
//   - Dark header band (logo right, company name left)
//   - Emerald accent stripe
//   - Meta info block (light bg)
//   - 1. Objetivo del Proyecto       (circle #1)
//   - 2. Desglose de Trabajos        (circle #2)
//   - 3. Inversión Total             (circle #3, styled box)
//   - 4. Aprobación                  (circle #4, dual styled signature boxes)
// ═══════════════════════════════════════════════════════════════

export interface ProposalSection {
  category: string;
  items: Array<{
    description: string;
    unitType: string;
    quantity: number;
    unitPrice: number;
    markupPct: number;
    length?: number;
    width?: number;
    height?: number;
  }>;
}

export interface ProposalData {
  title: string;
  sections: ProposalSection[];
  notes?: string;
}

export interface ProposalConfig {
  companyName: string;
  companyLicense?: string;
  companyPhone?: string;
  clientName: string;
  clientPhone?: string;
  projectLocation?: string;
  projectObjective?: string;
  /** Base64-encoded logo image (data URL like "data:image/png;base64,...") */
  logoBase64?: string;
}

// Roman numeral converter
function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

// Category to display name mapping (professional titles)
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  Demolicion: "DEMOLICIÓN Y PREPARACIÓN",
  Estructura: "TRABAJO ESTRUCTURAL",
  Plomeria: "PLOMERÍA E INSTALACIONES SANITARIAS",
  Electrico: "SISTEMA ELÉCTRICO",
  Techado: "ENVOLVENTE Y PROTECCIÓN (TECHO Y EXTERIORES)",
  Piso: "PISOS Y REVESTIMIENTOS",
  Pintura: "PINTURA Y ACABADOS DE SUPERFICIE",
  Acabados: "ACABADOS FINALES",
  "Ventanas/Puertas": "VENTANAS, PUERTAS Y MARCOS",
  Otros: "TRABAJOS ADICIONALES",
};

// Generate professional item descriptions
function getProDescription(
  desc: string,
  qty: number,
  unitType: string
): string {
  void qty;
  void unitType;
  return desc;
}

function detectImageFormat(dataUrl: string): string {
  const match = dataUrl.match(/data:image\/(png|jpe?g|webp|gif)/i);
  if (!match) return "PNG";
  return match[1]!.toUpperCase().replace("JPG", "JPEG");
}

/** Draw an emerald circle with a white number inside, followed by a bold section title */
function drawSectionHeader(
  doc: jsPDF,
  num: number,
  title: string,
  x: number,
  y: number,
  contentWidth: number
): void {
  // Emerald filled circle
  doc.setFillColor(16, 185, 129);
  doc.circle(x + 4.5, y - 1.5, 4.5, "F");
  // White number
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(String(num), x + 4.5, y + 0.8, { align: "center" });
  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, x + 13, y);
  void contentWidth; // unused but kept for potential future use
}

export function generateProposalPDF(
  quoteData: ProposalData,
  config: ProposalConfig
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 25;
  const marginRight = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = 0;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 28) {
      doc.addPage();
      y = 28;
    }
  };

  // ── DARK HEADER BAND ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Logo — right side inside band
  if (config.logoBase64) {
    try {
      const raw = config.logoBase64.includes(",")
        ? config.logoBase64.split(",")[1]!
        : config.logoBase64;
      const fmt = detectImageFormat(config.logoBase64);
      doc.addImage(raw, fmt, pageWidth - marginRight - 32, 6, 32, 32);
    } catch {
      // continue without logo
    }
  }

  // Company name — left side, white
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(config.companyName.toUpperCase(), marginLeft, 20);

  // License / phone — slate-400
  const headerParts: string[] = [];
  if (config.companyLicense) headerParts.push(`Lic. ${config.companyLicense}`);
  if (config.companyPhone) headerParts.push(`Tel. ${config.companyPhone}`);
  if (headerParts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(headerParts.join("  |  "), marginLeft, 29);
  }

  // "PROPUESTA DE SERVICIOS" in emerald at bottom of band
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text("PROPUESTA DE SERVICIOS", marginLeft, 42);

  // ── EMERALD ACCENT STRIPE ──
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 50, pageWidth, 3, "F");

  y = 64;

  // ── META INFO BLOCK ──
  const today = new Date();
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const dateStr = `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;

  const metaFields: [string, string][] = [
    ["FECHA", dateStr],
    ["PROYECTO", quoteData.title],
    ...(config.projectLocation
      ? [["UBICACIÓN", config.projectLocation] as [string, string]]
      : []),
    [
      "CLIENTE",
      `${config.clientName}${config.clientPhone ? `  |  Tel. ${config.clientPhone}` : ""}`,
    ],
    [
      "CONTRATISTA",
      `${config.companyName}${config.companyLicense ? `  |  Lic. ${config.companyLicense}` : ""}${config.companyPhone ? `  |  Tel. ${config.companyPhone}` : ""}`,
    ],
  ];

  // Compute meta block height
  let metaH = 10;
  for (const [label, value] of metaFields) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const labelW = doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, contentWidth - labelW) as string[];
    metaH += lines.length * 5 + 3;
  }

  doc.setFillColor(248, 250, 252);
  doc.rect(marginLeft, y, contentWidth, metaH, "F");

  let metaY = y + 7;
  doc.setFontSize(9);
  for (const [label, value] of metaFields) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    const labelText = `${label}: `;
    doc.text(labelText, marginLeft + 4, metaY);
    const labelW = doc.getTextWidth(labelText);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(
      value,
      contentWidth - labelW - 4
    ) as string[];
    doc.text(lines, marginLeft + 4 + labelW, metaY);
    metaY += lines.length * 5 + 3;
  }

  y += metaH + 12;

  // ── SECTION 1: OBJETIVO DEL PROYECTO ──
  checkPageBreak(30);
  drawSectionHeader(
    doc,
    1,
    "OBJETIVO DEL PROYECTO",
    marginLeft,
    y,
    contentWidth
  );
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const objective =
    config.projectObjective ||
    `Realizar los trabajos de ${quoteData.title.toLowerCase()} de acuerdo a las especificaciones discutidas con el cliente, utilizando materiales de primera calidad y mano de obra profesional, garantizando un resultado funcional y estéticamente satisfactorio.`;

  const objectiveLines = doc.splitTextToSize(
    objective,
    contentWidth
  ) as string[];
  checkPageBreak(objectiveLines.length * 5 + 12);
  doc.text(objectiveLines, marginLeft, y);
  y += objectiveLines.length * 5 + 12;

  // ── SECTION 2: DESGLOSE DE TRABAJOS ──
  checkPageBreak(22);
  drawSectionHeader(
    doc,
    2,
    "DESGLOSE DE TRABAJOS (ALCANCE)",
    marginLeft,
    y,
    contentWidth
  );
  y += 12;

  quoteData.sections.forEach((section, sectionIdx) => {
    const categoryTitle =
      CATEGORY_DISPLAY_NAMES[section.category] ??
      section.category.toUpperCase();
    const romanNum = toRoman(sectionIdx + 1);

    checkPageBreak(20);

    // Sub-heading with emerald left bar
    doc.setFillColor(16, 185, 129);
    doc.rect(marginLeft, y - 3.5, 3, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${romanNum}. ${categoryTitle}`, marginLeft + 8, y);
    y += 9;

    // Items as bullet points (NO prices)
    doc.setFontSize(9.5);
    for (const item of section.items) {
      const description = getProDescription(
        item.description,
        item.quantity,
        item.unitType
      );
      const parts = description.split(":");
      const hasDetail = parts.length > 1;

      const fullText = hasDetail
        ? `• ${parts[0]!.trim()}: ${parts.slice(1).join(":").trim()}`
        : `• ${description}`;

      const wrappedLines = doc.splitTextToSize(
        fullText,
        contentWidth - 8
      ) as string[];
      checkPageBreak(wrappedLines.length * 5 + 4);

      if (hasDetail && wrappedLines.length > 0) {
        const firstLine = wrappedLines[0]!;
        const colonIdx = firstLine.indexOf(":");
        if (colonIdx > 0) {
          const boldPart = firstLine.substring(0, colonIdx + 1);
          const normalPart = firstLine.substring(colonIdx + 1);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(boldPart, marginLeft + 5, y);
          const boldW = doc.getTextWidth(boldPart);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          doc.text(normalPart, marginLeft + 5 + boldW, y);
        } else {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(firstLine, marginLeft + 5, y);
        }
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        for (let li = 1; li < wrappedLines.length; li++) {
          doc.text(wrappedLines[li]!, marginLeft + 5, y);
          y += 5;
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        for (const line of wrappedLines) {
          doc.text(line, marginLeft + 5, y);
          y += 5;
        }
      }
      y += 2;
    }
    y += 6;
  });

  // ── SECTION 3: INVERSIÓN TOTAL ──
  checkPageBreak(45);
  drawSectionHeader(doc, 3, "INVERSIÓN TOTAL", marginLeft, y, contentWidth);
  y += 12;

  const grandTotal = quoteData.sections.reduce(
    (total, s) =>
      total +
      s.items.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice * (1 + i.markupPct / 100),
        0
      ),
    0
  );
  const ivu = grandTotal * 0.115;
  const totalWithIvu = grandTotal + ivu;
  const totalFmt = totalWithIvu.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Styled investment box
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1.5);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(marginLeft, y, contentWidth, 26, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text(`$${totalFmt}`, pageWidth / 2, y + 14, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("(Incluye materiales, mano de obra e IVU)", pageWidth / 2, y + 21, {
    align: "center",
  });

  y += 34;

  // ── SECTION 4: APROBACIÓN ──
  checkPageBreak(55);
  drawSectionHeader(doc, 4, "APROBACIÓN", marginLeft, y, contentWidth);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Al firmar este documento, ambas partes acuerdan los trabajos y la inversión descritos anteriormente.",
    marginLeft,
    y
  );
  y += 12;

  // Two styled signature boxes side by side
  const boxW = contentWidth / 2 - 4;
  const boxH = 34;
  const boxHeaderH = 10;

  const sigBoxes: [number, string, string][] = [
    [marginLeft, "CONTRATISTA", config.companyName],
    [marginLeft + boxW + 8, "CLIENTE", config.clientName],
  ];

  for (const [bx, label, name] of sigBoxes) {
    // Outer box
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(bx, y, boxW, boxH, "D");
    // Header strip
    doc.setFillColor(248, 250, 252);
    doc.rect(bx, y, boxW, boxHeaderH, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, bx + 5, y + 6.5);
    // Signature line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(bx + 5, y + 27, bx + boxW - 5, y + 27);
    // Name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(name, bx + 5, y + 32);
  }

  y += boxH + 10;

  // ── FOOTER (all pages) ──
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginLeft, footerY - 3, pageWidth - marginRight, footerY - 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${config.companyName}${config.companyLicense ? `  •  Lic. ${config.companyLicense}` : ""}`,
      marginLeft,
      footerY
    );
    doc.text("Generado por FieldPro", pageWidth / 2, footerY, {
      align: "center",
    });
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - marginRight, footerY, {
      align: "right",
    });
  }

  // ── SAVE ──
  const filename = `Propuesta_${quoteData.title.replace(/\s+/g, "_")}_${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}.pdf`;
  doc.save(filename);
}
