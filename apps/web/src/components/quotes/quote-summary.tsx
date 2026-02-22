"use client";

import { Card, CardContent } from "@fieldpro/ui/components/card";
import { Separator } from "@fieldpro/ui/components/separator";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function QuoteSummary({
  subtotal,
  taxRate,
  taxAmount,
  total,
}: {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="ml-auto max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              IVU ({(taxRate * 100).toFixed(1)}%)
            </span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
