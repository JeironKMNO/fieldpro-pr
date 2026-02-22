import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import { EditClientForm } from "@/components/clients/edit-client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const caller = await api();
    const client = await caller.clients.byId({ id });
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Update client information
          </p>
        </div>
        <EditClientForm client={client} />
      </div>
    );
  } catch {
    notFound();
  }
}
