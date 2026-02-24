import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@fieldpro/db";

export async function createContext() {
  const authData = await auth();
  // currentUser() makes an HTTP call to Clerk — wrap in try/catch so a
  // transient Clerk API failure doesn't take down every tRPC route.
  let user = null;
  if (authData.userId) {
    try {
      user = await currentUser();
    } catch {
      // Non-fatal: user details unavailable, enforceAuth will use DB data
    }
  }

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
