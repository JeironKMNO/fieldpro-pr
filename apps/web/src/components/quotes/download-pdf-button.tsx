"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@fieldpro/ui/components/button";
import { Download, Loader2 } from "lucide-react";
import { QuotePdfDocument } from "./quote-pdf";

type PdfQuote = Parameters<typeof QuotePdfDocument>[0]["quote"];

export function DownloadPdfButton({ quote }: { quote: PdfQuote }) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(<QuotePdfDocument quote={quote} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quote.quoteNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={generating}
    >
      {generating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {generating ? "Generando..." : "Descargar"}
    </Button>
  );
}
