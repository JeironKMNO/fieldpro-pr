import { prisma } from "@fieldpro/db";
import { notFound } from "next/navigation";
import { PublicInvoiceView } from "@/components/invoices/public-invoice-view";

export default async function ShareInvoicePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const invoice = await prisma.invoice.findUnique({
        where: { shareToken: token },
        include: {
            organization: {
                select: { name: true, logoUrl: true, phone: true, license: true },
            },
            client: {
                include: {
                    addresses: { where: { isPrimary: true }, take: 1 },
                },
            },
            items: { orderBy: { sortOrder: "asc" } },
        },
    });

    if (!invoice) {
        notFound();
    }

    // Mark as viewed if SENT
    if (invoice.status === "SENT" && !invoice.viewedAt) {
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "VIEWED", viewedAt: new Date() },
        });
        await prisma.invoiceActivity.create({
            data: { invoiceId: invoice.id, type: "VIEWED" },
        });
    }

    const isOverdue =
        invoice.dueDate &&
        new Date(invoice.dueDate) < new Date() &&
        !["PAID", "CANCELLED"].includes(invoice.status);

    return (
        <PublicInvoiceView
            invoice={invoice}
            isOverdue={!!isOverdue}
        />
    );
}
