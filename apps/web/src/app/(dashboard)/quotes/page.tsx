import Link from "next/link";
import { Button } from "@fieldpro/ui/components/button";
import { Plus } from "lucide-react";
import { QuoteList } from "@/components/quotes/quote-list";

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="text-muted-foreground">
            Gestiona tus presupuestos de construcción
          </p>
        </div>
        <Link href="/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </Link>
      </div>
      <QuoteList />
    </div>
  );
}
