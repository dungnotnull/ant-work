"use client";

import { useQuery } from "@tanstack/react-query";

interface UserEfficiency {
  userId: string;
  name: string;
  email: string;
  role: string;
  efficiency: number;
  completedTasks: number;
  completedSP: number;
  hoursLogged: number;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-blue-600 bg-blue-50";
  if (score >= 6) return "text-emerald-600 bg-emerald-50";
  if (score >= 4) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function getBarColor(score: number): string {
  if (score >= 8) return "bg-blue-500";
  if (score >= 6) return "bg-emerald-500";
  if (score >= 4) return "bg-amber-500";
  return "bg-red-500";
}

export default function EfficiencyLeaderboard() {
  const { data: efficiencyData = [], isLoading } = useQuery<UserEfficiency[]>({
    queryKey: ["efficiency"],
    queryFn: async () => {
      const res = await fetch("/api/efficiency");
      const data = await res.json();
      return data.success ? data.data : [];
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
        <div className="skeleton h-6 w-48 mb-4 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Team Efficiency</h3>
          <p className="text-xs text-slate-400 mt-0.5">Past 7 days performance (0-10 scale)</p>
        </div>
      </div>

      {efficiencyData.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-400">No efficiency data yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {efficiencyData.map((user, index) => (
            <div key={user.userId} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-300 w-4 text-right">{index + 1}</span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {user.completedTasks} tasks / {user.hoursLogged}h
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(user.efficiency)}`}>
                      {user.efficiency.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(user.efficiency)}`}
                    style={{ width: `${Math.max(2, user.efficiency * 10)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
