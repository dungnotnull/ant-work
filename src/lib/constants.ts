export const TASK_STATUSES = ["Backlog", "To Do", "In Progress", "In Review", "Done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const ROLES = ["Admin", "Team Lead", "Member"] as const;
export type Role = (typeof ROLES)[number];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  Backlog: "bg-slate-100 text-slate-700",
  "To Do": "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  "In Review": "bg-violet-100 text-violet-700",
  Done: "bg-green-100 text-green-700",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-600",
  High: "bg-orange-100 text-orange-600",
  Critical: "bg-red-100 text-red-600",
};
