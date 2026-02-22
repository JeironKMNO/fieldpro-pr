"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@fieldpro/ui/lib/utils";
import { useUIStore } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Cotizaciones", href: "/quotes", icon: FileText },
  { name: "Trabajos", href: "/jobs", icon: Briefcase },
  { name: "Facturas", href: "/invoices", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0",
        "transition-all duration-300 ease-out",
        "border-r border-stone-200 bg-white",
        sidebarCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div
        className={cn(
          "flex h-18 shrink-0 items-center border-b border-stone-200",
          "bg-gradient-to-br from-teal-600 to-teal-700",
          sidebarCollapsed ? "justify-center px-2" : "px-5 gap-3"
        )}
      >
        <div className={cn(
          "flex items-center justify-center shrink-0 rounded-xl bg-white/10 backdrop-blur",
          "shadow-lg shadow-teal-900/20",
          sidebarCollapsed ? "w-10 h-10" : "w-11 h-11"
        )}>
          <svg 
            viewBox="0 0 24 24" 
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 20h20M4 20V10l8-6 8 6v10" />
            <path d="M9 20v-6h6v6" />
          </svg>
        </div>

        {!sidebarCollapsed && (
          <div className="flex flex-col leading-tight select-none">
            <span className="font-display font-bold text-white text-xl tracking-tight">
              FieldPro
            </span>
            <span className="text-[10px] font-medium text-teal-100 tracking-widest uppercase">
              Puerto Rico
            </span>
          </div>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-6 pb-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={isActive}
              collapsed={sidebarCollapsed}
            />
          );
        })}
      </nav>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="shrink-0 border-t border-stone-200 px-3 py-4 space-y-2 bg-stone-50/50">
        <NavItem
          href="/settings"
          icon={Settings}
          label="Configuración"
          isActive={pathname.startsWith("/settings")}
          collapsed={sidebarCollapsed}
        />

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center w-full rounded-xl px-3 py-2.5 transition-all duration-200",
            "text-stone-500 hover:text-stone-800 hover:bg-stone-200/50",
            sidebarCollapsed && "justify-center px-0"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* ── NavItem ────────────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ href, icon: Icon, label, isActive, collapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      prefetch={true}
      className={cn(
        "relative flex items-center rounded-xl transition-all duration-200 group",
        collapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5",
        isActive
          ? "bg-teal-50 text-teal-700 shadow-sm"
          : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
      )}
    >
      {/* Active indicator */}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-teal-500" />
      )}

      <Icon
        className={cn(
          "shrink-0 w-5 h-5 transition-transform duration-200",
          isActive ? "text-teal-600 scale-110" : "group-hover:scale-105",
          collapsed && "w-[22px] h-[22px]"
        )}
      />

      {!collapsed && (
        <span
          className={cn(
            "text-sm leading-none",
            isActive ? "font-semibold" : "font-medium"
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );
}
