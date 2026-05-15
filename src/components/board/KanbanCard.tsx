"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import AssigneeAvatars from "@/components/tasks/AssigneeAvatars";
import { type Priority } from "@/lib/constants";

interface TaskData {
  _id: string;
  title: string;
  status: string;
  priority: Priority;
  storyPoints: number;
  assignees: { _id: string; name: string }[];
  dueDate: string | null;
}

export default function KanbanCard({ task }: { task: TaskData }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/tasks/${task._id}`}>
        <div className="bg-white border border-slate-200/80 rounded-lg p-3 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-grab active:cursor-grabbing group">
          <p className="text-sm font-medium text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{task.title}</p>
          <div className="flex items-center justify-between">
            <PriorityBadge priority={task.priority} />
            <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">{task.storyPoints} SP</span>
          </div>
          {task.assignees.length > 0 && (
            <div className="mt-2">
              <AssigneeAvatars assignees={task.assignees} />
            </div>
          )}
          {task.dueDate && (
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
