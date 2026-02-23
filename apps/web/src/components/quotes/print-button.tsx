"use client";

import { Button } from "@fieldpro/ui/components/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="mr-2 h-4 w-4" />
      Imprimir
    </Button>
  );
}
