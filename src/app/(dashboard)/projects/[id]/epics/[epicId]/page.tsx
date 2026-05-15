"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import PageLoader from "@/components/ui/PageLoader";

interface Epic { _id: string; title: string; description: string; status: string; priority: string; storyPoints: number; }
interface Story { _id: string; title: string; status: string; storyPoints: number; }
interface Project { _id: string; name: string; }

export default function EpicDetailPage() {
  const { id, epicId } = useParams<{ id: string; epicId: string }>();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => { const res = await fetch(`/api/projects/${id}`); const d = await res.json(); return d.success ? d.data : null; },
  });

  const { data: epic, isLoading: epicLoading } = useQuery({
    queryKey: ["epic", epicId],
    queryFn: async () => { const res = await fetch(`/api/epics/${epicId}`); const d = await res.json(); return d.success ? d.data : null; },
  });

  const { data: stories = [] } = useQuery({
    queryKey: ["stories", epicId],
    queryFn: async () => { const res = await fetch(`/api/epics/${epicId}/stories`); const d = await res.json(); return d.success ? d.data : []; },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/epics/${epicId}/stories`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      toast.success("Story created");
      queryClient.invalidateQueries({ queryKey: ["stories", epicId] });
      setDialogOpen(false); setNewTitle("");
    },
  });

  if (!project || epicLoading || !epic) {
    return <PageLoader />;
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${id}` },
          { label: epic.title },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{epic.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <TaskStatusBadge status={epic.status as Parameters<typeof TaskStatusBadge>[0]["status"]} />
            <PriorityBadge priority={epic.priority as Parameters<typeof PriorityBadge>[0]["priority"]} />
            <span className="text-sm text-slate-500">{epic.storyPoints} SP</span>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            New Story
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Story</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createStoryMutation.mutate(newTitle); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="story-title">Story Title</Label>
                <Input id="story-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={createStoryMutation.isPending}>
                {createStoryMutation.isPending ? "Creating..." : "Create Story"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No stories yet.</div>
      ) : (
        <div className="space-y-2">
          {stories.map((story: Story) => (
            <Link key={story._id} href={`/projects/${id}/stories/${story._id}`}>
              <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TaskStatusBadge status={story.status as Parameters<typeof TaskStatusBadge>[0]["status"]} />
                  <span className="font-medium text-slate-900">{story.title}</span>
                </div>
                <span className="text-sm text-slate-500">{story.storyPoints} SP</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
