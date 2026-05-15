"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { filter } from "lodash";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import SearchInput from "@/components/ui/SearchInput";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";

interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  storyPoints: number;
  assignees: { _id: string; name: string }[];
  dueDate: string | null;
  project: string;
}

export default function MyTasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["myTasks"],
    queryFn: async () => {
      const meRes = await fetch("/api/users/me");
      const meData = await meRes.json();
      if (!meData.success) return [];

      const projectsRes = await fetch("/api/projects");
      const projectsData = await projectsRes.json();
      if (!projectsData.success) return [];

      const allTasks: Task[] = [];
      for (const project of projectsData.data) {
        const boardRes = await fetch(`/api/projects/${project._id}/board`);
        const boardData = await boardRes.json();
        if (boardData.success) {
          const flatTasks = Object.values(boardData.data).flat() as Task[];
          const mine = flatTasks.filter((t) =>
            t.assignees.some((a) => a._id === meData.data._id)
          );
          allTasks.push(...mine.map((t) => ({ ...t, project: project.name })));
        }
      }
      return allTasks;
    },
  });

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const byStatus = statusFilter === "all" ? tasks : tasks.filter((t: Task) => t.status === statusFilter);
  const filtered = search
    ? filter(byStatus, (t: Task) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project.toLowerCase().includes(search.toLowerCase())
      )
    : byStatus;

  if (isLoading) {
    return (
      <div className="page-enter">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">My Tasks</h1>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
        <p className="text-sm text-slate-500 mt-1">
          {search || statusFilter !== "all"
            ? `${filtered.length} of ${tasks.length} tasks`
            : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} assigned to you`}
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search tasks by title or project..." className="max-w-sm" />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            statusFilter === "all"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
              : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-slate-700"
          }`}
          onClick={() => setStatusFilter("all")}
        >
          All ({tasks.length})
        </button>
        {TASK_STATUSES.map((status) => {
          const count = tasks.filter((t: Task) => t.status === status).length;
          return (
            <button
              key={status}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === status
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-slate-700"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No tasks found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term" : "Tasks matching your filter will appear here"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Task</th>
                <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">SP</th>
                <th className="text-left px-5 py-3 font-medium text-slate-400 text-xs uppercase tracking-wider">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((task: Task) => (
                <tr key={task._id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/tasks/${task._id}`} className="text-slate-900 hover:text-indigo-600 font-medium transition-colors">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{task.project}</td>
                  <td className="px-5 py-3.5">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={task.priority as Parameters<typeof PriorityBadge>[0]["priority"]} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{task.storyPoints}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
