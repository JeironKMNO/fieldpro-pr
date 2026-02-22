import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@fieldpro/db";

export async function createContext() {
  const authData = await auth();
  const user = authData.userId ? await currentUser() : null;

  let organizationName: string | null = null;
  let organizationSlug: string | null = null;

  if (authData.orgId) {
    try {
      const clerk = await clerkClient();
      const org = await clerk.organizations.getOrganization({
        organizationId: authData.orgId,
      });
      organizationName = org.name;
      organizationSlug = org.slug;
    } catch {
      // Fallback if Clerk API fails
    }
  }

  return {
    auth: {
      userId: authData.userId,
      organizationId: authData.orgId ?? null,
      organizationName,
      organizationSlug,
      role: (authData.sessionClaims?.metadata as { role?: string })?.role ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
    },
    db: prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
