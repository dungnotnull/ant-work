"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

interface Team {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  team: Team | null;
}

const ROLE_BADGE_COLORS: Record<string, string> = {
  Admin: "bg-amber-50 text-amber-700 border-amber-200",
  "Team Lead": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Member: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      return data.success ? (data.data as User[]) : [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      const data = await res.json();
      return data.success ? (data.data as Team[]) : [];
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, ...updates }: { userId: string; role?: string; team?: string | null }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Failed"),
  });

  return (
    <div className="page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Users</h1>
        <p className="text-sm text-slate-500 mt-1">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Team</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-md border ${ROLE_BADGE_COLORS[user.role] || "bg-slate-50 text-slate-600"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-slate-600">{user.team?.name || <span className="text-slate-300">No team</span>}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
