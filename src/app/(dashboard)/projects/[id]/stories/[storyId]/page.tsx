"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import AssigneeAvatars from "@/components/tasks/AssigneeAvatars";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLoader from "@/components/ui/PageLoader";
import toast from "react-hot-toast";
import { PRIORITIES } from "@/lib/constants";

interface Story { _id: string; title: string; description: string; status: string; storyPoints: number; epic: string; }
interface Task { _id: string; title: string; status: string; priority: string; storyPoints: number; assignees: { _id: string; name: string }[]; }
interface Project { _id: string; name: string; }
interface Epic { _id: string; title: string; }

export default function StoryDetailPage() {
  const { id, storyId } = useParams<{ id: string; storyId: string }>();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "Medium" });

  const { data: project, isError: projectError } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to load project");
      return d.data;
    },
  });

  const { data: story, isLoading: storyLoading, isError: storyError } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const res = await fetch(`/api/stories/${storyId}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to load story");
      return d.data;
    },
  });

  const { data: epic } = useQuery({
    queryKey: ["epic", story?.epic],
    enabled: !!story?.epic,
    queryFn: async () => {
      const res = await fetch(`/api/epics/${story!.epic}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to load epic");
      return d.data;
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", storyId],
    queryFn: async () => { const res = await fetch(`/api/stories/${storyId}/tasks`); const d = await res.json(); return d.success ? d.data : []; },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (input: typeof newTask) => {
      const res = await fetch(`/api/stories/${storyId}/tasks`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks", storyId] });
      setDialogOpen(false);
      setNewTask({ title: "", priority: "Medium" });
    },
    onError: () => toast.error("Failed to create task"),
  });

  if (storyLoading) {
    return <PageLoader />;
  }

  if (projectError || storyError || !project || !story) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500">Failed to load story</p>
        <button
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          onClick={() => { queryClient.invalidateQueries({ queryKey: ["project", id] }); queryClient.invalidateQueries({ queryKey: ["story", storyId] }); }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${id}` },
          ...(epic ? [{ label: epic.title, href: `/projects/${id}/epics/${story.epic}` }] : []),
          { label: story.title },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{story.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <TaskStatusBadge status={story.status as Parameters<typeof TaskStatusBadge>[0]["status"]} />
            <span className="text-sm text-slate-500">{story.storyPoints} SP</span>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            New Task
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(newTask); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input id="task-title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v || "Medium" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No tasks yet.</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Task</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Assignees</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">SP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task: Task) => (
                <tr key={task._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/tasks/${task._id}`} className="text-slate-900 hover:text-indigo-600">{task.title}</Link>
                  </td>
                  <td className="px-4 py-3"><TaskStatusBadge status={task.status as Parameters<typeof TaskStatusBadge>[0]["status"]} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={task.priority as Parameters<typeof PriorityBadge>[0]["priority"]} /></td>
                  <td className="px-4 py-3"><AssigneeAvatars assignees={task.assignees} /></td>
                  <td className="px-4 py-3 text-slate-500">{task.storyPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
