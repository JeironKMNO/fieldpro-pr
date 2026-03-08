"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@fieldpro/ui/components/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard] Runtime error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center px-4">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-xl font-semibold text-stone-800 mb-2">
        Algo salió mal
      </h2>
      <p className="text-stone-500 text-sm mb-1 max-w-sm">
        Ocurrió un error inesperado al cargar esta página.
      </p>
      {error.digest && (
        <p className="text-stone-400 text-xs mb-6 font-mono">
          Código: {error.digest}
        </p>
      )}
      <Button
        onClick={reset}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Intentar de nuevo
      </Button>
    </div>
  );
}
