import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const createClientInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().optional().nullable(),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  address: z
    .object({
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().default("PR"),
      zipCode: z.string().min(5, "Valid zip code required"),
      country: z.string().default("US"),
    })
    .optional(),
});

const updateClientInput = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  type: z.enum(["RESIDENTIAL", "COMMERCIAL"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export const clientRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(["RESIDENTIAL", "COMMERCIAL"]).optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
        tagId: z.string().optional(),
        sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, type, status, tagId, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where = {
        organizationId: ctx.auth.organizationId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(type && { type }),
        ...(status && { status }),
        ...(tagId && {
          tags: { some: { tagId } },
        }),
      };

      const [clients, total] = await Promise.all([
        ctx.db.client.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            addresses: {
              where: { isPrimary: true },
              take: 1,
            },
            tags: {
              include: { tag: true },
            },
            _count: {
              select: { notes: true },
            },
          },
        }),
        ctx.db.client.count({ where }),
      ]);

      return {
        clients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.client.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
        include: {
          addresses: {
            orderBy: { isPrimary: "desc" },
          },
          tags: {
            include: { tag: true },
          },
          notes: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return client;
    }),

  create: protectedProcedure
    .input(createClientInput)
    .mutation(async ({ ctx, input }) => {
      const { address, ...clientData } = input;

      return ctx.db.client.create({
        data: {
          ...clientData,
          organizationId: ctx.auth.organizationId,
          status: "ACTIVE",
          addresses: address
            ? { create: { ...address, isPrimary: true } }
            : undefined,
        },
        include: { addresses: true },
      });
    }),

  update: protectedProcedure
    .input(updateClientInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.client.findFirst({
        where: { id, organizationId: ctx.auth.organizationId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return ctx.db.client.update({
        where: { id },
        data,
        include: { addresses: true },
      });
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.client.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return ctx.db.client.update({
        where: { id: input.id },
        data: { status: "ARCHIVED" },
      });
    }),
});
