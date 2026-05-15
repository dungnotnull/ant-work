"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
  differenceInCalendarDays,
} from "date-fns";

interface TaskData {
  _id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  assignees: { _id: string; name: string }[];
  createdAt: string;
  startDate: string | null;
  dueDate: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  "Backlog": "bg-slate-300",
  "To Do": "bg-blue-400",
  "In Progress": "bg-amber-400",
  "In Review": "bg-purple-400",
  "Done": "bg-emerald-400",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  "Backlog": "text-slate-700",
  "To Do": "text-blue-700",
  "In Progress": "text-amber-700",
  "In Review": "text-purple-700",
  "Done": "text-emerald-700",
};

export default function ProjectTimeline({ projectId }: { projectId: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthKey = format(currentMonth, "yyyy-MM");

  const { data: tasks = [] } = useQuery<TaskData[]>({
    queryKey: ["timeline", projectId, monthKey],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/timeline?month=${monthKey}`);
      const data = await res.json();
      return data.success ? data.data : [];
    },
  });

  const grid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startOffset = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1;

    return { days, startOffset, monthStart, monthEnd };
  }, [currentMonth]);

  const taskBars = useMemo(() => {
    return tasks.map((task) => {
      const start = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
      const end = task.dueDate ? new Date(task.dueDate) : new Date();
      const barStart = start < grid.monthStart ? grid.monthStart : start;
      const barEnd = end > grid.monthEnd ? grid.monthEnd : end;

      const startOffset = differenceInCalendarDays(barStart, grid.monthStart) + grid.startOffset;
      const duration = differenceInCalendarDays(barEnd, barStart) + 1;

      return {
        ...task,
        barStartOffset: startOffset,
        barDuration: Math.max(1, duration),
      };
    });
  }, [tasks, grid]);

  const totalGridCols = grid.days.length + grid.startOffset;
  const dayHeaders = Array.from({ length: totalGridCols }, (_, i) => {
    const dayIndex = i - grid.startOffset;
    if (dayIndex < 0) return null;
    return grid.days[dayIndex];
  });

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 h-8 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {taskBars.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200/80 rounded-xl">
          <p className="text-sm text-slate-400">No tasks for this month</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
          {/* Day headers */}
          <div
            className="grid border-b border-slate-200/80 bg-slate-50/50"
            style={{ gridTemplateColumns: `180px repeat(${totalGridCols}, minmax(28px, 1fr))` }}
          >
            <div className="px-3 py-2 text-[10px] font-medium text-slate-400 uppercase border-r border-slate-100/80">Task</div>
            {dayHeaders.map((day, i) => (
              <div
                key={i}
                className={`py-2 text-center text-[10px] border-l border-slate-50/80 ${day && isToday(day) ? "font-bold text-indigo-600" : "text-slate-400"}`}
              >
                {day ? format(day, "d") : ""}
              </div>
            ))}
          </div>

          {/* Task rows */}
          <div className="divide-y divide-slate-100/80">
            {taskBars.map((task) => (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                className="grid items-center hover:bg-slate-50/50 transition-colors cursor-pointer"
                style={{ gridTemplateColumns: `180px repeat(${totalGridCols}, minmax(28px, 1fr))` }}
              >
                <div className="px-3 py-2.5 truncate border-r border-slate-100/80">
                  <p className="text-xs font-medium text-slate-900 truncate">{task.title}</p>
                  <p className={`text-[10px] ${STATUS_TEXT_COLORS[task.status] || "text-slate-400"}`}>{task.status}</p>
                </div>
                {/* Empty cells before bar */}
                {Array.from({ length: task.barStartOffset }, (_, i) => (
                  <div key={`e-${i}`} className="py-2.5 border-l border-slate-50/80" />
                ))}
                {/* Bar */}
                <div
                  className={`mx-0.5 py-2.5 col-span-${task.barDuration}`}
                  style={{ gridColumn: `${task.barStartOffset + 2} / span ${task.barDuration}` }}
                >
                  <div className={`${STATUS_COLORS[task.status] || "bg-slate-300"} rounded-md h-5 flex items-center px-1.5`}>
                    <span className="text-[9px] font-medium text-white truncate">
                      {task.assignees.map((a) => a.name.split(" ")[0]).join(", ")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Week day labels at bottom */}
          <div
            className="grid border-t border-slate-200/80 bg-slate-50/50"
            style={{ gridTemplateColumns: `180px repeat(${totalGridCols}, minmax(28px, 1fr))` }}
          >
            <div className="border-r border-slate-100/80" />
            {dayHeaders.map((day, i) => (
              <div key={i} className="py-1.5 text-center text-[9px] text-slate-300 border-l border-slate-50/80">
                {day ? format(day, "EEE").charAt(0) : ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
