import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const agentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.db.agentConversation.findMany({
      where: { organizationId: ctx.auth.organizationId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return conversations;
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db.agentConversation.create({
        data: {
          organizationId: ctx.auth.organizationId,
          title: input.title ?? null,
        },
      });
      return conversation;
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db.agentConversation.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      return conversation;
    }),

  updateTitle: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.db.agentConversation.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });
      if (!conv) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.agentConversation.update({
        where: { id: input.id },
        data: { title: input.title },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conv = await ctx.db.agentConversation.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });
      if (!conv) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.agentConversation.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
