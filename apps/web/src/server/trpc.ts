import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.userId || !ctx.auth.organizationId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in and have an organization selected",
    });
  }

  // Auto-sync: ensure Organization exists in DB
  const org = await ctx.db.organization.upsert({
    where: { clerkId: ctx.auth.organizationId },
    update: {},
    create: {
      clerkId: ctx.auth.organizationId,
      name: ctx.auth.organizationName ?? "My Organization",
      slug: ctx.auth.organizationSlug ?? ctx.auth.organizationId,
    },
  });

  // Auto-sync: ensure User exists in DB
  await ctx.db.user.upsert({
    where: { clerkId: ctx.auth.userId },
    update: { organizationId: org.id },
    create: {
      clerkId: ctx.auth.userId,
      organizationId: org.id,
      email: ctx.auth.email ?? "",
      firstName: ctx.auth.firstName ?? null,
      lastName: ctx.auth.lastName ?? null,
      role: "ADMIN",
    },
  });

  return next({
    ctx: {
      auth: {
        userId: ctx.auth.userId,
        organizationId: org.id,
        role: ctx.auth.role,
      },
      db: ctx.db,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
