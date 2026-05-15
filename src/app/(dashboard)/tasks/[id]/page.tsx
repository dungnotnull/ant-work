"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import AssigneeAvatars from "@/components/tasks/AssigneeAvatars";
import TaskTimer from "@/components/tasks/TaskTimer";
import CommentList from "@/components/tasks/CommentList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  storyPoints: number;
  assignees: { _id: string; name: string; email: string }[];
  dueDate: string | null;
  estimateHours: number;
  reviewer: { _id: string; name: string; email: string } | null;
  notes: string;
  story: string;
  project: string;
  createdBy: { _id: string; name: string; email: string };
}

interface SubTask {
  _id: string;
  title: string;
  status: TaskStatus;
  storyPoints: number;
  assignee: { _id: string; name: string } | null;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ title: "", storyPoints: 0 });
  const [showNotes, setShowNotes] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => { const res = await fetch(`/api/tasks/${id}`); const d = await res.json(); return d.success ? d.data : null; },
  });

  const { data: subtasks = [] } = useQuery({
    queryKey: ["subtasks", id],
    queryFn: async () => { const res = await fetch(`/api/tasks/${id}/subtasks`); const d = await res.json(); return d.success ? d.data : []; },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: TaskStatus) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(`Status updated`);
      queryClient.setQueryData(["task", id], data);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const saveNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: (data) => {
      toast.success("Notes saved");
      queryClient.setQueryData(["task", id], data);
      setIsEditingNotes(false);
    },
    onError: () => toast.error("Failed to save notes"),
  });

  const createSubtaskMutation = useMutation({
    mutationFn: async (input: { title: string; storyPoints: number }) => {
      const res = await fetch(`/api/tasks/${id}/subtasks`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      toast.success("Subtask created");
      queryClient.invalidateQueries({ queryKey: ["subtasks", id] });
      setDialogOpen(false);
      setNewSubtask({ title: "", storyPoints: 0 });
    },
    onError: () => toast.error("Failed to create subtask"),
  });

  if (taskLoading || !task) {
    return (
      <div className="page-enter">
        <div className="skeleton h-8 w-48 mb-6 rounded-lg" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const doneSubtasks = subtasks.filter((s: SubTask) => s.status === "Done").length;
  const taskData = task as Task;

  return (
    <div className="page-enter">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: "Task Detail" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Task header */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{taskData.title}</h1>
              <Select value={taskData.status} onValueChange={(v) => updateStatusMutation.mutate(v as TaskStatus)}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {taskData.description && <p className="text-sm text-slate-600 mb-4 leading-relaxed">{taskData.description}</p>}

            <div className="flex items-center gap-4 text-sm flex-wrap">
              <PriorityBadge priority={taskData.priority as Parameters<typeof PriorityBadge>[0]["priority"]} />
              <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{taskData.storyPoints} SP</span>
              {taskData.estimateHours > 0 && (
                <span className="text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {taskData.estimateHours}h estimated
                </span>
              )}
              {taskData.dueDate && (
                <span className="text-slate-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(taskData.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Notes section */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <button
              onClick={() => {
                setShowNotes(!showNotes);
                if (!showNotes) {
                  setEditNotes(taskData.notes || "");
                }
              }}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Notes
                {taskData.notes && <span className="text-xs text-slate-400 font-normal">({taskData.notes.length} chars)</span>}
              </h3>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showNotes ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showNotes && (
              <div className="px-5 pb-5 pt-0">
                {isEditingNotes ? (
                  <div>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full text-sm text-slate-900 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none outline-none"
                      rows={5}
                      placeholder="Add internal notes..."
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => saveNotesMutation.mutate(editNotes)} disabled={saveNotesMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(false)} className="h-8 text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => { setIsEditingNotes(true); setEditNotes(taskData.notes || ""); }} className="cursor-text min-h-[60px]">
                    {taskData.notes ? (
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{taskData.notes}</p>
                    ) : (
                      <p className="text-sm text-slate-300 italic">Click to add notes...</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sub-tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Sub-tasks ({doneSubtasks}/{subtasks.length})
              </h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button size="sm" variant="outline" />}>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Sub-task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); createSubtaskMutation.mutate(newSubtask); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subtask-title">Title</Label>
                      <Input id="subtask-title" value={newSubtask.title} onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtask-sp">Story Points</Label>
                      <Input id="subtask-sp" type="number" min={0} value={newSubtask.storyPoints} onChange={(e) => setNewSubtask({ ...newSubtask, storyPoints: parseInt(e.target.value) || 0 })} className="h-11" />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25" disabled={createSubtaskMutation.isPending}>
                      {createSubtaskMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {subtasks.length === 0 ? (
              <div className="text-center py-8 bg-white border border-slate-200/80 rounded-xl text-slate-400 text-sm">
                No sub-tasks yet
              </div>
            ) : (
              <div className="space-y-2 stagger-animate">
                {subtasks.map((st: SubTask) => (
                  <div key={st._id} className="bg-white border border-slate-200/80 rounded-lg p-3.5 flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <TaskStatusBadge status={st.status} />
                      <span className="text-sm text-slate-900 font-medium">{st.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">{st.storyPoints} SP</span>
                      {st.assignee && (
                        <span className="text-xs text-slate-400">{st.assignee.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <CommentList taskId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timer */}
          <TaskTimer taskId={id} />

          {/* Assignees */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Assignees</h3>
            <AssigneeAvatars assignees={taskData.assignees} />
            <div className="mt-3 space-y-2">
              {taskData.assignees.map((a: { _id: string; name: string }) => (
                <div key={a._id} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                    {a.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700">{a.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Reviewer</h3>
            {taskData.reviewer ? (
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[8px] font-bold text-white">
                  {taskData.reviewer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-slate-700">{taskData.reviewer.name}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-300">No reviewer assigned</p>
            )}
          </div>

          {/* Task metadata */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Created by</span>
                <span className="text-slate-700">{taskData.createdBy?.name || "Unknown"}</span>
              </div>
              {taskData.estimateHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated</span>
                  <span className="text-slate-700">{taskData.estimateHours}h</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Story Points</span>
                <span className="text-slate-700">{taskData.storyPoints} SP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Priority</span>
                <PriorityBadge priority={taskData.priority as Parameters<typeof PriorityBadge>[0]["priority"]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
