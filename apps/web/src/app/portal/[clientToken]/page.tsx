import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPortalDataByToken } from "@/server/data/portal";
import { ClientPortalView } from "@/components/portal/client-portal-view";

export const metadata: Metadata = {
  title: "Portal del Cliente — FieldPro",
};

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ clientToken: string }>;
}) {
  const { clientToken } = await params;
  const data = await getPortalDataByToken(clientToken);

  if (!data) {
    notFound();
  }

  return <ClientPortalView data={data} />;
}
