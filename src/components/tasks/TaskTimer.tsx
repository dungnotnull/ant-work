"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface TimeSession {
  _id: string;
  status: "running" | "paused" | "stopped";
  startTime: string;
  pauseTime: string | null;
  totalPausedMs: number;
}

export default function TaskTimer({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const [elapsed, setElapsed] = useState(0);

  const { data: activeSession } = useQuery({
    queryKey: ["timer", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/timer`);
      const data = await res.json();
      return data.success ? (data.data as TimeSession | null) : null;
    },
  });

  // Tick the elapsed time
  useEffect(() => {
    if (!activeSession || activeSession.status === "stopped") {
      setElapsed(0);
      return;
    }

    const calcElapsed = () => {
      const start = new Date(activeSession.startTime).getTime();
      let paused = activeSession.totalPausedMs || 0;

      if (activeSession.status === "paused" && activeSession.pauseTime) {
        paused += Date.now() - new Date(activeSession.pauseTime).getTime();
      }

      return Date.now() - start - paused;
    };

    setElapsed(calcElapsed());
    const interval = setInterval(() => setElapsed(calcElapsed()), 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const timerMutation = useMutation({
    mutationFn: async (action: "start" | "pause" | "stop") => {
      const res = await fetch(`/api/tasks/${taskId}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timer", taskId] });
      queryClient.invalidateQueries({ queryKey: ["recentWorkLogs"] });
    },
    onError: () => toast.error("Timer action failed"),
  });

  const formatTime = useCallback((ms: number) => {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  const status = activeSession?.status;
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isActive = isRunning || isPaused;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Time Tracking</h3>

      <div className="text-center mb-4">
        <p className={`text-3xl font-mono font-bold tracking-wider ${isActive ? "text-indigo-600" : "text-slate-300"}`}>
          {isActive ? formatTime(elapsed) : "00:00:00"}
        </p>
        {isRunning && (
          <p className="text-xs text-emerald-500 mt-1 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Running
          </p>
        )}
        {isPaused && (
          <p className="text-xs text-amber-500 mt-1">Paused</p>
        )}
      </div>

      <div className="flex gap-2">
        {!isActive && (
          <Button
            onClick={() => timerMutation.mutate("start")}
            disabled={timerMutation.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </Button>
        )}
        {isRunning && (
          <Button
            onClick={() => timerMutation.mutate("pause")}
            disabled={timerMutation.isPending}
            variant="outline"
            className="flex-1 border-amber-300 text-amber-600 hover:bg-amber-50 h-9 text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            Hold
          </Button>
        )}
        {isPaused && (
          <Button
            onClick={() => timerMutation.mutate("start")}
            disabled={timerMutation.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Resume
          </Button>
        )}
        {isActive && (
          <Button
            onClick={() => timerMutation.mutate("stop")}
            disabled={timerMutation.isPending}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-9 text-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            End
          </Button>
        )}
      </div>
    </div>
  );
}
