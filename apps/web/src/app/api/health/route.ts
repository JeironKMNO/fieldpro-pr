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

  // 4. Environment variables check — use bracket notation to avoid Next.js
  // build-time inlining, which would show stale values from the build env.
  const env = process.env as Record<string, string | undefined>;
  const dbUrl = env["DATABASE_URL"] ?? "";
  const directUrl = env["DIRECT_URL"] ?? "";
  checks.env = {
    DATABASE_URL: !!dbUrl,
    DATABASE_URL_length: dbUrl.length,
    DATABASE_URL_prefix: dbUrl.substring(0, 15) || "(empty)",
    DIRECT_URL: !!directUrl,
    DIRECT_URL_length: directUrl.length,
    CLERK_SECRET_KEY: !!(env["CLERK_SECRET_KEY"] ?? ""),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!(
      env["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] ?? ""
    ),
    NODE_ENV: env["NODE_ENV"],
  };

  const hasError = Object.values(checks).some(
    (v) => typeof v === "string" && v.startsWith("error:")
  );

  return NextResponse.json(checks, { status: hasError ? 500 : 200 });
}
