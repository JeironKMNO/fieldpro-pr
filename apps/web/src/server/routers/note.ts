import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const noteRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        content: z.string().min(1, "Note content is required"),
        type: z.enum(["GENERAL", "IMPORTANT", "FOLLOW_UP"]).default("GENERAL"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the user record in our DB by their Clerk ID
      const user = await ctx.db.user.findFirst({
        where: {
          clerkId: ctx.auth.userId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found in database",
        });
      }

      // Verify the client belongs to this organization
      const client = await ctx.db.client.findFirst({
        where: {
          id: input.clientId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return ctx.db.note.create({
        data: {
          organizationId: ctx.auth.organizationId,
          clientId: input.clientId,
          userId: user.id,
          content: input.content,
          type: input.type,
        },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      });
    }),
});
