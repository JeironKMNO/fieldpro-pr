"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fieldpro/ui/components/table";
import { Plus, Trash2 } from "lucide-react";
import { QuoteItemRow } from "./quote-item-row";

interface SectionData {
  id: string;
  subtotal: unknown;
  category: { id: string; name: string };
  items: {
    id: string;
    description: string;
    unitType: string;
    length: unknown;
    width: unknown;
    height: unknown;
    quantity: unknown;
    unitPrice: unknown;
    markupPct: unknown;
    total: unknown;
    sortOrder: number;
  }[];
}

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

export function QuoteSectionCard({
  section,
  isDraft,
  onUpdate,
}: {
  section: SectionData;
  isDraft: boolean;
  onUpdate: () => void;
}) {
  const addItem = trpc.quote.addItem.useMutation({
    onSuccess: onUpdate,
  });

  const removeSection = trpc.quote.removeSection.useMutation({
    onSuccess: onUpdate,
  });

  const handleAddItem = () => {
    addItem.mutate({
      sectionId: section.id,
      description: "Nuevo artículo",
      unitType: "SQ_FT",
      quantity: 1,
      unitPrice: 0,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{section.category.name}</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Subtotal: {formatCurrency(section.subtotal)}
            </span>
            {isDraft && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeSection.mutate({ sectionId: section.id })}
                disabled={removeSection.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Descripción</TableHead>
                <TableHead className="w-[100px]">Unidad</TableHead>
                <TableHead className="w-[80px]">L (ft)</TableHead>
                <TableHead className="w-[80px]">W (ft)</TableHead>
                <TableHead className="w-[80px]">Cant.</TableHead>
                <TableHead className="w-[100px]">Precio U.</TableHead>
                <TableHead className="w-[100px] text-right">Total</TableHead>
                {isDraft && <TableHead className="w-[40px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.items
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <QuoteItemRow
                    key={item.id}
                    item={item}
                    isDraft={isDraft}
                    onUpdate={onUpdate}
                  />
                ))}
              {section.items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isDraft ? 8 : 7}
                    className="text-center text-muted-foreground py-4"
                  >
                    Aún sin artículos. Agrega uno abajo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {isDraft && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={handleAddItem}
            disabled={addItem.isPending}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar Artículo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
