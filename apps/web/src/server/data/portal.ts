import "server-only";
import { prisma } from "@fieldpro/db";

export interface PortalQuote {
  id: string;
  quoteNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  shareToken: string;
  title: string | null;
}

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  dueDate: Date | null;
  paidAt: Date | null;
  shareToken: string;
}

export interface PortalStats {
  totalQuotes: number;
  acceptedQuotes: number;
  outstandingAmount: number;
  paidAmount: number;
}

export interface PortalData {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  organization: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    license: string | null;
  };
  quotes: PortalQuote[];
  invoices: PortalInvoice[];
  stats: PortalStats;
}

export async function getPortalDataByToken(
  portalToken: string
): Promise<PortalData | null> {
  const client = await prisma.client.findUnique({
    where: { portalToken },
    include: {
      organization: {
        select: { name: true, logoUrl: true, phone: true, license: true },
      },
      quotes: {
        where: { status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          total: true,
          createdAt: true,
          shareToken: true,
          title: true,
        },
      },
      invoices: {
        where: { status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          dueDate: true,
          paidAt: true,
          shareToken: true,
        },
      },
    },
  });

  if (!client) return null;

  const stats: PortalStats = {
    totalQuotes: client.quotes.length,
    acceptedQuotes: client.quotes.filter((q) => q.status === "ACCEPTED").length,
    outstandingAmount: client.invoices
      .filter((i) => ["SENT", "VIEWED", "OVERDUE"].includes(i.status))
      .reduce((s, i) => s + Number(i.total), 0),
    paidAmount: client.invoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + Number(i.total), 0),
  };

  return {
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
    },
    organization: client.organization,
    quotes: client.quotes.map((q) => ({
      ...q,
      total: Number(q.total),
    })),
    invoices: client.invoices.map((i) => ({
      ...i,
      total: Number(i.total),
    })),
    stats,
  };
}
