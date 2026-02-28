"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@fieldpro/ui/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Receipt,
} from "lucide-react";

const navigation = [
  { name: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Cotizaciones", href: "/quotes", icon: FileText },
  { name: "Trabajos", href: "/jobs", icon: Briefcase },
  { name: "Facturas", href: "/invoices", icon: Receipt },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-200 bg-white/95 backdrop-blur-sm"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        minHeight: "64px",
      }}
    >
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[52px]",
              isActive ? "text-teal-600" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )}
            />
            <span className="text-[10px] font-medium leading-none">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
