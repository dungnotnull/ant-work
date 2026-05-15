import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import WorkLog from "@/models/WorkLog";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

    await connectDB();

    const User = (await import("@/models/User")).default;
    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await WorkLog.find({
      user: session.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("task", "title storyPoints status")
      .populate("project", "name")
      .lean();

    // Generate template
    const doneLogs = logs.filter((l) => {
      const task = l.task as any;
      return task.status === "Done";
    });
    const inProgressLogs = logs.filter((l) => {
      const task = l.task as any;
      return task.status === "In Progress";
    });

    const totalSP = logs.reduce((sum, l) => {
      const task = l.task as any;
      return sum + (task.storyPoints || 0);
    }, 0);
    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);

    const doneLines = doneLogs
      .map((l) => {
        const task = l.task as any;
        const project = l.project as any;
        return `- ${task.title} (${project.name}) - ${task.storyPoints}pt - ${l.hours}h`;
      })
      .join("\n");

    const inProgressLines = inProgressLogs
      .map((l) => {
        const task = l.task as any;
        const project = l.project as any;
        return `- ${task.title} (${project.name}) - ${l.description}`;
      })
      .join("\n");

    const template = `Daily Report - ${user.name} - ${format(new Date(date), "dd/MM/yyyy")}

Done:
${doneLines || "- None"}

In Progress:
${inProgressLines || "- None"}

Blocked / Issues:
- None

Total: ${totalSP} story points, ${totalHours} hours`;

    return NextResponse.json({
      success: true,
      data: {
        template,
        logs,
        totalSP,
        totalHours,
      },
    });
  } catch (error) {
    console.error("Daily report error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
