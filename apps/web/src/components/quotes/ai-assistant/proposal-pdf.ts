"use client";

import jsPDF from "jspdf";

// ═══════════════════════════════════════════════════════════════
// Proposal PDF Generator
// Format: Propuesta de Servicios de Remodelación
//
// Structure:
//   - Logo (optional)
//   - Company header
//   - Title
//   - Meta (date, project, client, contractor)
//   - 1. Objetivo del Proyecto
//   - 2. Desglose de Trabajos (by stages, Roman numerals)
//   - 3. Inversión (total price only, NO itemized costs, NO markup)
//   - 4. Aprobación (dual signatures)
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
        [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
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

// Generate professional item descriptions (never includes price/markup info)
function getProDescription(desc: string, qty: number, unitType: string): string {
    if (desc.length > 40) return desc;

    const unitLabel =
        unitType === "SQ_FT" ? "pies cuadrados" :
            unitType === "LINEAR_FT" ? "pies lineales" :
                unitType === "CUBIC_YD" ? "yardas cúbicas" :
                    unitType === "HOUR" ? "horas" :
                        unitType === "LUMP_SUM" ? "" :
                            "unidades";

    if (unitType === "LUMP_SUM") return desc;
    if (qty > 1 && unitLabel) return `${desc} (${qty} ${unitLabel})`;
    return desc;
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
    let y = 20;

    const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - 30) {
            doc.addPage();
            y = 25;
        }
    };

    // ── LOGO (optional) ──
    if (config.logoBase64) {
        try {
            // Determine image format from data URL
            const formatMatch = config.logoBase64.match(/data:image\/(png|jpeg|jpg|gif|webp)/i);
            const format = formatMatch ? formatMatch[1].toUpperCase().replace("JPG", "JPEG") : "PNG";

            // Extract raw base64 data
            const rawBase64 = config.logoBase64.includes(",")
                ? config.logoBase64.split(",")[1]
                : config.logoBase64;

            // Add centered logo (max 30mm height, proportional width)
            const logoMaxH = 25;
            const logoMaxW = 50;
            doc.addImage(rawBase64, format, (pageWidth - logoMaxW) / 2, y, logoMaxW, logoMaxH);
            y += logoMaxH + 5;
        } catch (e) {
            console.warn("Could not add logo to PDF:", e);
            // Continue without logo
        }
    }

    // ── HEADER: Company Name ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(config.companyName.toUpperCase(), pageWidth / 2, y, { align: "center" });
    y += 7;

    // Subtitle/license if available
    if (config.companyLicense || config.companyPhone) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const parts = [];
        if (config.companyLicense) parts.push(`Lic. ${config.companyLicense}`);
        if (config.companyPhone) parts.push(`Tel. ${config.companyPhone}`);
        doc.text(parts.join(" | "), pageWidth / 2, y, { align: "center" });
        y += 5;
    }

    // Separator line
    y += 3;
    doc.setLineWidth(0.8);
    doc.setDrawColor(0, 0, 0);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 8;

    // ── TITLE ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PROPUESTA DE SERVICIOS", pageWidth / 2, y, { align: "center" });
    y += 4;
    const titleWidth = doc.getTextWidth("PROPUESTA DE SERVICIOS");
    doc.setLineWidth(0.5);
    doc.line((pageWidth - titleWidth) / 2, y, (pageWidth + titleWidth) / 2, y);
    y += 12;

    // ── META INFO ──
    doc.setFontSize(10);
    const today = new Date();
    const months = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    const dateStr = `${today.getDate()} de ${months[today.getMonth()]} de ${today.getFullYear()}`;

    const metaFields = [
        { label: "FECHA", value: dateStr },
        { label: "PROYECTO", value: quoteData.title },
        ...(config.projectLocation
            ? [{ label: "UBICACIÓN", value: config.projectLocation }]
            : []),
        {
            label: "CLIENTE",
            value: `${config.clientName}${config.clientPhone ? ` | TEL: ${config.clientPhone}` : ""}`,
        },
        {
            label: "CONTRATISTA",
            value: `${config.companyName}${config.companyLicense ? ` | Lic. ${config.companyLicense}` : ""}${config.companyPhone ? ` | Tel. ${config.companyPhone}` : ""}`,
        },
    ];

    for (const field of metaFields) {
        doc.setFont("helvetica", "bold");
        doc.text(`${field.label}: `, marginLeft, y);
        const labelWidth = doc.getTextWidth(`${field.label}: `);
        doc.setFont("helvetica", "normal");
        const valueLines = doc.splitTextToSize(field.value, contentWidth - labelWidth);
        doc.text(valueLines, marginLeft + labelWidth, y);
        y += valueLines.length * 5 + 2;
    }

    y += 6;

    // ── SECTION 1: OBJETIVO DEL PROYECTO ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1. OBJETIVO DEL PROYECTO", marginLeft, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const objective =
        config.projectObjective ||
        `Realizar los trabajos de ${quoteData.title.toLowerCase()} de acuerdo a las especificaciones discutidas con el cliente, utilizando materiales de primera calidad y mano de obra profesional, garantizando un resultado funcional y estéticamente satisfactorio.`;

    const objectiveLines = doc.splitTextToSize(objective, contentWidth);
    checkPageBreak(objectiveLines.length * 5 + 10);
    doc.text(objectiveLines, marginLeft, y);
    y += objectiveLines.length * 5 + 10;

    // ── SECTION 2: DESGLOSE DE TRABAJOS ──
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. DESGLOSE DE TRABAJOS (ALCANCE)", marginLeft, y);
    y += 10;

    quoteData.sections.forEach((section, sectionIdx) => {
        const categoryTitle = CATEGORY_DISPLAY_NAMES[section.category] || section.category.toUpperCase();
        const romanNum = toRoman(sectionIdx + 1);

        checkPageBreak(20);

        // Section heading
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${romanNum}. ${categoryTitle}`, marginLeft, y);
        y += 8;

        // Items as bullet points with descriptions only (NO prices, NO markup)
        doc.setFontSize(10);
        for (const item of section.items) {
            const description = getProDescription(
                item.description,
                item.quantity,
                item.unitType
            );

            // Split description into title and detail
            const parts = description.split(":");
            const hasDetail = parts.length > 1;

            const fullText = hasDetail
                ? `• ${parts[0].trim()}: ${parts.slice(1).join(":").trim()}`
                : `• ${description}`;
            const wrapped = doc.splitTextToSize(fullText, contentWidth - 5);
            checkPageBreak(wrapped.length * 5 + 4);

            if (hasDetail) {
                doc.setFont("helvetica", "normal");
                const wrappedLines = doc.splitTextToSize(fullText, contentWidth - 5);

                // First line: make the title part bold
                const firstLine = wrappedLines[0];
                const colonIdx = firstLine.indexOf(":");
                if (colonIdx > 0) {
                    const boldPart = firstLine.substring(0, colonIdx + 1);
                    const normalPart = firstLine.substring(colonIdx + 1);
                    doc.setFont("helvetica", "bold");
                    doc.text(boldPart, marginLeft + 3, y);
                    const boldWidth = doc.getTextWidth(boldPart);
                    doc.setFont("helvetica", "normal");
                    doc.text(normalPart, marginLeft + 3 + boldWidth, y);
                } else {
                    doc.setFont("helvetica", "bold");
                    doc.text(firstLine, marginLeft + 3, y);
                }
                y += 5;

                // Remaining wrapped lines (normal)
                doc.setFont("helvetica", "normal");
                for (let i = 1; i < wrappedLines.length; i++) {
                    doc.text(wrappedLines[i], marginLeft + 3, y);
                    y += 5;
                }
            } else {
                doc.setFont("helvetica", "normal");
                const wrappedLines = doc.splitTextToSize(`• ${description}`, contentWidth - 5);
                for (const line of wrappedLines) {
                    doc.text(line, marginLeft + 3, y);
                    y += 5;
                }
            }

            y += 2;
        }

        y += 5;
    });

    // ── SECTION 3: INVERSIÓN TOTAL ──
    // Only show the final total — NO itemized prices, NO margin/markup breakdown
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("3. INVERSIÓN TOTAL", marginLeft, y);
    y += 10;

    // Calculate grand total (includes markup internally, but client only sees final number)
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(
        `Inversión total del proyecto: $${totalWithIvu.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pageWidth / 2,
        y,
        { align: "center" }
    );
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("(Incluye materiales, mano de obra e IVU)", pageWidth / 2, y, { align: "center" });
    doc.setTextColor(0, 0, 0);
    y += 15;

    // ── SECTION 4: APROBACIÓN ──
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("4. APROBACIÓN", marginLeft, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
        "Al firmar este documento, ambas partes acuerdan los trabajos y la inversión descritos anteriormente.",
        marginLeft,
        y
    );
    doc.setTextColor(0, 0, 0);
    y += 12;

    // Contractor signature
    doc.setFontSize(9);
    doc.text("Contratista:", marginLeft, y);
    y += 12;
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, marginLeft + 70, y);
    y += 4;
    doc.setFontSize(8);
    doc.text(config.companyName, marginLeft, y);
    y += 4;
    doc.text("Firma y Fecha", marginLeft, y);

    // Client signature (same line, right side)
    const rightX = pageWidth / 2 + 10;
    y -= 20;
    doc.setFontSize(9);
    doc.text("Cliente:", rightX, y);
    y += 12;
    doc.line(rightX, y, rightX + 70, y);
    y += 4;
    doc.setFontSize(8);
    doc.text(config.clientName, rightX, y);
    y += 4;
    doc.text("Firma y Fecha", rightX, y);

    // ── FOOTER ──
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Generado por FieldPro • Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );
        doc.setTextColor(0, 0, 0);
    }

    // ── SAVE ──
    const filename = `Propuesta_${quoteData.title.replace(/\s+/g, "_")}_${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}.pdf`;
    doc.save(filename);
}
