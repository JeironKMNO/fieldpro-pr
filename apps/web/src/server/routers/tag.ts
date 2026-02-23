import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const tagRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      where: { organizationId: ctx.auth.organizationId },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { clients: true } },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(30),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .default("#6B7280"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.tag.findUnique({
        where: {
          organizationId_name: {
            organizationId: ctx.auth.organizationId,
            name: input.name,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A tag with this name already exists",
        });
      }

      return ctx.db.tag.create({
        data: {
          organizationId: ctx.auth.organizationId,
          name: input.name,
          color: input.color,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });

      if (!tag) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
      }

      return ctx.db.tag.delete({ where: { id: input.id } });
    }),

  assignToClient: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        tagId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [client, tag] = await Promise.all([
        ctx.db.client.findFirst({
          where: {
            id: input.clientId,
            organizationId: ctx.auth.organizationId,
          },
        }),
        ctx.db.tag.findFirst({
          where: { id: input.tagId, organizationId: ctx.auth.organizationId },
        }),
      ]);

      if (!client || !tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client or tag not found",
        });
      }

      return ctx.db.clientTag.create({
        data: {
          clientId: input.clientId,
          tagId: input.tagId,
        },
      });
    }),

  removeFromClient: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        tagId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [client, tag] = await Promise.all([
        ctx.db.client.findFirst({
          where: {
            id: input.clientId,
            organizationId: ctx.auth.organizationId,
          },
        }),
        ctx.db.tag.findFirst({
          where: { id: input.tagId, organizationId: ctx.auth.organizationId },
        }),
      ]);

      if (!client || !tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client or tag not found",
        });
      }

      return ctx.db.clientTag.delete({
        where: {
          clientId_tagId: {
            clientId: input.clientId,
            tagId: input.tagId,
          },
        },
      });
    }),
});
