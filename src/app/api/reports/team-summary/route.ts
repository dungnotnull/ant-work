import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import WorkLog from "@/models/WorkLog";
import { groupBy, sumBy } from "lodash";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "Admin" && session.role !== "Team Lead")) {
      return NextResponse.json({ success: false, error: "Admin or Team Lead required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ success: false, error: "date parameter required" }, { status: 400 });
    }

    await connectDB();

    const User = (await import("@/models/User")).default;
    const user = await User.findById(session.userId).lean();
    if (!user?.team) {
      return NextResponse.json({ success: true, data: [] });
    }

    const teamMembers = await User.find({ team: user.team }).lean();
    const memberIds = teamMembers.map((m) => m._id);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await WorkLog.find({
      user: { $in: memberIds },
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("task", "title storyPoints status")
      .populate("project", "name")
      .lean();

    const groupedByUser = groupBy(logs, "user._id");

    const summary = teamMembers.map((member) => {
      const memberLogs = groupedByUser[member._id.toString()] || [];
      const tasksDone = memberLogs.filter((l) => {
        const task = l.task as any;
        return task.status === "Done";
      }).length;
      const sp = sumBy(memberLogs, (l) => (l.task as any).storyPoints || 0);
      const hours = sumBy(memberLogs, "hours");

      return {
        userId: member._id,
        name: member.name,
        storyPoints: sp,
        hoursLogged: hours,
        tasksDone,
        logs: memberLogs,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        date,
        members: summary,
        totals: {
          storyPoints: sumBy(summary, "storyPoints"),
          hoursLogged: sumBy(summary, "hoursLogged"),
          tasksDone: sumBy(summary, "tasksDone"),
        },
      },
    });
  } catch (error) {
    console.error("Team summary error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
