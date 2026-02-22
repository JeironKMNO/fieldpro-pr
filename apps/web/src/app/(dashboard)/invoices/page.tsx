import { InvoiceList } from "@/components/invoices/invoice-list";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">
            Gestiona la facturación y pagos
          </p>
        </div>
      </div>
      <InvoiceList />
    </div>
  );
}
