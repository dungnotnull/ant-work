"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MemberSummary {
  userId: string;
  name: string;
  storyPoints: number;
  hoursLogged: number;
  tasksDone: number;
}

interface SummaryData {
  date: string;
  members: MemberSummary[];
  totals: { storyPoints: number; hoursLogged: number; tasksDone: number };
}

export default function TeamSummaryPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data, isLoading } = useQuery<SummaryData>({
    queryKey: ["teamSummary", date],
    queryFn: async () => {
      const res = await fetch(`/api/reports/team-summary?date=${date}`);
      const result = await res.json();
      if (!result.success) throw new Error("Failed to load summary");
      return result.data;
    },
  });

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Summary</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of team activity for the selected date</p>
      </div>

      <div className="mb-6">
        <Label htmlFor="summary-date" className="text-sm font-medium text-slate-700">Date</Label>
        <Input
          id="summary-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-48 mt-1.5 h-11"
        />
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
          <div className="skeleton h-64 rounded-xl" />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6 stagger-animate">
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Story Points</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{data.totals.storyPoints}</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Hours</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{data.totals.hoursLogged}</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tasks Done</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{data.totals.tasksDone}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Member</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Story Points</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Hours</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Tasks Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.members.map((member) => (
                  <tr key={member.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-indigo-600">{member.storyPoints}</td>
                    <td className="px-5 py-3.5">{member.hoursLogged}</td>
                    <td className="px-5 py-3.5">{member.tasksDone}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50/80 font-semibold">
                  <td className="px-5 py-3.5 text-slate-700">Team Total</td>
                  <td className="px-5 py-3.5 text-indigo-600">{data.totals.storyPoints}</td>
                  <td className="px-5 py-3.5 text-emerald-600">{data.totals.hoursLogged}</td>
                  <td className="px-5 py-3.5 text-slate-700">{data.totals.tasksDone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
