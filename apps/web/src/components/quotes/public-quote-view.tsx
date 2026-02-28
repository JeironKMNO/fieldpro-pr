"use client";

import { useState } from "react";
import { Button } from "@fieldpro/ui/components/button";
import { Check, X, AlertTriangle, Phone } from "lucide-react";
import { QuotePreview } from "./quote-preview";
import { respondToQuote } from "@/app/quotes/share/[token]/actions";

interface PublicQuoteData {
  quoteNumber: string;
  title: string | null;
  status: string;
  createdAt: Date;
  validUntil: Date | null;
  notes: string | null;
  subtotal: unknown;
  taxRate: unknown;
  taxAmount: unknown;
  total: unknown;
  respondedAt: Date | null;
  organization: {
    name: string;
    logoUrl?: string | null;
    phone?: string | null;
    license?: string | null;
  };
  client: {
    name: string;
    email: string | null;
    phone: string | null;
    addresses: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    }[];
  };
  sections: {
    id: string;
    subtotal: unknown;
    category: { name: string };
    items: {
      id: string;
      description: string;
      unitType: string;
      quantity: unknown;
      unitPrice: unknown;
      total: unknown;
      length: unknown;
      width: unknown;
    }[];
  }[];
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-PR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function PublicQuoteView({
  quote,
  token,
  canRespond,
  isExpired = false,
}: {
  quote: PublicQuoteData;
  token: string;
  canRespond: boolean;
  isExpired?: boolean;
}) {
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(!canRespond && !isExpired);
  const [responseType, setResponseType] = useState<string | null>(
    canRespond || isExpired ? null : quote.status
  );
  const [confirming, setConfirming] = useState<"ACCEPTED" | "REJECTED" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleRespond = async (response: "ACCEPTED" | "REJECTED") => {
    setResponding(true);
    setError(null);
    const result = await respondToQuote(token, response);
    if (result.success) {
      setResponded(true);
      setResponseType(response);
      setConfirming(null);
    } else if (result.error) {
      setError(result.error);
      setConfirming(null);
    }
    setResponding(false);
  };

  return (
    <div className="space-y-6">
      {/* Expired Banner */}
      {isExpired ? (
        <div className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">
                Esta cotización ha expirado
              </p>
              {quote.validUntil ? (
                <p className="text-sm text-amber-600">
                  Esta cotización era válida hasta{" "}
                  {formatDate(quote.validUntil)}. Por favor contacte a{" "}
                  {quote.organization.name} para una cotización actualizada.
                </p>
              ) : null}
              {quote.organization.phone ? (
                <p className="mt-1 flex items-center gap-1 text-sm text-amber-700">
                  <Phone className="h-3.5 w-3.5" />
                  {quote.organization.phone}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <QuotePreview quote={quote} />

      {/* Response Section */}
      {!isExpired ? (
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-xl mt-8">
          {responded ? (
            <div className="text-center">
              {responseType === "ACCEPTED" ? (
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-green-700">
                    Cotización Aceptada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ¡Gracias! {quote.organization.name} ha sido notificado y se
                    comunicará con usted pronto.
                  </p>
                  {quote.organization.phone ? (
                    <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      Contacto: {quote.organization.phone}
                    </p>
                  ) : null}
                </div>
              ) : responseType === "REJECTED" ? (
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="font-semibold text-red-700">
                    Cotización Rechazada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quote.organization.name} ha sido notificado de su decisión.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Esta cotización ya ha sido respondida.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-center">
              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              {confirming ? (
                <>
                  <p className="font-medium">
                    {confirming === "ACCEPTED"
                      ? "¿Está seguro de que desea aceptar esta cotización?"
                      : "¿Está seguro de que desea rechazar esta cotización?"}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      size="lg"
                      onClick={() => handleRespond(confirming)}
                      disabled={responding}
                      className={
                        confirming === "ACCEPTED"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }
                    >
                      {responding
                        ? "Procesando..."
                        : confirming === "ACCEPTED"
                          ? "Sí, Aceptar"
                          : "Sí, Rechazar"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setConfirming(null)}
                      disabled={responding}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium">¿Desea aceptar esta cotización?</p>
                  <div className="flex justify-center gap-3">
                    <Button
                      size="lg"
                      onClick={() => setConfirming("ACCEPTED")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Aceptar Cotización
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setConfirming("REJECTED")}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
