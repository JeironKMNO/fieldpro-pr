import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import { ClientDetail } from "@/components/clients/client-detail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const caller = await api();
    const client = await caller.clients.byId({ id });
    return <ClientDetail client={client} />;
  } catch {
    notFound();
  }
}
