import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";
import { JobDetail } from "@/components/jobs/job-detail";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const caller = await api();
    const job = await caller.job.byId({ id });
    return <JobDetail initialJob={{ id: job.id }} />;
  } catch {
    notFound();
  }
}
