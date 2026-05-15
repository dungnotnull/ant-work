"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { filter } from "lodash";
import ProjectCard from "@/components/projects/ProjectCard";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import SearchInput from "@/components/ui/SearchInput";
import { useAuth } from "@/hooks/useAuth";

interface Project {
  _id: string;
  name: string;
  description: string;
  team: { _id: string; name: string };
  createdBy: { _id: string; name: string };
  totalTasks: number;
  doneTasks: number;
  updatedAt: string;
}

interface Team {
  _id: string;
  name: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const data = await res.json();
      return data.success ? (data.data as Project[]) : [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      const data = await res.json();
      return data.success ? (data.data as Team[]) : [];
    },
  });

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const filtered = search
    ? filter(projects, (p: Project) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  if (projectsLoading) {
    return (
      <div className="page-enter">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const canCreate = user?.role === "Admin" || user?.role === "Team Lead";

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            {search ? `${filtered.length} of ${projects.length} projects` : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {canCreate && (
          <CreateProjectDialog
            teams={teams}
            onCreated={() => queryClient.invalidateQueries({ queryKey: ["projects"] })}
          />
        )}
      </div>

      {projects.length > 0 && (
        <div className="mb-6">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search projects..." className="max-w-sm" />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">{search ? "No matching projects" : "No projects yet"}</p>
          <p className="text-sm text-slate-400 mt-1">{search ? "Try a different search term" : "Create your first project to get started."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-animate">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
