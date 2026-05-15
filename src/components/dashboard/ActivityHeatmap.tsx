"use client";

import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays, getDay } from "date-fns";

interface ActivityData {
  date: string;
  count: number;
}

const ACTIVITY_COLORS = [
  "bg-slate-200",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-500",
  "bg-emerald-700",
];

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

function getColor(count: number): string {
  if (count === 0) return ACTIVITY_COLORS[0];
  if (count <= 1) return ACTIVITY_COLORS[1];
  if (count <= 3) return ACTIVITY_COLORS[2];
  if (count <= 5) return ACTIVITY_COLORS[3];
  return ACTIVITY_COLORS[4];
}

export default function ActivityHeatmap({ data }: { data: ActivityData[] }) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 90);
    const gridStart = startOfWeek(startDate, { weekStartsOn: 1 });

    // O(1) lookup
    const activityMap = new Map<string, number>();
    for (const d of data) {
      activityMap.set(format(new Date(d.date), "yyyy-MM-dd"), d.count);
    }

    // Build weeks: each week = 7 entries (Mon=0 .. Sun=6), null for padding
    const result: { date: Date | null; count: number }[][] = [];
    let currentWeek: { date: Date | null; count: number }[] = [];

    const firstDayOffset = getDay(gridStart) === 0 ? 6 : getDay(gridStart) - 1;
    const totalDays = Math.ceil((today.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const date = addDays(gridStart, i);
      if (i === 0 && firstDayOffset > 0) {
        for (let p = 0; p < firstDayOffset; p++) {
          currentWeek.push({ date: null, count: -1 });
        }
      }
      if (i > 0 && getDay(date) === 1 && currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push({ date: null, count: -1 });
        result.push(currentWeek);
        currentWeek = [];
      }
      const key = format(date, "yyyy-MM-dd");
      currentWeek.push({ date, count: activityMap.get(key) ?? 0 });
    }
    while (currentWeek.length < 7) currentWeek.push({ date: null, count: -1 });
    if (currentWeek.some((c) => c.date !== null)) result.push(currentWeek);

    // Month labels: one label when the first real date of a week enters a new month
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    for (let wi = 0; wi < result.length; wi++) {
      const firstReal = result[wi].find((c) => c.date !== null);
      if (!firstReal || !firstReal.date) continue;
      const m = firstReal.date.getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        labels.push({ label: format(firstReal.date, "MMM"), colIndex: wi });
      }
    }

    return { weeks: result, monthLabels: labels };
  }, [data]);

  const totalActive = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  const numWeeks = weeks.length;

  // Use CSS grid for perfect alignment of month labels + day cells
  // Column = one per week, Row 1 = month label, Rows 2-8 = Mon..Sun
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalActive} contributions in the last 3 months
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-shrink-0">
          Less
          {ACTIVITY_COLORS.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
          More
        </div>
      </div>

      {/* Day labels + Grid */}
      <div className="flex gap-[6px]">
        {/* Day-of-week labels column */}
        <div className="flex flex-col gap-[3px] flex-shrink-0 pt-[18px]">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-[13px] flex items-center text-[10px] text-slate-400 leading-none w-6"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid area */}
        <div className="overflow-x-auto flex-1 min-w-0">
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${numWeeks}, 1fr)`,
              gridTemplateRows: `16px repeat(7, 13px)`,
            }}
          >
            {/* Row 1: Month labels (one cell per week column) */}
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.colIndex === wi);
              return (
                <div key={`m-${wi}`} className="text-[10px] text-slate-400 leading-none h-4">
                  {ml?.label ?? ""}
                </div>
              );
            })}

            {/* Rows 2-8: Day cells (7 rows x numWeeks columns) */}
            {weeks.map((week, wi) =>
              week.map((cell, di) => {
                if (!cell.date) {
                  return <div key={`e-${wi}-${di}`} className="h-[13px]" />;
                }
                return (
                  <div
                    key={`c-${wi}-${di}`}
                    className={`heatmap-cell h-[13px] rounded-[3px] ${getColor(cell.count)}`}
                    title={`${format(cell.date, "MMM d, yyyy")}: ${cell.count} activities`}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          {activeDays} active days
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          {data.length > 0
            ? `Best: ${Math.max(...data.map((d) => d.count))} activities`
            : "No activity yet"}
        </span>
      </div>
    </div>
  );
}
