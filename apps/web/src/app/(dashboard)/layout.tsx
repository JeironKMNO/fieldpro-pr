import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden bg-stone-50/50 pattern-blueprint">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 mobile-nav-clearance">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
