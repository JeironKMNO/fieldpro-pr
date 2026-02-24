import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const expenseRouter = router({
  // Get all expenses for a job
  byJobId: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.expense.findMany({
        where: {
          jobId: input.jobId,
          organizationId: ctx.auth.organizationId,
        },
        orderBy: { date: "desc" },
      });
    }),

  // Add an expense
  create: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        description: z.string(),
        amount: z.number().positive(),
        date: z.date(),
        category: z.enum([
          "EQUIPMENT",
          "SUBCONTRACTOR",
          "PERMITS",
          "MATERIAL",
          "LABOR",
          "OTHER",
        ]),
        vendor: z.string().optional(),
        receiptUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify job belongs to organization
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      return ctx.db.expense.create({
        data: {
          organizationId: ctx.auth.organizationId,
          jobId: input.jobId,
          description: input.description,
          amount: input.amount,
          date: input.date,
          category: input.category,
          vendor: input.vendor,
          receiptUrl: input.receiptUrl,
        },
      });
    }),

  // Delete an expense
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      return ctx.db.expense.delete({
        where: { id: input.id },
      });
    }),
});
