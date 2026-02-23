import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@fieldpro/db";

export async function createContext() {
  const authData = await auth();
  const user = authData.userId ? await currentUser() : null;

  return {
    auth: {
      userId: authData.userId,
      organizationId: authData.orgId ?? null,
      // orgSlug is embedded in the session token — no extra API call needed
      organizationName: (authData.sessionClaims?.org_name as string) ?? null,
      organizationSlug: authData.orgSlug ?? null,
      role:
        (authData.sessionClaims?.metadata as { role?: string })?.role ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
    },
    db: prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
