"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  href: string;
  shortcut?: string;
  roles: string[];
}

const commands: CommandItem[] = [
  { id: "dashboard", label: "Go to Dashboard", description: "Overview and stats", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", href: "/dashboard", roles: ["Admin", "Team Lead", "Member"] },
  { id: "projects", label: "Go to Projects", description: "View all projects", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", href: "/projects", roles: ["Admin", "Team Lead", "Member"] },
  { id: "my-tasks", label: "Go to My Tasks", description: "View your assigned tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", href: "/my-tasks", shortcut: "T", roles: ["Admin", "Team Lead", "Member"] },
  { id: "daily-report", label: "Go to Daily Report", description: "Log work and view reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", href: "/daily-report", shortcut: "D", roles: ["Admin", "Team Lead", "Member"] },
  { id: "report-summary", label: "Team Summary", description: "View team report summary", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", href: "/daily-report/summary", roles: ["Admin", "Team Lead"] },
  { id: "performance", label: "Go to Performance", description: "View team and personal metrics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", href: "/performance", shortcut: "P", roles: ["Admin", "Team Lead"] },
  { id: "admin-teams", label: "Manage Teams", description: "Create and manage teams", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", href: "/admin/teams", roles: ["Admin"] },
  { id: "admin-users", label: "Manage Users", description: "Manage user roles and teams", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", href: "/admin/users", roles: ["Admin"] },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(
    (cmd) =>
      user &&
      cmd.roles.includes(user.role) &&
      (cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase()))
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const selectItem = (cmd: CommandItem) => {
    setOpen(false);
    router.push(cmd.href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        style={{ animation: "overlay-show 0.15s ease-out" }}
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        style={{ animation: "content-show 0.2s ease-out" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filtered.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
              } else if (e.key === "Enter" && filtered[selectedIndex]) {
                e.preventDefault();
                selectItem(filtered[selectedIndex]);
              }
            }}
            placeholder="Search commands..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
          <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No results found</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIndex ? "bg-indigo-50 text-indigo-900" : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => selectItem(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <svg className={`w-4 h-4 flex-shrink-0 ${i === selectedIndex ? "text-indigo-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={cmd.icon} />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cmd.label}</p>
                  {cmd.description && (
                    <p className="text-xs text-slate-400 truncate">{cmd.description}</p>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400">
          <span>Navigate with arrow keys</span>
          <span>Enter to select</span>
        </div>
      </div>
    </div>
  );
}
