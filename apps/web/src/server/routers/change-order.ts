import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const changeOrderRouter = router({
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

      return ctx.db.changeOrder.findMany({
        where: { jobId: input.jobId },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        amount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
        select: { id: true },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      return ctx.db.changeOrder.create({
        data: {
          jobId: input.jobId,
          title: input.title,
          description: input.description ?? null,
          amount: input.amount,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().nullish(),
        amount: z.number().optional(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.changeOrder.findUnique({
        where: { id: input.orderId },
        include: { job: { select: { organizationId: true, id: true, value: true } } },
      });

      if (!order || order.job.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Change order not found" });
      }

      const { orderId, ...data } = input;

      // If approving, update job value
      if (data.status === "APPROVED" && order.status !== "APPROVED") {
        await ctx.db.job.update({
          where: { id: order.job.id },
          data: {
            value: { increment: order.amount },
          },
        });
      }

      // If un-approving (was approved, now changing), subtract from job value
      if (order.status === "APPROVED" && data.status && data.status !== "APPROVED") {
        await ctx.db.job.update({
          where: { id: order.job.id },
          data: {
            value: { decrement: order.amount },
          },
        });
      }

      return ctx.db.changeOrder.update({
        where: { id: orderId },
        data: {
          ...data,
          approvedAt: data.status === "APPROVED" ? new Date() : data.status ? null : undefined,
        },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.changeOrder.findUnique({
        where: { id: input.orderId },
        include: { job: { select: { organizationId: true, id: true } } },
      });

      if (!order || order.job.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Change order not found" });
      }

      if (order.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Solo se pueden eliminar órdenes de cambio pendientes",
        });
      }

      return ctx.db.changeOrder.delete({ where: { id: input.orderId } });
    }),
});
