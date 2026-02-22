"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { Button } from "@fieldpro/ui/components/button";
import { Card, CardContent } from "@fieldpro/ui/components/card";

const editClientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").or(z.literal("")).optional(),
  phone: z.string().optional(),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
  street: z.string().min(1, "La calle es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  zipCode: z.string().min(5, "Código postal válido requerido"),
});

type EditClientData = z.infer<typeof editClientSchema>;

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean;
}

interface ClientData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: "RESIDENTIAL" | "COMMERCIAL";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  addresses: Address[];
}

export function EditClientForm({ client }: { client: ClientData }) {
  const router = useRouter();
  const primaryAddress = client.addresses.find((a) => a.isPrimary);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditClientData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      type: client.type,
      status: client.status,
      street: primaryAddress?.street ?? "",
      city: primaryAddress?.city ?? "",
      zipCode: primaryAddress?.zipCode ?? "",
    },
  });

  const updateClient = trpc.clients.update.useMutation({
    onSuccess: () => {
      router.push(`/clients/${client.id}`);
      router.refresh();
    },
  });

  const onSubmit = (data: EditClientData) => {
    updateClient.mutate({
      id: client.id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      type: data.type,
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="space-y-6 pt-6">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  {...register("type")}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="RESIDENTIAL">Residencial</option>
                  <option value="COMMERCIAL">Comercial</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Estado</label>
                <select
                  {...register("status")}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address (read-only for now - address editing is separate) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dirección</h2>

            <div>
              <label className="text-sm font-medium">Calle</label>
              <input
                {...register("street")}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Ciudad</label>
                <input
                  {...register("city")}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Código Postal</label>
                <input
                  {...register("zipCode")}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {updateClient.error && (
            <p className="text-sm text-destructive">
              {updateClient.error.message}
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
              disabled={isSubmitting || updateClient.isPending}
            >
              {updateClient.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
