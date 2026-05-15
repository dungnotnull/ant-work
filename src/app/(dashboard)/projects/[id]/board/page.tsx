"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      const d = await res.json();
      return d.success ? (d.data as Project) : null;
    },
  });

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}/board`);
      const d = await res.json();
      return d.success ? (d.data as Record<string, TaskData[]>) : null;
    },
  });

  if (projectLoading || boardLoading || !project || !board) {
    return <PageLoader />;
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
