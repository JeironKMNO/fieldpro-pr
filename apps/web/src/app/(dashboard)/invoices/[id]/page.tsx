import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const caller = await api();
    const invoice = await caller.invoice.byId({ id });
    return <InvoiceDetail initialInvoice={{ id: invoice.id }} />;
  } catch {
    notFound();
  }
}
