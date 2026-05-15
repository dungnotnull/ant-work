import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Task from "@/models/Task";
import { sumBy } from "lodash";
import { subMonths, startOfMonth } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.userId;
    const period = searchParams.get("period") || "month";

    // Only admin/lead can view other users
    if (userId !== session.userId && session.role !== "Admin" && session.role !== "Team Lead") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const now = new Date();
    const monthsBack = period === "quarter" ? 3 : period === "year" ? 12 : 1;
    const startDate = subMonths(startOfMonth(now), monthsBack);

    const tasks = await Task.find({
      assignees: userId,
      createdAt: { $gte: startDate },
    }).lean();

    const totalAssigned = tasks.length;
    const completed = tasks.filter((t) => t.status === "Done").length;
    const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

    const doneWithDue = tasks.filter((t) => t.status === "Done" && t.dueDate);
    const onTime = doneWithDue.filter(
      (t) => new Date(t.updatedAt) <= new Date(t.dueDate!)
    ).length;
    const onTimeRate = doneWithDue.length > 0 ? Math.round((onTime / doneWithDue.length) * 100) : 0;

    const sp = sumBy(tasks.filter((t) => t.status === "Done"), "storyPoints");

    // Individual score: 50% completion + 30% on-time + 20% velocity consistency
    const velocityConsistency = completionRate > 0 ? Math.min(100, Math.round(sp / (monthsBack * 10) * 100)) : 0;
    const individualScore = Math.round(
      completionRate * 0.5 + onTimeRate * 0.3 + velocityConsistency * 0.2
    );

    return NextResponse.json({
      success: true,
      data: {
        totalAssigned,
        completed,
        completionRate,
        onTimeRate,
        storyPoints: sp,
        individualScore,
        velocityConsistency,
      },
    });
  } catch (error) {
    console.error("Member performance error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
