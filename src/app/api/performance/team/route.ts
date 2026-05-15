import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Task from "@/models/Task";
import WorkLog from "@/models/WorkLog";
import { groupBy, sumBy } from "lodash";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "Admin" && session.role !== "Team Lead")) {
      return NextResponse.json({ success: false, error: "Admin or Team Lead required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const projectId = searchParams.get("projectId");

    await connectDB();

    // Determine date range
    const now = new Date();
    const monthsBack = period === "quarter" ? 3 : period === "year" ? 12 : 1;
    const startDate = subMonths(startOfMonth(now), monthsBack);

    // Build task filter
    const taskFilter: Record<string, unknown> = {
      createdAt: { $gte: startDate },
    };
    if (projectId) taskFilter.project = projectId;

    const tasks = await Task.find(taskFilter).populate("assignees", "name").lean();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Done").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // On-time rate
    const doneTasksWithDue = tasks.filter((t) => t.status === "Done" && t.dueDate);
    const onTimeTasks = doneTasksWithDue.filter(
      (t) => new Date(t.updatedAt) <= new Date(t.dueDate!)
    ).length;
    const onTimeRate = doneTasksWithDue.length > 0 ? Math.round((onTimeTasks / doneTasksWithDue.length) * 100) : 0;

    // Velocity -- story points completed per month
    const completedTasksByMonth = groupBy(
      tasks.filter((t) => t.status === "Done"),
      (t) => format(new Date(t.updatedAt), "yyyy-MM")
    );

    const dateRange = eachMonthOfInterval({ start: startDate, end: now });
    const velocity = dateRange.map((d) => {
      const key = format(d, "yyyy-MM");
      const monthTasks = completedTasksByMonth[key] || [];
      return {
        month: format(d, "MMM yyyy"),
        storyPoints: sumBy(monthTasks, "storyPoints"),
        tasks: monthTasks.length,
      };
    });

    // Total SP
    const totalStoryPoints = sumBy(tasks.filter((t) => t.status === "Done"), "storyPoints");
    const totalEstimatedSP = sumBy(tasks, "storyPoints");
    const spAccuracy = totalEstimatedSP > 0 ? Math.round((totalStoryPoints / totalEstimatedSP) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        completionRate,
        onTimeRate,
        totalStoryPoints,
        spAccuracy,
        velocity,
      },
    });
  } catch (error) {
    console.error("Team performance error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
