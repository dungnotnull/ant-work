"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface WorkLog {
  _id: string;
  task: { _id: string; title: string; storyPoints: number };
  project: { _id: string; name: string };
  hours: number;
  description: string;
  date: string;
}

interface DailyReportData {
  template: string;
  logs: WorkLog[];
  totalSP: number;
  totalHours: number;
}

export default function DailyReportPage() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLog, setNewLog] = useState({ task: "", hours: 1, description: "" });

  const { data: report } = useQuery<DailyReportData>({
    queryKey: ["dailyReport", date],
    queryFn: async () => {
      const res = await fetch(`/api/reports/daily?date=${date}`);
      const result = await res.json();
      if (!result.success) throw new Error("Failed to load report");
      return result.data;
    },
  });

  const { data: tasks = [] } = useQuery<{ _id: string; title: string; project: { name: string } }[]>({
    queryKey: ["myTasks"],
    queryFn: async () => {
      const meRes = await fetch("/api/users/me");
      const meData = await meRes.json();
      if (!meData.success) return [];

      const projectsRes = await fetch("/api/projects");
      const projectsData = await projectsRes.json();
      if (!projectsData.success) return [];

      const allTasks: { _id: string; title: string; project: { name: string } }[] = [];
      for (const project of projectsData.data) {
        const boardRes = await fetch(`/api/projects/${project._id}/board`);
        const boardData = await boardRes.json();
        if (boardData.success) {
          const flat = Object.values(boardData.data).flat() as { _id: string; title: string; assignees: { _id: string }[] }[];
          const mine = flat.filter((t) =>
            t.assignees?.some((a) => a._id === meData.data._id)
          );
          allTasks.push(...mine.map((t) => ({ ...t, project: { name: project.name } })));
        }
      }
      return allTasks;
    },
    enabled: dialogOpen,
  });

  const logWorkMutation = useMutation({
    mutationFn: async (input: { task: string; hours: number; description: string; date: string }) => {
      const res = await fetch(`/api/tasks/${input.task}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      return data.data;
    },
    onSuccess: () => {
      toast.success("Work logged");
      queryClient.invalidateQueries({ queryKey: ["dailyReport", date] });
      setDialogOpen(false);
      setNewLog({ task: "", hours: 1, description: "" });
    },
    onError: () => {
      toast.error("Failed to log work");
    },
  });

  const copyToClipboard = () => {
    if (report?.template) {
      navigator.clipboard.writeText(report.template);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Report</h1>
          <p className="text-sm text-slate-500 mt-1">Log work and generate standup reports</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Log Work
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Work</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              logWorkMutation.mutate({
                task: newLog.task,
                hours: newLog.hours,
                description: newLog.description,
                date: new Date(date).toISOString(),
              });
            }} className="space-y-4">
              <div className="space-y-2">
                <Label>Task</Label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-indigo-500 outline-none transition-all"
                  value={newLog.task}
                  onChange={(e) => setNewLog({ ...newLog, task: e.target.value })}
                  required
                >
                  <option value="">Select task...</option>
                  {tasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} ({t.project.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0.25}
                  max={24}
                  step={0.25}
                  value={newLog.hours}
                  onChange={(e) => setNewLog({ ...newLog, hours: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={newLog.description}
                  onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25" disabled={logWorkMutation.isPending}>
                {logWorkMutation.isPending ? "Logging..." : "Log"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Label htmlFor="report-date" className="text-sm font-medium text-slate-700">Date</Label>
        <Input
          id="report-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-48 mt-1.5 h-11"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Report Template</CardTitle>
              <Button size="sm" onClick={copyToClipboard} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy
                </span>
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg font-mono border border-slate-100">
                {report?.template || ""}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Today&apos;s Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Story Points</span>
                <span className="text-lg font-bold text-indigo-600">{report?.totalSP ?? 0}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Hours Logged</span>
                <span className="text-lg font-bold text-emerald-600">{report?.totalHours ?? 0}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Tasks Logged</span>
                <span className="text-lg font-bold text-slate-900">{report?.logs.length ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
