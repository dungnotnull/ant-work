"use client";

import WorkloadNetwork from "@/components/admin/WorkloadNetwork";

export default function WorkloadNetworkPage() {
  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workload Network</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visualize resource allocation across projects and team members. Scroll to zoom, drag to pan, click a node to highlight connections.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-slate-500">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-500">Team Lead</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-500" />
          <span className="text-xs text-slate-500">Member</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 rounded bg-indigo-500" />
          <span className="text-xs text-slate-500">Project</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 border-t-2 border-slate-300" />
          <span className="text-xs text-slate-500">Task assignment</span>
        </div>
      </div>

      <div className="h-[calc(100vh-280px)] min-h-[500px]">
        <WorkloadNetwork />
      </div>
    </div>
  );
}
