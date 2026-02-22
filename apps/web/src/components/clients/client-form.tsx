"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { Button } from "@fieldpro/ui/components/button";
import { Card, CardContent } from "@fieldpro/ui/components/card";

const clientFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").or(z.literal("")).optional(),
  phone: z.string().optional(),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  street: z.string().min(1, "La calle es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  zipCode: z.string().min(5, "Código postal válido requerido"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export function ClientForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      type: "RESIDENTIAL",
      city: "San Juan",
    },
  });

  const createClient = trpc.clients.create.useMutation({
    onSuccess: (data) => {
      router.push(`/clients/${data.id}`);
    },
  });

  const onSubmit = (data: ClientFormData) => {
    createClient.mutate({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      type: data.type,
      address: {
        street: data.street,
        city: data.city,
        state: "PR",
        zipCode: data.zipCode,
        country: "US",
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Client Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detalles del Cliente</h2>

            <div>
              <label className="text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                {...register("name")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Nombre del cliente"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Correo</label>
                <input
                  {...register("email")}
                  type="email"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="cliente@ejemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="(787) 555-0000"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Tipo <span className="text-destructive">*</span>
              </label>
              <select
                {...register("type")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="RESIDENTIAL">Residencial</option>
                <option value="COMMERCIAL">Comercial</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dirección</h2>

            <div>
              <label className="text-sm font-medium">
                Calle <span className="text-destructive">*</span>
              </label>
              <input
                {...register("street")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="123 Calle Principal"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  Ciudad <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("city")}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="San Juan"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">
                  Código Postal <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("zipCode")}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="00901"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error from mutation */}
          {createClient.error && (
            <p className="text-sm text-destructive">
              {createClient.error.message}
            </p>
          )}

          {/* Actions */}
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
              disabled={isSubmitting || createClient.isPending}
            >
              {createClient.isPending ? "Creando..." : "Crear Cliente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
