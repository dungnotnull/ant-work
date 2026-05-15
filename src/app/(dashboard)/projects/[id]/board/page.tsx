"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import KanbanBoard from "@/components/board/KanbanBoard";
import AntAgentChat from "@/components/board/AntAgentChat";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type TaskStatus } from "@/lib/constants";
import PageLoader from "@/components/ui/PageLoader";

interface TaskData {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  storyPoints: number;
  assignees: { _id: string; name: string }[];
  dueDate: string | null;
}

interface Project {
  _id: string;
  name: string;
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading, isError: projectError } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to load project");
      return d.data as Project;
    },
  });

  const { data: board, isLoading: boardLoading, isError: boardError } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}/board`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to load board");
      return d.data as Record<string, TaskData[]>;
    },
  });

  if (projectLoading || boardLoading) {
    return <PageLoader />;
  }

  if (projectError || boardError || !project || !board) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500">Failed to load board</p>
        <button
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          onClick={() => { queryClient.invalidateQueries({ queryKey: ["project", id] }); queryClient.invalidateQueries({ queryKey: ["board", id] }); }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${id}` },
          { label: "Board" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board" onClick={() => router.push(`/projects/${id}/board`)}>
              Board
            </TabsTrigger>
            <TabsTrigger value="list" onClick={() => router.push(`/projects/${id}`)}>
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0 overflow-hidden">
          <KanbanBoard projectId={id as string} initialBoard={board} />
        </div>

        <div className="w-80 flex-shrink-0">
          <AntAgentChat projectId={id as string} />
        </div>
      </div>
    </div>
  );
}
