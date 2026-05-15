"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";
import toast from "react-hot-toast";

interface TaskData {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  storyPoints: number;
  assignees: { _id: string; name: string }[];
  dueDate: string | null;
}

export default function KanbanBoard({
  projectId,
  initialBoard,
}: {
  projectId: string;
  initialBoard: Record<string, TaskData[]>;
}) {
  const [board, setBoard] = useState(initialBoard);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);

  // Sync with parent query data when it changes (e.g. after AntAgent status change)
  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = event.active.id as string;
    for (const tasks of Object.values(board)) {
      const found = tasks.find((t) => t._id === taskId);
      if (found) {
        setActiveTask(found);
        break;
      }
    }
  }, [board]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const taskId = event.active.id as string;
    const newStatus = event.over?.id as TaskStatus | undefined;

    setActiveTask(null);

    if (!newStatus || !TASK_STATUSES.includes(newStatus)) return;

    let currentTask: TaskData | null = null;
    let oldStatus: TaskStatus | null = null;

    for (const [status, tasks] of Object.entries(board)) {
      const found = tasks.find((t) => t._id === taskId);
      if (found) {
        currentTask = found;
        oldStatus = status as TaskStatus;
        break;
      }
    }

    if (!currentTask || !oldStatus || oldStatus === newStatus) return;

    const newBoard = { ...board };
    newBoard[oldStatus] = newBoard[oldStatus].filter((t) => t._id !== taskId);
    newBoard[newStatus] = [...newBoard[newStatus], { ...currentTask, status: newStatus }];
    setBoard(newBoard);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        setBoard(board);
        toast.error("Failed to update task status");
      }
    } catch {
      setBoard(board);
      toast.error("Network error");
    }
  }, [board]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden p-4 max-h-[calc(100vh-220px)] scrollbar-thin flex-shrink-0 max-w-[65vw] bg-gradient-to-b from-blue-50 to-red-50">
        {TASK_STATUSES.map((status) => (
          <SortableContext
            key={status}
            items={board[status]?.map((t) => t._id) || []}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn status={status} tasks={board[status] || []} />
          </SortableContext>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask as any} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
