import Sidebar from "@/components/layout/Sidebar";
import AuthGuard from "@/components/layout/AuthGuard";
import CommandPalette from "@/components/layout/CommandPalette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 ml-64">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
        <CommandPalette />
      </div>
    </AuthGuard>
  );
}
