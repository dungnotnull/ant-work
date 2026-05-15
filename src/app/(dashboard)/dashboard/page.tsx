"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import AntMascot from "@/components/AntMascot";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import EfficiencyLeaderboard from "@/components/dashboard/EfficiencyLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardLoading } from "@/contexts/LoadingContext";
import { getGreeting } from "@/lib/utils/greeting";
import { Badge } from "@/components/ui/badge";

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  dueDate: string | null;
  project: string;
  assignees: { _id: string }[];
}

interface WorkLog {
  _id: string;
  task: { title: string; storyPoints: number };
  project: { name: string };
  hours: number;
  description: string;
  date: string;
}

interface ActivityData {
  date: string;
  count: number;
}

interface Project {
  _id: string;
  name: string;
}

interface Team {
  _id: string;
  name: string;
  members: { _id: string }[];
}

function StatCard({
  label,
  value,
  icon,
  color,
  subtext,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          {loading ? (
            <div className="skeleton h-9 w-16 mt-2 rounded-lg" />
          ) : (
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          )}
          {loading ? (
            <div className="skeleton h-3 w-24 mt-1.5 rounded" />
          ) : subtext ? (
            <p className="text-xs text-slate-400 mt-1">{subtext}</p>
          ) : null}
        </div>
        <div className={`w-10 h-10 rounded-xl ${loading ? "bg-slate-50 opacity-40" : color.includes("indigo") ? "bg-indigo-50" : color.includes("emerald") ? "bg-emerald-50" : color.includes("amber") ? "bg-amber-50" : color.includes("purple") ? "bg-purple-50" : "bg-slate-50"} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { setDashboardLoading } = useDashboardLoading();

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    enabled: !!user,
    queryFn: async () => {
      const projectsRes = await fetch("/api/projects");
      const projectsData = await projectsRes.json();
      if (!projectsData.success) throw new Error("Failed to load projects");

      const allTasks: (Task & { assignees: { _id: string }[] })[] = [];
      for (const project of projectsData.data) {
        const boardRes = await fetch(`/api/projects/${project._id}/board`);
        const boardData = await boardRes.json();
        if (boardData.success) {
          const flat = Object.values(boardData.data).flat() as (Task & { assignees: { _id: string }[] })[];
          const mine = user?.role === "Admin"
            ? flat
            : flat.filter((t) => t.assignees?.some((a) => a._id === user!.id));
          allTasks.push(...mine.map((t) => ({ ...t, project: project.name })));
        }
      }

      const today = format(new Date(), "yyyy-MM-dd");
      const tasksDueToday = allTasks.filter(
        (t) => t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === today && t.status !== "Done"
      );

      const completed = allTasks.filter((t) => t.status === "Done").length;
      const pendingSP = allTasks.filter((t) => t.status !== "Done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      const recentTasks = [...allTasks]
        .filter((t) => t.status === "In Progress" || t.status === "In Review")
        .slice(0, 5);

      return { tasksDueToday, stats: { totalTasks: allTasks.length, completed, pendingSP }, recentTasks };
    },
  });

  const { data: recentLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["recentWorkLogs"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/worklogs/me");
      const data = await res.json();
      if (!data.success) throw new Error("Failed to load work logs");
      return data.data.slice(0, 5) as WorkLog[];
    },
  });

  const { data: activityData = [], isLoading: activityLoading } = useQuery<ActivityData[]>({
    queryKey: ["activity"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/activity");
      const data = await res.json();
      if (!data.success) throw new Error("Failed to load activity");
      return data.data;
    },
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!data.success) throw new Error("Failed to load projects");
      return data.data;
    },
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (!data.success) throw new Error("Failed to load teams");
      return data.data;
    },
  });

  const isPageLoading = statsLoading || logsLoading || activityLoading || projectsLoading || teamsLoading;

  useEffect(() => {
    setDashboardLoading(isPageLoading);
    return () => setDashboardLoading(false);
  }, [isPageLoading, setDashboardLoading]);

  const stats = dashboardStats?.stats ?? { totalTasks: 0, completed: 0, pendingSP: 0 };
  const tasksDueToday = dashboardStats?.tasksDueToday ?? [];
  const recentTasks = dashboardStats?.recentTasks ?? [];
  const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

  return (
    <div className="page-enter">
      {/* Top loading bar */}
      {isPageLoading && (
        <div className="fixed top-0 left-64 right-0 z-40 h-0.5 bg-indigo-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[loading-bar_1.5s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Header with mascot */}
      <div className="flex items-start justify-between mb-8">
        <div>
          {(() => {
            const greeting = getGreeting();
            return (
              <>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {greeting.japanese}
                </h1>
                <p className="text-slate-400 text-sm font-medium">
                  {greeting.english}{user?.name ? `, ${user.name}` : ""}
                </p>
              </>
            );
          })()}
          <Badge variant="outline" className="text-slate-500 mt-1 text-xs bg-blue-50 border-blue-300">
            Today: {format(new Date(), "EEEE, MMMM d, yyyy")}
          </Badge>
          <p className="text-slate-500 mt-1 text-[12px] italic">
            _Developed by <span className="text-red-900 font-bold">Hoang Dung</span>
          </p>
        </div>
        <div className="hidden md:block">
          <AntMascot size={100} animated />
        </div>
      </div>

      {/* Stats Cards - top row: task metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 stagger-animate">
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          color="text-slate-900"
          loading={statsLoading}
          icon={<svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          color="text-emerald-600"
          subtext={stats.totalTasks > 0 ? `${Math.round((stats.completed / stats.totalTasks) * 100)}% done` : undefined}
          loading={statsLoading}
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Pending SP"
          value={stats.pendingSP}
          color="text-indigo-600"
          subtext="Story points remaining"
          loading={statsLoading}
          icon={<svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard
          label="Due Today"
          value={tasksDueToday.length}
          color="text-amber-600"
          subtext={tasksDueToday.length > 0 ? "Needs attention" : "All clear"}
          loading={statsLoading}
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Stats Cards - bottom row: organization metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6 stagger-animate">
        <StatCard
          label="Projects"
          value={projects.length}
          color="text-purple-600"
          subtext="Active projects"
          loading={projectsLoading}
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
        />
        <StatCard
          label="Teams"
          value={teams.length}
          color="text-blue-600"
          subtext={`${totalMembers} members total`}
          loading={teamsLoading}
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard
          label="Completion Rate"
          value={stats.totalTasks > 0 ? `${Math.round((stats.completed / stats.totalTasks) * 100)}%` : "0%"}
          color="text-emerald-600"
          subtext={`${stats.completed} of ${stats.totalTasks} tasks`}
          loading={statsLoading}
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
        />
      </div>

      {/* Activity Heatmap */}
      <div className="mb-6">
        {activityLoading ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
            <div className="skeleton h-4 w-32 mb-4 rounded" />
            <div className="skeleton h-24 w-full rounded-lg" />
          </div>
        ) : (
          <ActivityHeatmap data={activityData} />
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Active Tasks
          </h2>
          {statsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-5 w-16 rounded" />
                    <div className="skeleton h-4 w-40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No active tasks</p>
              <p className="text-xs text-slate-400 mt-1">Tasks assigned to you will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 stagger-animate">
              {recentTasks.map((task) => (
                <Link key={task._id} href={`/tasks/${task._id}`}>
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <TaskStatusBadge status={task.status as any} />
                      <div>
                        <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </span>
                        <p className="text-xs text-slate-400">{task.project}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{task.storyPoints} SP</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Work Logs */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Recent Work Logs
          </h2>
          {logsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-4 w-8 rounded" />
                  </div>
                  <div className="skeleton h-3 w-20 mt-2 rounded" />
                </div>
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No work logged yet</p>
              <p className="text-xs text-slate-400 mt-1">Start logging work from the Daily Report page</p>
            </div>
          ) : (
            <div className="space-y-2 stagger-animate">
              {recentLogs.map((log) => (
                <div key={log._id} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      {(log.task as any).title}
                    </span>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {log.hours}h
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {(log.project as any).name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Efficiency Leaderboard (Admin/Team Lead only) */}
      {user?.role === "Admin" || user?.role === "Team Lead" ? (
        <div className="mt-6">
          <EfficiencyLeaderboard />
        </div>
      ) : null}

      {/* Quick tip */}
      <div className="mt-8 flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Press <kbd className="px-1.5 py-0.5 bg-indigo-100 rounded text-xs font-mono font-bold">Ctrl+K</kbd> to quickly navigate anywhere
        </span>
      </div>
    </div>
  );
}
