import jsPDF from "jspdf";

// ─── Design system ───────────────────────────────────────────────
// Header band:   #0f172a (15,23,42)
// Accent stripe: #10b981 (16,185,129) — emerald
// Table header:  #1e293b (30,41,59)
// Alt row:       #f8fafc (248,250,252)
// Total bg:      #ecfdf5 (236,253,245) — emerald-50
// Total text:    #059669 (5,150,105) — emerald-700
// Slate-400:     #94a3b8 (148,163,184)
// Slate-500:     #64748b (100,116,139)
// Slate-600:     #475569 (71,85,105)
// ─────────────────────────────────────────────────────────────────

interface InvoicePDFData {
  invoiceNumber: string;
  status: string;
  createdAt: Date | string;
  dueDate: Date | string | null;
  client: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string;
  };
  organization: {
    name: string;
    phone?: string | null;
    license?: string | null;
    logoUrl?: string | null;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
}

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(v);
}

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-PR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function detectImageFormat(dataUrl: string): string {
  const match = dataUrl.match(/data:image\/(png|jpe?g|webp|gif)/i);
  if (!match) return "PNG";
  return match[1].toUpperCase().replace("JPG", "JPEG");
}

export function generateInvoicePDF(data: InvoicePDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── STATUS WATERMARK (draw first so content overlays it) ──
  const statusForWatermark = data.status;
  if (statusForWatermark === "PAID") {
    doc.setFontSize(64);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(187, 247, 208); // very light green
    doc.text("PAGADA", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 35,
    });
  } else if (statusForWatermark === "OVERDUE") {
    doc.setFontSize(64);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(254, 202, 202); // very light red
    doc.text("VENCIDA", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 35,
    });
  }
  // Reset
  doc.setTextColor(0, 0, 0);

  // ── HEADER BAND ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 52, "F");

  // Logo (optional)
  const logoUrl = data.organization.logoUrl;
  const hasLogo = Boolean(logoUrl);
  if (logoUrl) {
    try {
      const raw = logoUrl.includes(",") ? logoUrl.split(",")[1]! : logoUrl;
      const fmt = detectImageFormat(logoUrl);
      doc.addImage(raw, fmt, margin, 6, 26, 26);
    } catch {
      // logo failed — continue without it
    }
  }
  const textOffsetX = hasLogo ? margin + 32 : margin;

  // Company name (white)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(data.organization.name, textOffsetX, 20);

  // License / phone (slate-400)
  const headerDetails: string[] = [];
  if (data.organization.phone) headerDetails.push(data.organization.phone);
  if (data.organization.license)
    headerDetails.push(`Lic. ${data.organization.license}`);
  if (headerDetails.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(headerDetails.join("  •  "), textOffsetX, 29);
  }

  // Right: "FACTURA" label in emerald + invoice number in white
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // emerald
  doc.text("FACTURA", pageWidth - margin, 18, { align: "right" });

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(data.invoiceNumber, pageWidth - margin, 30, { align: "right" });

  // ── EMERALD ACCENT STRIPE ──
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 52, pageWidth, 3, "F");

  y = 67;

  // ── CLIENT + INVOICE INFO BLOCK ──
  const infoBlockHeight = 32;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, infoBlockHeight, "F");

  // Left: Bill To
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("FACTURAR A", margin + 4, y + 6);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(data.client.name, margin + 4, y + 13);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  let clientY = y + 19;
  if (data.client.email) {
    doc.text(data.client.email, margin + 4, clientY);
    clientY += 4.5;
  }
  if (data.client.phone) {
    doc.text(data.client.phone, margin + 4, clientY);
    clientY += 4.5;
  }
  if (data.client.address) {
    doc.text(data.client.address, margin + 4, clientY);
  }

  // Right: date / due / status
  const rightX = pageWidth - margin - 4;
  const statusLabels: Record<string, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    VIEWED: "Vista",
    PAID: "Pagada",
    OVERDUE: "Vencida",
    CANCELLED: "Cancelada",
  };
  const statusColors: Record<string, [number, number, number]> = {
    PAID: [5, 150, 105],
    OVERDUE: [220, 38, 38],
    SENT: [37, 99, 235],
    VIEWED: [124, 58, 237],
    DRAFT: [100, 116, 139],
    CANCELLED: [156, 163, 175],
  };

  const infoRows: [string, string][] = [
    ["FECHA", fmtDate(data.createdAt)],
    ["VENCIMIENTO", fmtDate(data.dueDate)],
    ["ESTADO", statusLabels[data.status] ?? data.status],
  ];
  let ry = y + 6;
  for (const [label, value] of infoRows) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(label, rightX - 48, ry);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    if (label === "ESTADO") {
      const col = statusColors[data.status] ?? [0, 0, 0];
      doc.setTextColor(col[0], col[1], col[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(value, rightX, ry, { align: "right" });
    ry += 8.5;
  }

  y += infoBlockHeight + 8;

  // ── LINE ITEMS TABLE ──
  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 9, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);

  const colDesc = margin + 3;
  const colQty = margin + contentWidth * 0.6;
  const colPrice = margin + contentWidth * 0.73;
  const colTotal = margin + contentWidth - 2;

  doc.text("DESCRIPCIÓN", colDesc, y + 6);
  doc.text("CANT.", colQty, y + 6, { align: "right" });
  doc.text("PRECIO", colPrice + 14, y + 6, { align: "right" });
  doc.text("TOTAL", colTotal, y + 6, { align: "right" });

  y += 11;

  // Rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);

  const rowH = 9;
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]!;
    if (y > 245) {
      doc.addPage();
      y = margin;
    }

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowH, "F");
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text(item.description, colDesc, y + 6, {
      maxWidth: contentWidth * 0.55,
    });
    doc.text(String(item.quantity), colQty, y + 6, { align: "right" });
    doc.text(fmtCurrency(item.unitPrice), colPrice + 14, y + 6, {
      align: "right",
    });
    doc.setFont("helvetica", "bold");
    doc.text(fmtCurrency(item.total), colTotal, y + 6, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += rowH;
  }

  y += 8;

  // ── TOTALS ──
  const totalsX = margin + contentWidth * 0.58;
  const totalsValX = colTotal;
  const totalsLabelW = totalsValX - totalsX;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal", totalsX, y);
  doc.setTextColor(15, 23, 42);
  doc.text(fmtCurrency(data.subtotal), totalsValX, y, { align: "right" });
  y += 7;

  doc.setTextColor(100, 116, 139);
  doc.text(`IVU (${(data.taxRate * 100).toFixed(1)}%)`, totalsX, y);
  doc.setTextColor(15, 23, 42);
  doc.text(fmtCurrency(data.taxAmount), totalsValX, y, { align: "right" });
  y += 3;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(totalsX, y, totalsValX, y);
  y += 5;

  // Total highlight row
  const totalRowW = totalsValX - totalsX + 5;
  doc.setFillColor(236, 253, 245);
  doc.rect(totalsX - 4, y - 3, totalRowW + 4, 12, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text("TOTAL", totalsX, y + 5);
  doc.text(fmtCurrency(data.total), totalsValX, y + 5, { align: "right" });

  y += 18;

  // ── NOTES ──
  if (data.notes) {
    if (y > 235) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("NOTAS", margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const noteLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(noteLines, margin, y);
    y += (noteLines as string[]).length * 4.5 + 8;
  }

  // ── FOOTER (all pages) ──
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footerY = pageHeight - 12;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${data.organization.name}${data.organization.license ? `  •  Lic. ${data.organization.license}` : ""}`,
      margin,
      footerY
    );
    doc.text("Generado por FieldPro", pageWidth / 2, footerY, {
      align: "center",
    });
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, footerY, {
      align: "right",
    });
  }

  // Save
  doc.save(`${data.invoiceNumber}.pdf`);
}
