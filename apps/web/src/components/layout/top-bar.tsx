"use client";

import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
    title: "Panel de Control",
    subtitle: "Resumen de operaciones",
  },
  "/clients": {
    title: "Clientes",
    subtitle: "Gestión de relaciones comerciales",
  },
  "/quotes": { title: "Cotizaciones", subtitle: "Presupuestos y propuestas" },
  "/jobs": { title: "Trabajos", subtitle: "Proyectos activos en campo" },
  "/invoices": { title: "Facturas", subtitle: "Facturación y cobros" },
  "/settings": { title: "Configuración", subtitle: "Cuenta y organización" },
};

function getPageMeta(pathname: string) {
  for (const [path, meta] of Object.entries(PAGE_META)) {
    if (pathname.startsWith(path)) return meta;
  }
  return { title: "FieldPro PR" };
}

export function TopBar() {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <header className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white/80 backdrop-blur px-4 md:px-6 sticky top-0 z-30">
      {/* Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-lg md:text-2xl text-stone-900 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-stone-500 mt-0.5 leading-none font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <OrganizationSwitcher
          appearance={{
            elements: {
              rootBox: "flex items-center",
              organizationSwitcherTrigger:
                "text-xs md:text-sm font-medium text-stone-600 hover:text-teal-700 transition-colors max-w-[140px] md:max-w-none truncate",
            },
          }}
        />
        <div className="h-6 w-px bg-stone-200" />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox:
                "w-8 h-8 md:w-9 md:h-9 rounded-full ring-2 ring-stone-200",
            },
          }}
        />
      </div>
    </header>
  );
}
