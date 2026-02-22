import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const jobTaskRouter = router({
  list: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
        select: { id: true },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.jobTask.findMany({
        where: { jobId: input.jobId },
        orderBy: { sortOrder: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        title: z.string().min(1),
        notes: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
        select: { id: true, _count: { select: { tasks: true } } },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.jobTask.create({
        data: {
          jobId: input.jobId,
          title: input.title,
          notes: input.notes ?? null,
          dueDate: input.dueDate ?? null,
          sortOrder: job._count.tasks,
        },
      });
    }),

  toggleStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.jobTask.findUnique({
        where: { id: input.taskId },
        include: { job: { select: { organizationId: true } } },
      });

      if (!task || task.job.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      const nextStatus =
        task.status === "PENDING"
          ? "IN_PROGRESS"
          : task.status === "IN_PROGRESS"
            ? "COMPLETED"
            : "PENDING";

      return ctx.db.jobTask.update({
        where: { id: input.taskId },
        data: {
          status: nextStatus,
          completedAt: nextStatus === "COMPLETED" ? new Date() : null,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().min(1).optional(),
        notes: z.string().nullish(),
        dueDate: z.date().nullish(),
        status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.jobTask.findUnique({
        where: { id: input.taskId },
        include: { job: { select: { organizationId: true } } },
      });

      if (!task || task.job.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      const { taskId, ...data } = input;
      return ctx.db.jobTask.update({
        where: { id: taskId },
        data: {
          ...data,
          completedAt: data.status === "COMPLETED" ? new Date() : data.status ? null : undefined,
        },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.jobTask.findUnique({
        where: { id: input.taskId },
        include: { job: { select: { organizationId: true } } },
      });

      if (!task || task.job.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      return ctx.db.jobTask.delete({ where: { id: input.taskId } });
    }),
});
