"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@fieldpro/ui/components/button";
import { Card, CardContent } from "@fieldpro/ui/components/card";

const quoteFormSchema = z.object({
  clientId: z.string().min(1, "Selecciona un cliente"),
  title: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(11.5),
  validDays: z.number().min(1).max(365).default(30),
  notes: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  templateId?: string;
  templateName?: string;
}

export function QuoteForm({ templateId, templateName }: QuoteFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") ?? "";

  const clients = trpc.clients.list.useQuery({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientId: preselectedClientId,
      title: templateName ?? "",
      taxRate: 11.5,
      validDays: 30,
      notes: "",
    },
  });

  const createQuote = trpc.quote.create.useMutation({
    onSuccess: (quote) => {
      router.push(`/quotes/${quote.id}`);
    },
  });

  const createFromTemplate = trpc.quote.createFromTemplate.useMutation({
    onSuccess: (quote) => {
      router.push(`/quotes/${quote.id}`);
    },
  });

  const isPending = createQuote.isPending || createFromTemplate.isPending;
  const error = createQuote.error ?? createFromTemplate.error;

  const onSubmit = (data: QuoteFormData) => {
    if (templateId) {
      createFromTemplate.mutate({
        clientId: data.clientId,
        templateId,
        title: data.title || undefined,
        taxRate: data.taxRate / 100,
        validDays: data.validDays,
        notes: data.notes || undefined,
      });
    } else {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + data.validDays);

      createQuote.mutate({
        clientId: data.clientId,
        title: data.title || undefined,
        taxRate: data.taxRate / 100,
        validUntil,
        notes: data.notes || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detalles de Cotización</h2>

            <div>
              <label className="text-sm font-medium">
                Cliente <span className="text-destructive">*</span>
              </label>
              <select
                {...register("clientId")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecciona un cliente...</option>
                {clients.data?.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.type})
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.clientId.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Título del Proyecto</label>
              <input
                {...register("title")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="ej. Remodelación de Cocina, Reparación de Techo..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">IVU (%)</label>
                <input
                  {...register("taxRate", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Puerto Rico IVU: 11.5%
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Válida por (días)
                </label>
                <input
                  {...register("validDays", { valueAsNumber: true })}
                  type="number"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Notas y Condiciones
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Términos de pago, garantías, condiciones..."
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error.message}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
            >
              {isPending
                ? templateId
                  ? "Creando con plantilla..."
                  : "Creando..."
                : templateId
                  ? "Crear con Plantilla"
                  : "Crear Cotización"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
