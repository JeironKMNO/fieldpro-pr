import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Panel</h1>
        <p className="text-muted-foreground">
          Resumen de las operaciones de tu negocio
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
