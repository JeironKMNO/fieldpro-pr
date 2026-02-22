import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
        <p className="text-muted-foreground">
          Crea un perfil de cliente con información de contacto y dirección
        </p>
      </div>

      <ClientForm />
    </div>
  );
}
