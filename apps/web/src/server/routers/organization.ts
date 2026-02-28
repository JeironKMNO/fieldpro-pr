import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const organizationRouter = router({
  current: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.organization.findFirst({
      where: { id: ctx.auth.organizationId },
      include: {
        _count: {
          select: { users: true, clients: true },
        },
      },
    });
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.auth.organizationId;

    const [totalClients, activeClients, totalNotes] = await Promise.all([
      ctx.db.client.count({ where: { organizationId: orgId } }),
      ctx.db.client.count({
        where: { organizationId: orgId, status: "ACTIVE" },
      }),
      ctx.db.note.count({ where: { organizationId: orgId } }),
    ]);

    return { totalClients, activeClients, totalNotes };
  }),

  dashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.auth.organizationId;

    if (!orgId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No organization selected",
      });
    }

    try {
      // BATCH 1: Quotes summary & revenue
      const [quotesByStatus, revenueAccepted, revenuePending, revenueDraft] =
        await Promise.all([
          ctx.db.quote.groupBy({
            by: ["status"],
            where: { organizationId: orgId },
            _count: true,
          }),
          ctx.db.quote.aggregate({
            where: { organizationId: orgId, status: "ACCEPTED" },
            _sum: { total: true },
          }),
          ctx.db.quote.aggregate({
            where: {
              organizationId: orgId,
              status: { in: ["SENT", "VIEWED"] },
            },
            _sum: { total: true },
          }),
          ctx.db.quote.aggregate({
            where: { organizationId: orgId, status: "DRAFT" },
            _sum: { total: true },
          }),
        ]);

      // BATCH 2: Clients & Recent activity
      const [clientsByStatus, clientsByType, recentQuotes, recentClients] =
        await Promise.all([
          ctx.db.client.groupBy({
            by: ["status"],
            where: { organizationId: orgId },
            _count: true,
          }),
          ctx.db.client.groupBy({
            by: ["type"],
            where: { organizationId: orgId },
            _count: true,
          }),
          ctx.db.quote.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              quoteNumber: true,
              status: true,
              total: true,
              createdAt: true,
              client: { select: { name: true } },
            },
          }),
          ctx.db.client.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              name: true,
              type: true,
              createdAt: true,
              _count: { select: { quotes: true } },
            },
          }),
        ]);

      // BATCH 3: Jobs, Invoices, Attention quotes & raw monthly data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const [
        jobsByStatus,
        invoicesByStatus,
        acceptedQuotesRaw,
        attentionQuotes,
      ] = await Promise.all([
        ctx.db.job.groupBy({
          by: ["status"],
          where: { organizationId: orgId },
          _count: true,
        }),
        ctx.db.invoice.groupBy({
          by: ["status"],
          where: { organizationId: orgId },
          _count: true,
        }),
        // Replace $queryRaw with regular Prisma query — avoids Prisma.sql
        // bundling issues and works on all environments
        ctx.db.quote.findMany({
          where: {
            organizationId: orgId,
            status: "ACCEPTED",
            createdAt: { gte: sixMonthsAgo },
          },
          select: { total: true, createdAt: true },
        }),
        ctx.db.quote.findMany({
          where: {
            organizationId: orgId,
            status: { in: ["SENT", "VIEWED"] },
          },
          orderBy: { sentAt: "asc" },
          take: 10,
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            sentAt: true,
            viewedAt: true,
            validUntil: true,
            shareToken: true,
            client: { select: { name: true, phone: true, email: true } },
          },
        }),
      ]);

      // Compute monthly revenue in JS (replaces $queryRaw / Prisma.sql)
      const MONTH_LABELS = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthMap = new Map<string, number>();
      for (const q of acceptedQuotesRaw) {
        const d = new Date(q.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(key, (monthMap.get(key) ?? 0) + Number(q.total));
      }
      const monthlyRevenue = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, total]) => ({
          month,
          label: MONTH_LABELS[parseInt(month.split("-")[1]!) - 1] ?? month,
          total,
        }));

      // BATCH 4: Invoice Revenue
      const [invoicePaidTotal, invoiceOutstandingTotal] = await Promise.all([
        ctx.db.invoice.aggregate({
          where: { organizationId: orgId, status: "PAID" },
          _sum: { total: true },
        }),
        ctx.db.invoice.aggregate({
          where: {
            organizationId: orgId,
            status: { in: ["SENT", "VIEWED", "OVERDUE"] },
          },
          _sum: { total: true },
        }),
      ]);

      // BATCH 5: Monthly financials & profit metrics
      const [
        completedJobsMonthly,
        activeInvoicesRaw,
        expensesRaw,
        completedJobsAgg,
        totalPaidInvoicesAgg,
        totalExpensesAgg,
      ] = await Promise.all([
        // Completed jobs for "Cobrado" monthly chart (grouped by completedAt)
        ctx.db.job.findMany({
          where: {
            organizationId: orgId,
            status: "COMPLETED",
            completedAt: { gte: sixMonthsAgo },
          },
          select: { value: true, completedAt: true },
        }),
        // Active invoices for "Facturado" monthly chart (grouped by createdAt)
        ctx.db.invoice.findMany({
          where: {
            organizationId: orgId,
            status: { notIn: ["CANCELLED", "DRAFT"] },
            createdAt: { gte: sixMonthsAgo },
          },
          select: { total: true, createdAt: true },
        }),
        ctx.db.expense.findMany({
          where: {
            organizationId: orgId,
            date: { gte: sixMonthsAgo },
          },
          select: { amount: true, date: true },
        }),
        ctx.db.job.aggregate({
          where: { organizationId: orgId, status: "COMPLETED" },
          _sum: { value: true },
        }),
        ctx.db.invoice.aggregate({
          where: { organizationId: orgId, status: "PAID" },
          _sum: { total: true },
        }),
        ctx.db.expense.aggregate({
          where: { organizationId: orgId },
          _sum: { amount: true },
        }),
      ]);

      // Generate last 6 month keys (YYYY-MM) in chronological order
      const MONTH_LABELS_ES: Record<string, string> = {
        "01": "Ene",
        "02": "Feb",
        "03": "Mar",
        "04": "Abr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Ago",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dic",
      };
      const last6Months: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        last6Months.push(key);
      }

      // Cobrado = completed jobs grouped by completedAt month
      const cobradoByMonth = new Map<string, number>();
      for (const job of completedJobsMonthly) {
        if (job.completedAt) {
          const d = new Date(job.completedAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          cobradoByMonth.set(
            key,
            (cobradoByMonth.get(key) ?? 0) + Number(job.value)
          );
        }
      }

      // Facturado = active invoices grouped by createdAt month
      const facturadoByMonth = new Map<string, number>();
      for (const inv of activeInvoicesRaw) {
        const d = new Date(inv.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        facturadoByMonth.set(
          key,
          (facturadoByMonth.get(key) ?? 0) + Number(inv.total)
        );
      }

      const expenseByMonth = new Map<string, number>();
      for (const exp of expensesRaw) {
        const d = new Date(exp.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        expenseByMonth.set(
          key,
          (expenseByMonth.get(key) ?? 0) + Number(exp.amount)
        );
      }

      const monthlyFinancials = last6Months.map((month) => ({
        month,
        label: MONTH_LABELS_ES[month.split("-")[1]!] ?? month,
        // Facturado = invoice totals for that month (billed to client)
        invoiceRevenue: facturadoByMonth.get(month) ?? 0,
        // Cobrado = completed job values for that month (money earned)
        invoicePaid: cobradoByMonth.get(month) ?? 0,
        invoicePending: facturadoByMonth.get(month) ?? 0,
        expenses: expenseByMonth.get(month) ?? 0,
      }));

      const completedVal = Number(completedJobsAgg._sum.value ?? 0);
      const totalExp = Number(totalExpensesAgg._sum.amount ?? 0);
      const profitMetrics = {
        completedJobValue: completedVal,
        totalExpenses: totalExp,
        totalPaidInvoices: Number(totalPaidInvoicesAgg._sum.total ?? 0),
        netProfit: completedVal - totalExp,
        profitMargin:
          completedVal > 0
            ? ((completedVal - totalExp) / completedVal) * 100
            : 0,
      };

      // Build quote counts map
      const qcMap = Object.fromEntries(
        quotesByStatus.map((g) => [g.status, g._count])
      ) as Record<string, number>;
      const quoteTotal = quotesByStatus.reduce((s, g) => s + g._count, 0);

      // Build client counts
      const csMap = Object.fromEntries(
        clientsByStatus.map((g) => [g.status, g._count])
      ) as Record<string, number>;
      const ctMap = Object.fromEntries(
        clientsByType.map((g) => [g.type, g._count])
      ) as Record<string, number>;
      const clientTotal = clientsByStatus.reduce((s, g) => s + g._count, 0);

      // Conversion rate: accepted / (accepted + rejected) * 100
      const accepted = qcMap.ACCEPTED ?? 0;
      const rejected = qcMap.REJECTED ?? 0;
      const conversionDenom = accepted + rejected;
      const conversionRate =
        conversionDenom > 0
          ? Math.round((accepted / conversionDenom) * 100)
          : 0;

      // Build job counts
      const jcMap = Object.fromEntries(
        jobsByStatus.map((g) => [g.status, g._count])
      ) as Record<string, number>;

      // Build invoice counts
      const icMap = Object.fromEntries(
        invoicesByStatus.map((g) => [g.status, g._count])
      ) as Record<string, number>;

      return {
        quoteCounts: {
          DRAFT: qcMap.DRAFT ?? 0,
          SENT: qcMap.SENT ?? 0,
          VIEWED: qcMap.VIEWED ?? 0,
          ACCEPTED: qcMap.ACCEPTED ?? 0,
          REJECTED: qcMap.REJECTED ?? 0,
          EXPIRED: qcMap.EXPIRED ?? 0,
          total: quoteTotal,
        },
        revenue: {
          accepted: Number(revenueAccepted._sum.total ?? 0),
          pending: Number(revenuePending._sum.total ?? 0),
          draft: Number(revenueDraft._sum.total ?? 0),
        },
        clientCounts: {
          total: clientTotal,
          active: csMap.ACTIVE ?? 0,
          residential: ctMap.RESIDENTIAL ?? 0,
          commercial: ctMap.COMMERCIAL ?? 0,
        },
        recentQuotes: recentQuotes.map((q) => ({
          id: q.id,
          quoteNumber: q.quoteNumber,
          status: q.status,
          total: Number(q.total),
          createdAt: q.createdAt,
          clientName: q.client.name,
        })),
        recentClients: recentClients.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          createdAt: c.createdAt,
          quoteCount: c._count.quotes,
        })),
        monthlyRevenue,
        conversionRate,
        jobCounts: {
          SCHEDULED: jcMap.SCHEDULED ?? 0,
          IN_PROGRESS: jcMap.IN_PROGRESS ?? 0,
          ON_HOLD: jcMap.ON_HOLD ?? 0,
          COMPLETED: jcMap.COMPLETED ?? 0,
          CANCELLED: jcMap.CANCELLED ?? 0,
          active: (jcMap.SCHEDULED ?? 0) + (jcMap.IN_PROGRESS ?? 0),
        },
        invoiceCounts: {
          DRAFT: icMap.DRAFT ?? 0,
          SENT: icMap.SENT ?? 0,
          VIEWED: icMap.VIEWED ?? 0,
          PAID: icMap.PAID ?? 0,
          OVERDUE: icMap.OVERDUE ?? 0,
          CANCELLED: icMap.CANCELLED ?? 0,
          outstanding:
            (icMap.SENT ?? 0) + (icMap.VIEWED ?? 0) + (icMap.OVERDUE ?? 0),
        },
        invoiceRevenue: {
          paid: Number(invoicePaidTotal._sum.total ?? 0),
          outstanding: Number(invoiceOutstandingTotal._sum.total ?? 0),
        },
        monthlyFinancials,
        profitMetrics,
        needsAttention: attentionQuotes
          .map((q) => {
            const now = new Date();
            const daysSinceSent = q.sentAt
              ? Math.floor(
                  (now.getTime() - new Date(q.sentAt).getTime()) /
                    (24 * 60 * 60 * 1000)
                )
              : 0;
            const daysSinceViewed = q.viewedAt
              ? Math.floor(
                  (now.getTime() - new Date(q.viewedAt).getTime()) /
                    (24 * 60 * 60 * 1000)
                )
              : 0;
            const daysUntilExpiry = q.validUntil
              ? Math.ceil(
                  (new Date(q.validUntil).getTime() - now.getTime()) /
                    (24 * 60 * 60 * 1000)
                )
              : null;

            let reason = "";
            let priority = 0;

            if (
              daysUntilExpiry !== null &&
              daysUntilExpiry <= 3 &&
              daysUntilExpiry > 0
            ) {
              reason = `Expira en ${daysUntilExpiry} día${daysUntilExpiry !== 1 ? "s" : ""}`;
              priority = 3;
            } else if (q.status === "VIEWED" && daysSinceViewed >= 3) {
              reason = `Vista hace ${daysSinceViewed} días, sin respuesta`;
              priority = 2;
            } else if (q.status === "SENT" && daysSinceSent >= 2) {
              reason = `Enviada hace ${daysSinceSent} días, no vista`;
              priority = 1;
            }

            if (!reason) return null;

            return {
              id: q.id,
              quoteNumber: q.quoteNumber,
              status: q.status,
              reason,
              priority,
              shareToken: q.shareToken,
              clientName: q.client.name,
              clientPhone: q.client.phone,
              clientEmail: q.client.email,
            };
          })
          .filter((q): q is NonNullable<typeof q> => q !== null)
          .sort((a, b) => b.priority - a.priority),
      };
    } catch (error) {
      console.error("[dashboardStats] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to load dashboard",
      });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        logoUrl: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        license: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.organization.update({
        where: { id: ctx.auth.organizationId },
        data: input,
      });
    }),

  followUpSettings: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.auth.organizationId },
      select: {
        followUpDays: true,
        expiryReminderDays: true,
        autoFollowUp: true,
      },
    });
    return org;
  }),

  updateFollowUpSettings: protectedProcedure
    .input(
      z.object({
        followUpDays: z.number().min(1).max(14),
        expiryReminderDays: z.number().min(1).max(14),
        autoFollowUp: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.organization.update({
        where: { id: ctx.auth.organizationId },
        data: input,
      });
    }),
});
