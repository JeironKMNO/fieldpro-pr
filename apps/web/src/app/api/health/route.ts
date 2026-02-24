import { NextResponse } from "next/server";
import { prisma } from "@fieldpro/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Check DB connectivity
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    checks.database = "ok";
  } catch (err) {
    checks.database = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 2. Check Prisma models exist (basic table check)
  try {
    const counts = await Promise.all([
      prisma.organization.count(),
      prisma.job.count(),
      prisma.invoice.count(),
      prisma.expense.count(),
    ]);
    checks.tables = {
      organizations: counts[0],
      jobs: counts[1],
      invoices: counts[2],
      expenses: counts[3],
    };
  } catch (err) {
    checks.tables = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 3. Check Clerk auth
  try {
    const authData = await auth();
    checks.clerk = {
      hasUserId: !!authData.userId,
      hasOrgId: !!authData.orgId,
    };
  } catch (err) {
    checks.clerk = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 4. Environment variables check (names only, not values)
  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  const hasError = Object.values(checks).some(
    (v) => typeof v === "string" && v.startsWith("error:")
  );

  return NextResponse.json(checks, { status: hasError ? 500 : 200 });
}
