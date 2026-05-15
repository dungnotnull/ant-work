"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import TeamFormDialog from "@/components/admin/TeamFormDialog";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Team {
  _id: string;
  name: string;
  description: string;
  lead: User;
  members: User[];
}

export default function AdminTeamsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      const data = await res.json();
      return data.success ? (data.data as Team[]) : [];
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      return data.success ? (data.data as User[]) : [];
    },
  });

  const handleTeamSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["teams"] });
  };

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Teams</h1>
          <p className="text-sm text-slate-500 mt-1">{teams.length} team{teams.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Team
          </span>
        </Button>
      </div>

      <div className="space-y-4 stagger-animate">
        {teams.map((team) => (
          <div key={team._id} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{team.name}</h3>
              <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</span>
            </div>
            {team.description && <p className="text-sm text-slate-500 mb-3">{team.description}</p>}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Lead:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                  {team.lead?.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
                <span className="font-medium text-slate-700">{team.lead?.name || "Unassigned"}</span>
              </div>
            </div>
            {team.members.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {team.members.map((m) => (
                  <span key={m._id} className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100">
                    {m.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {teams.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200/80 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No teams yet</p>
          </div>
        )}
      </div>

      <TeamFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={handleTeamSaved} users={users} />
    </div>
  );
}
