import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@fieldpro/db";
import { AgentPageClient } from "@/components/agent/agent-page";

export const metadata = {
  title: "Agente IA | FieldPro",
};

export default async function AgentPage() {
  const { orgId } = await auth();
  if (!orgId) notFound();

  const org = await prisma.organization.findFirst({
    where: { clerkId: orgId },
    select: { id: true },
  });

  if (!org) notFound();

  const conversations = await prisma.agentConversation.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-4 -my-4 md:-mx-6 md:-my-6 lg:-mx-8 lg:-my-8 overflow-hidden">
      <AgentPageClient
        initialConversations={conversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt,
        }))}
      />
    </div>
  );
}
