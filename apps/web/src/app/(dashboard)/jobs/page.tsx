"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@fieldpro/ui/components/button";
import { JobList } from "@/components/jobs/job-list";
import { CreateJobDialog } from "@/components/jobs/create-job-dialog";

export default function JobsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Trabajos</h1>
          <p className="text-muted-foreground">
            Organiza y gestiona tus proyectos activos
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Trabajo
        </Button>
      </div>
      <JobList />

      {showCreateDialog && (
        <CreateJobDialog
          onClose={() => setShowCreateDialog(false)}
          onCreated={(jobId) => {
            setShowCreateDialog(false);
            router.push(`/jobs/${jobId}`);
          }}
        />
      )}
    </div>
  );
}
