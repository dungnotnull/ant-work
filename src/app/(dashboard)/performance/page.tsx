"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import VelocityChart from "@/components/performance/VelocityChart";
import CompletionRateCard from "@/components/performance/CompletionRateCard";
import OnTimeRateCard from "@/components/performance/OnTimeRateCard";
import IndividualScoreCard from "@/components/performance/IndividualScoreCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface TeamMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  onTimeRate: number;
  totalStoryPoints: number;
  spAccuracy: number;
  velocity: { month: string; storyPoints: number; tasks: number }[];
}

interface MemberMetrics {
  totalAssigned: number;
  completed: number;
  completionRate: number;
  onTimeRate: number;
  storyPoints: number;
  individualScore: number;
}

interface Project {
  _id: string;
  name: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data as T;
}

export default function PerformancePage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");
  const [projectId, setProjectId] = useState<string>("all");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/projects"),
  });

  const { data: teamMetrics, isLoading: teamLoading } = useQuery<TeamMetrics>({
    queryKey: ["teamPerformance", period, projectId],
    queryFn: () => {
      const params = new URLSearchParams({ period });
      if (projectId && projectId !== "all") params.set("projectId", projectId);
      return fetchJson(`/api/performance/team?${params}`);
    },
  });

  const { data: memberMetrics, isLoading: memberLoading } = useQuery<MemberMetrics>({
    queryKey: ["memberPerformance", period],
    queryFn: () => {
      const params = new URLSearchParams({ period });
      return fetchJson(`/api/performance/member?${params}`);
    },
  });

  if (teamLoading || memberLoading) {
    return (
      <div className="page-enter">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Performance</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (!teamMetrics || !memberMetrics) {
    return (
      <div className="page-enter">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Performance</h1>
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-xl">
          <p className="text-slate-500">No data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance</h1>
          <p className="text-sm text-slate-500 mt-1">Track team and individual metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={(val) => val && setPeriod(val)}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectId} onValueChange={(val) => val && setProjectId(val)}>
            <SelectTrigger className="w-48 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 stagger-animate">
        <CompletionRateCard rate={teamMetrics.completionRate} completed={teamMetrics.completedTasks} total={teamMetrics.totalTasks} />
        <OnTimeRateCard rate={teamMetrics.onTimeRate} />
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">SP Accuracy</p>
          <p className="text-3xl font-bold text-slate-900">{teamMetrics.spAccuracy}%</p>
          <p className="text-sm text-slate-400 mt-1">{teamMetrics.totalStoryPoints} SP completed</p>
        </div>
      </div>

      {/* Velocity chart */}
      <div className="mb-6">
        <VelocityChart data={teamMetrics.velocity} />
      </div>

      {/* Individual metrics */}
      {user && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-animate">
            <CompletionRateCard rate={memberMetrics.completionRate} completed={memberMetrics.completed} total={memberMetrics.totalAssigned} />
            <OnTimeRateCard rate={memberMetrics.onTimeRate} />
            <IndividualScoreCard score={memberMetrics.individualScore} />
          </div>
        </div>
      )}
    </div>
  );
}
