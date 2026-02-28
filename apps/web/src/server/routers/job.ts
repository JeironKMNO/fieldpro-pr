import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@fieldpro/db";
import { router, protectedProcedure } from "../trpc";

export const jobRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z
          .enum([
            "SCHEDULED",
            "IN_PROGRESS",
            "ON_HOLD",
            "COMPLETED",
            "CANCELLED",
          ])
          .optional(),
        clientId: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "jobNumber", "scheduledDate", "value"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, clientId, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      const where: Prisma.JobWhereInput = {
        organizationId: ctx.auth.organizationId,
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(search && {
          OR: [
            { jobNumber: { contains: search, mode: "insensitive" as const } },
            {
              client: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            { title: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [jobs, total] = await Promise.all([
        ctx.db.job.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            client: { select: { name: true } },
            quote: { select: { quoteNumber: true } },
          },
        }),
        ctx.db.job.count({ where }),
      ]);

      return {
        jobs: jobs.map((j) => ({
          ...j,
          value: Number(j.value),
        })),
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
      const job = await ctx.db.job.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
        include: {
          client: {
            include: {
              addresses: { where: { isPrimary: true }, take: 1 },
            },
          },
          quote: {
            select: {
              id: true,
              quoteNumber: true,
              total: true,
              sections: {
                orderBy: { sortOrder: "asc" },
                include: {
                  category: true,
                  items: { orderBy: { sortOrder: "asc" } },
                },
              },
            },
          },
          createdBy: {
            select: { firstName: true, lastName: true },
          },
          organization: {
            select: { name: true },
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              total: true,
            },
          },
          tasks: { orderBy: { sortOrder: "asc" } },
          changeOrders: { orderBy: { createdAt: "asc" } },
        },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return job;
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        title: z.string().optional(),
        scheduledDate: z.date().optional(),
        notes: z.string().optional(),
        quoteId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          clerkId: ctx.auth.userId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found in database",
        });
      }

      // Verify client belongs to org
      const client = await ctx.db.client.findFirst({
        where: {
          id: input.clientId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      let value = 0;

      // If creating from a quote, copy value and verify
      if (input.quoteId) {
        const quote = await ctx.db.quote.findFirst({
          where: {
            id: input.quoteId,
            organizationId: ctx.auth.organizationId,
          },
          include: { job: { select: { id: true } } },
        });

        if (!quote) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quote not found",
          });
        }

        if (quote.job) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This quote already has a job",
          });
        }

        value = Number(quote.total);
      }

      // Atomic job number
      const counter = await ctx.db.jobCounter.upsert({
        where: { organizationId: ctx.auth.organizationId },
        update: { lastNumber: { increment: 1 } },
        create: { organizationId: ctx.auth.organizationId, lastNumber: 1 },
      });

      const jobNumber = `JB-${String(counter.lastNumber).padStart(3, "0")}`;

      return ctx.db.job.create({
        data: {
          organizationId: ctx.auth.organizationId,
          clientId: input.clientId,
          quoteId: input.quoteId ?? null,
          createdById: user.id,
          jobNumber,
          title: input.title,
          scheduledDate: input.scheduledDate,
          notes: input.notes,
          value,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        scheduledDate: z.date().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const job = await ctx.db.job.findFirst({
        where: { id, organizationId: ctx.auth.organizationId },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (job.status === "COMPLETED" || job.status === "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Completed or cancelled jobs cannot be edited",
        });
      }

      return ctx.db.job.update({ where: { id }, data });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "SCHEDULED",
          "IN_PROGRESS",
          "ON_HOLD",
          "COMPLETED",
          "CANCELLED",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const data: Prisma.JobUpdateInput = { status: input.status };

      if (input.status === "IN_PROGRESS" && !job.startedAt) {
        data.startedAt = new Date();
      }

      if (input.status === "COMPLETED") {
        data.completedAt = new Date();
      }

      return ctx.db.job.update({
        where: { id: input.id },
        data,
      });
    }),

  setBudget: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        materialBudget: z.number().min(0),
        operationalBudget: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
      });
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      return ctx.db.job.update({
        where: { id: input.jobId },
        data: {
          materialBudget: input.materialBudget,
          operationalBudget: input.operationalBudget,
        },
      });
    }),

  updateValue: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        value: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
      });
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }
      return ctx.db.job.update({
        where: { id: input.jobId },
        data: { value: input.value },
      });
    }),

  budgetSummary: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const orgId = ctx.auth.organizationId;
      const [job, materialAgg, operationalAgg] = await Promise.all([
        ctx.db.job.findFirst({
          where: { id: input.jobId, organizationId: orgId },
          select: {
            value: true,
            materialBudget: true,
            operationalBudget: true,
          },
        }),
        ctx.db.expense.aggregate({
          where: {
            jobId: input.jobId,
            organizationId: orgId,
            category: "MATERIAL",
          },
          _sum: { amount: true },
        }),
        ctx.db.expense.aggregate({
          where: {
            jobId: input.jobId,
            organizationId: orgId,
            category: { not: "MATERIAL" },
          },
          _sum: { amount: true },
        }),
      ]);

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const totalQuotedAmount = Number(job.value);
      const materialBudget = Number(job.materialBudget);
      const operationalBudget = Number(job.operationalBudget);
      const materialSpent = Number(materialAgg._sum.amount ?? 0);
      const operationalSpent = Number(operationalAgg._sum.amount ?? 0);
      const totalSpent = materialSpent + operationalSpent;
      const grossProfit = totalQuotedAmount - totalSpent;

      return {
        totalQuotedAmount,
        materialBudget,
        operationalBudget,
        materialSpent,
        operationalSpent,
        totalSpent,
        grossProfit,
        profitMarginPercent:
          totalQuotedAmount > 0 ? (grossProfit / totalQuotedAmount) * 100 : 0,
        status:
          grossProfit > 0
            ? "PROFITABLE"
            : grossProfit === 0
              ? "BREAK_EVEN"
              : "LOSS",
      };
    }),

  // ==========================================
  // JOB PHOTOS
  // ==========================================

  getPhotos: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Validate job belongs to org
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
      });
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.jobPhoto.findMany({
        where: { jobId: input.jobId },
        orderBy: { createdAt: "desc" },
      });
    }),

  addPhoto: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        url: z.string(),
        caption: z.string().optional(),
        type: z.enum(["BEFORE", "DURING", "AFTER", "OTHER"]).default("OTHER"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate job belongs to org
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
      });
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.jobPhoto.create({
        data: {
          jobId: input.jobId,
          url: input.url,
          caption: input.caption,
          type: input.type,
        },
      });
    }),

  deletePhoto: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find photo and verify it belongs to a job in the user's org
      const photo = await ctx.db.jobPhoto.findUnique({
        where: { id: input.id },
        include: { job: true },
      });

      if (!photo || photo.job.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
      }

      return ctx.db.jobPhoto.delete({
        where: { id: input.id },
      });
    }),
});
