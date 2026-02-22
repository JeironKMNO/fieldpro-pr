import jsPDF from "jspdf";

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
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function fmtDate(d: Date | string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function generateInvoicePDF(data: InvoicePDFData) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ── Header ──
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(data.organization.name, margin, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const headerDetails: string[] = [];
    if (data.organization.phone) headerDetails.push(data.organization.phone);
    if (data.organization.license) headerDetails.push(`Lic: ${data.organization.license}`);
    if (headerDetails.length) {
        doc.text(headerDetails.join("  •  "), margin, 30);
    }

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", pageWidth - margin, 20, { align: "right" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(data.invoiceNumber, pageWidth - margin, 30, { align: "right" });

    y = 54;

    // ── Invoice Info + Client ──
    doc.setTextColor(0, 0, 0);

    // Left: Bill To
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("FACTURAR A:", margin, y);
    y += 5;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(data.client.name, margin, y);
    doc.setFont("helvetica", "normal");
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    if (data.client.email) { doc.text(data.client.email, margin, y); y += 4; }
    if (data.client.phone) { doc.text(data.client.phone, margin, y); y += 4; }
    if (data.client.address) { doc.text(data.client.address, margin, y); y += 4; }

    // Right: Invoice details
    const rightX = pageWidth - margin;
    let ry = 54;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("FECHA:", rightX - 40, ry);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(fmtDate(data.createdAt), rightX, ry, { align: "right" });
    ry += 6;

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("VENCIMIENTO:", rightX - 40, ry);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(fmtDate(data.dueDate), rightX, ry, { align: "right" });
    ry += 6;

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("ESTADO:", rightX - 40, ry);

    const statusLabels: Record<string, string> = {
        DRAFT: "Borrador",
        SENT: "Enviada",
        VIEWED: "Vista",
        PAID: "Pagada",
        OVERDUE: "Vencida",
        CANCELLED: "Cancelada",
    };
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(statusLabels[data.status] ?? data.status, rightX, ry, { align: "right" });

    y = Math.max(y, ry) + 12;

    // ── Line Items Table ──
    // Table header
    doc.setFillColor(243, 244, 246); // gray-100
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99);

    const colDesc = margin + 2;
    const colQty = margin + contentWidth * 0.6;
    const colPrice = margin + contentWidth * 0.73;
    const colTotal = margin + contentWidth - 2;

    doc.text("DESCRIPCIÓN", colDesc, y + 5.5);
    doc.text("CANT.", colQty, y + 5.5, { align: "right" });
    doc.text("PRECIO", colPrice + 14, y + 5.5, { align: "right" });
    doc.text("TOTAL", colTotal, y + 5.5, { align: "right" });

    y += 10;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    for (const item of data.items) {
        if (y > 250) {
            doc.addPage();
            y = margin;
        }

        doc.text(item.description, colDesc, y + 4, { maxWidth: contentWidth * 0.55 });
        doc.text(String(item.quantity), colQty, y + 4, { align: "right" });
        doc.text(fmtCurrency(item.unitPrice), colPrice + 14, y + 4, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text(fmtCurrency(item.total), colTotal, y + 4, { align: "right" });
        doc.setFont("helvetica", "normal");

        y += 7;

        // Row separator
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y, margin + contentWidth, y);
        y += 1;
    }

    y += 6;

    // ── Totals ──
    const totalsX = margin + contentWidth * 0.6;
    const totalsValX = colTotal;

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Subtotal", totalsX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(fmtCurrency(data.subtotal), totalsValX, y, { align: "right" });
    y += 6;

    doc.setTextColor(107, 114, 128);
    doc.text(`IVU (${(data.taxRate * 100).toFixed(1)}%)`, totalsX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(fmtCurrency(data.taxAmount), totalsValX, y, { align: "right" });
    y += 2;

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(totalsX, y, totalsValX, y);
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", totalsX, y);
    doc.text(fmtCurrency(data.total), totalsValX, y, { align: "right" });

    y += 12;

    // ── Notes ──
    if (data.notes) {
        if (y > 240) { doc.addPage(); y = margin; }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(107, 114, 128);
        doc.text("NOTAS:", margin, y);
        y += 5;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(75, 85, 99);
        const noteLines = doc.splitTextToSize(data.notes, contentWidth);
        doc.text(noteLines, margin, y);
        y += noteLines.length * 4 + 8;
    }

    // ── Footer ──
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
        `${data.organization.name}  •  Generado por FieldPro`,
        pageWidth / 2,
        footerY,
        { align: "center" }
    );

    // Save
    doc.save(`${data.invoiceNumber}.pdf`);
}
