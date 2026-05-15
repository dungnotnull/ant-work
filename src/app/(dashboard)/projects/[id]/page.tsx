"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filter } from "lodash";
import { useAuth } from "@/hooks/useAuth";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import AssigneeAvatars from "@/components/tasks/AssigneeAvatars";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProjectTimeline from "@/components/project/ProjectTimeline";
import PageLoader from "@/components/ui/PageLoader";
import SearchInput from "@/components/ui/SearchInput";
import toast from "react-hot-toast";

interface Project {
  _id: string;
  name: string;
  description: string;
  notes?: string;
  team: { _id: string; name: string };
}

interface Epic {
  _id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  storyPoints: number;
  assignees: { _id: string; name: string }[];
  dueDate: string | null;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "epics";
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [epicDialogOpen, setEpicDialogOpen] = useState(false);
  const [newEpicTitle, setNewEpicTitle] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      return data.success ? (data.data as Project) : null;
    },
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["epics", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}/epics`);
      const data = await res.json();
      return data.success ? (data.data as Epic[]) : [];
    },
  });

  const { data: board } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}/board`);
      const data = await res.json();
      return data.success ? (data.data as Record<string, Task[]>) : null;
    },
  });

  const allTasks = board ? Object.values(board).flat() : [];

  const handleTaskSearch = useCallback((value: string) => setTaskSearch(value), []);

  const filteredTasks = taskSearch
    ? filter(allTasks, (t: Task) =>
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.assignees.some((a) => a.name.toLowerCase().includes(taskSearch.toLowerCase()))
      )
    : allTasks;

  const createEpicMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/projects/${id}/epics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      toast.success("Epic created");
      queryClient.invalidateQueries({ queryKey: ["epics", id] });
      setEpicDialogOpen(false);
      setNewEpicTitle("");
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      toast.success("Notes saved");
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setEditingNotes(false);
    },
  });

  if (projectLoading || !project) {
    return <PageLoader />;
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
          {project.description && <p className="text-sm text-slate-500 mt-1">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${id}/board`}>
            <Button variant="outline">Board View</Button>
          </Link>
          <Dialog open={epicDialogOpen} onOpenChange={setEpicDialogOpen}>
            <DialogTrigger render={<Button />}>
              New Epic
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Epic</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createEpicMutation.mutate(newEpicTitle); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="epic-title">Epic Title</Label>
                <Input
                  id="epic-title"
                  value={newEpicTitle}
                  onChange={(e) => setNewEpicTitle(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createEpicMutation.isPending}>
                {createEpicMutation.isPending ? "Creating..." : "Create Epic"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Project Notes */}
      <div className="mb-6">
        <button
          onClick={() => {
            if (authUser?.role === "Admin" || authUser?.role === "Team Lead") {
              setEditingNotes(!editingNotes);
              setNotesValue(project?.notes ?? "");
            }
          }}
          className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Documents & Notes
          <svg className={`w-3 h-3 text-slate-400 transition-transform ${editingNotes ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              className="w-full h-32 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Add document links (Google Docs, etc.) and notes here..."
              maxLength={5000}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => updateNotesMutation.mutate(notesValue)}
                disabled={updateNotesMutation.isPending}
              >
                {updateNotesMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingNotes(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : project?.notes ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap">
            {project.notes}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            {(authUser?.role === "Admin" || authUser?.role === "Team Lead")
              ? "Click to add project documents and notes"
              : "No notes yet"}
          </p>
        )}
      </div>

      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="epics" onClick={() => router.push(`/projects/${id}?tab=epics`)}>Epics</TabsTrigger>
          <TabsTrigger value="list" onClick={() => router.push(`/projects/${id}?tab=list`)}>All Tasks</TabsTrigger>
          <TabsTrigger value="calendar" onClick={() => router.push(`/projects/${id}?tab=calendar`)}>Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="epics" className="mt-4">
          {epics.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No epics yet. Create one to organize your work.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {epics.map((epic) => (
                <Link key={epic._id} href={`/projects/${id}/epics/${epic._id}`}>
                  <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TaskStatusBadge status={epic.status as Parameters<typeof TaskStatusBadge>[0]["status"]} />
                      <span className="font-medium text-slate-900">{epic.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PriorityBadge priority={epic.priority as Parameters<typeof PriorityBadge>[0]["priority"]} />
                      <span className="text-sm text-slate-500">{epic.storyPoints} SP</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          {allTasks.length > 0 && (
            <div className="mb-4">
              <SearchInput value={taskSearch} onChange={handleTaskSearch} placeholder="Search tasks by title or assignee..." className="max-w-sm" />
            </div>
          )}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>{taskSearch ? "No matching tasks" : "No tasks yet."}</p>
            </div>
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
                  {filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/tasks/${task._id}`} className="text-slate-900 hover:text-indigo-600">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <TaskStatusBadge status={task.status as Parameters<typeof TaskStatusBadge>[0]["status"]} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={task.priority as Parameters<typeof PriorityBadge>[0]["priority"]} />
                      </td>
                      <td className="px-4 py-3">
                        <AssigneeAvatars assignees={task.assignees} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{task.storyPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <ProjectTimeline projectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
