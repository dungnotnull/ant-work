import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { Types } from "mongoose";
import WorkLog from "@/models/WorkLog";
import Task from "@/models/Task";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new Types.ObjectId(session.userId);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 91);

    const workLogs = await WorkLog.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: ninetyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const completedTasks = await Task.aggregate([
      {
        $match: {
          assignees: userId,
          status: "Done",
          updatedAt: { $gte: ninetyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const activityMap = new Map<string, number>();
    for (const log of workLogs) {
      activityMap.set(log._id, (activityMap.get(log._id) || 0) + log.count);
    }
    for (const task of completedTasks) {
      activityMap.set(task._id, (activityMap.get(task._id) || 0) + task.count);
    }

    const data = Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch activity" }, { status: 500 });
  }
}
