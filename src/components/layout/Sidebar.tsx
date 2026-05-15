"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardLoading } from "@/contexts/LoadingContext";
import { cn } from "@/lib/utils";
import AntIcon from "@/components/AntIcon";
import { Badge } from "../ui/badge";

const navigation = [
  { name: "Dashboard", href: "/dashboard", roles: ["Admin", "Team Lead", "Member"], icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Projects", href: "/projects", roles: ["Admin", "Team Lead", "Member"], icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { name: "My Tasks", href: "/my-tasks", roles: ["Admin", "Team Lead", "Member"], icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { name: "Daily Report", href: "/daily-report", roles: ["Admin", "Team Lead", "Member"], icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { name: "Performance", href: "/performance", roles: ["Admin", "Team Lead"], icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { name: "Manage Teams", href: "/admin/teams", roles: ["Admin"], icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { name: "Manage Users", href: "/admin/users", roles: ["Admin"], icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { name: "Workload Network", href: "/admin/network", roles: ["Admin"], icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.503" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { isDashboardLoading } = useDashboardLoading();

  const visibleNav = navigation.filter((item) => user && item.roles.includes(user.role));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const roleColors: Record<string, string> = {
    Admin: "bg-amber-500",
    "Team Lead": "bg-indigo-500",
    Member: "bg-emerald-500",
  };

  return (
    <aside className="w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col h-screen fixed left-0 top-0 border-r border-[var(--sidebar-border)]">
      {/* Logo / Brand */}
      <div className="p-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
              <AntIcon size={22} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">DYM AntWork</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-500 tracking-wide uppercase">Task System</p>
              <Badge variant="secondary" className="text-[8px] px-1 py-0 h-5 bg-slate-600 text-slate-200 rounded">v1.0.1</Badge>
            </div>
          </div>
        </Link>
      </div>

      {/* Separator */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : !user ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-slate-500">Loading...</p>
          </div>
        ) : (
          visibleNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const disabled = isDashboardLoading && pathname === "/dashboard" && item.href !== "/dashboard";
            return (
              <Link
                key={item.href}
                href={disabled ? "" : item.href}
                onClick={disabled ? (e) => e.preventDefault() : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                  disabled && "opacity-40 pointer-events-none cursor-not-allowed",
                  !disabled && isActive
                    ? "bg-indigo-600/20 text-indigo-400 shadow-sm shadow-indigo-500/10"
                    : !disabled && "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <svg
                  className={cn("w-[18px] h-[18px] flex-shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-slate-500")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })
        )}
      </nav>

      {/* Separator */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Ambient Video */}
      <div className="mx-3 mb-3 rounded-xl overflow-hidden h-32 relative bg-slate-800">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-100"
          src="/media/peace_bg_1.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      {/* User Profile */}
      <div className="p-4">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shadow-lg shadow-indigo-500/20">
                {getInitials(user.name)}
              </div>
              <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900", roleColors[user.role] || "bg-slate-500")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200 text-left"
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
