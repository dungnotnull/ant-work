import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { Types } from "mongoose";
import User from "@/models/User";
import WorkLog from "@/models/WorkLog";
import Task from "@/models/Task";

// Baseline: 5 SP + 3 tasks per day is "perfect 10"
const SP_WEIGHT = 0.4;
const TASK_WEIGHT = 0.6;
const DAILY_SP_BENCHMARK = 5;
const DAILY_TASK_BENCHMARK = 3;
const EVALUATION_DAYS = 7;

interface UserEfficiency {
  userId: string;
  name: string;
  email: string;
  role: string;
  efficiency: number;
  completedTasks: number;
  completedSP: number;
  hoursLogged: number;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - EVALUATION_DAYS);

    // Only admin/team lead can see all users
    const currentUser = await User.findById(session.userId).lean();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isAdmin = currentUser.role === "Admin" || currentUser.role === "Team Lead";

    let users;
    if (isAdmin) {
      users = await User.find({ role: { $ne: "Admin" } }).select("name email role").lean();
    } else {
      users = [currentUser];
    }

    const results: UserEfficiency[] = [];

    for (const user of users) {
      const userId = new Types.ObjectId(user._id);

      // Get work logs for past 7 days
      const workLogs = await WorkLog.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$hours" },
          },
        },
      ]);

      // Get tasks completed (moved to Done) in past 7 days
      const completedTasksAgg = await Task.aggregate([
        {
          $match: {
            assignees: userId,
            status: "Done",
            updatedAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalSP: { $sum: "$storyPoints" },
          },
        },
      ]);

      const hoursLogged = workLogs.length > 0 ? Math.round(workLogs[0].totalHours * 10) / 10 : 0;
      const completedTasks = completedTasksAgg.length > 0 ? completedTasksAgg[0].count : 0;
      const completedSP = completedTasksAgg.length > 0 ? completedTasksAgg[0].totalSP : 0;

      // Calculate efficiency score (0-10 scale)
      const spScore = completedSP / (DAILY_SP_BENCHMARK * EVALUATION_DAYS);
      const taskScore = completedTasks / (DAILY_TASK_BENCHMARK * EVALUATION_DAYS);
      const rawScore = (completedSP * SP_WEIGHT + completedTasks * TASK_WEIGHT)
        / (DAILY_SP_BENCHMARK * EVALUATION_DAYS * SP_WEIGHT + DAILY_TASK_BENCHMARK * EVALUATION_DAYS * TASK_WEIGHT)
        * 10;

      const efficiency = Math.min(10, Math.round(rawScore * 10) / 10);

      results.push({
        userId: (user._id as Types.ObjectId).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        efficiency: Math.max(0, efficiency),
        completedTasks,
        completedSP,
        hoursLogged,
      });
    }

    // Sort by efficiency descending
    results.sort((a, b) => b.efficiency - a.efficiency);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Efficiency error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
