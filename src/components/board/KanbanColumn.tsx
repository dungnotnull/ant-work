"use client";

import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";
import { type TaskStatus, STATUS_COLORS } from "@/lib/constants";

interface TaskData {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  storyPoints: number;
  assignees: { _id: string; name: string }[];
  dueDate: string | null;
}

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  Backlog: "border-t-slate-300",
  "To Do": "border-t-blue-400",
  "In Progress": "border-t-amber-400",
  "In Review": "border-t-violet-400",
  Done: "border-t-emerald-400",
};

export default function KanbanColumn({
  status,
  tasks,
}: {
  status: TaskStatus;
  tasks: TaskData[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-slate-50/80 rounded-xl border-l-1 border-t-4 ${COLUMN_ACCENT[status]} p-3 transition-all duration-200 ${isOver ? "ring-2 ring-indigo-300/50 bg-indigo-50/30" : ""}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{status}</h3>
        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full font-medium shadow-sm">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {tasks.map((task) => (
          <KanbanCard key={task._id} task={task as any} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-300">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}
