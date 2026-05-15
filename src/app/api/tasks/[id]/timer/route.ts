import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import TimeSession from "@/models/TimeSession";
import WorkLog from "@/models/WorkLog";
import Task from "@/models/Task";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const activeSession = await TimeSession.findOne({
      task: id,
      user: session.userId,
      status: { $in: ["running", "paused"] },
    }).lean();

    return NextResponse.json({ success: true, data: activeSession });
  } catch (error) {
    console.error("Get timer error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    if (!["start", "pause", "stop"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await connectDB();

    // Get the task to find the project for worklog
    const task = await Task.findById(id).select("project").lean();
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (action === "start") {
      // Stop any other running/paused sessions for this user
      await TimeSession.updateMany(
        { user: session.userId, status: { $in: ["running", "paused"] } },
        { $set: { status: "stopped", endTime: new Date() } }
      );

      const newSession = await TimeSession.create({
        task: id,
        user: session.userId,
        status: "running",
        startTime: new Date(),
      });

      return NextResponse.json({ success: true, data: newSession });
    }

    // Find active session for pause/stop
    const activeSession = await TimeSession.findOne({
      task: id,
      user: session.userId,
      status: { $in: ["running", "paused"] },
    });

    if (!activeSession) {
      return NextResponse.json({ success: false, error: "No active session" }, { status: 404 });
    }

    if (action === "pause") {
      if (activeSession.status !== "running") {
        return NextResponse.json({ success: false, error: "Session not running" }, { status: 400 });
      }
      activeSession.status = "paused";
      activeSession.pauseTime = new Date();
      await activeSession.save();

      return NextResponse.json({ success: true, data: activeSession });
    }

    if (action === "stop") {
      const now = new Date();
      let totalPaused = activeSession.totalPausedMs || 0;

      // If currently paused, account for the pause duration
      if (activeSession.status === "paused" && activeSession.pauseTime) {
        totalPaused += now.getTime() - new Date(activeSession.pauseTime).getTime();
      }

      const durationMs = now.getTime() - new Date(activeSession.startTime).getTime() - totalPaused;
      const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

      activeSession.status = "stopped";
      activeSession.endTime = now;
      activeSession.totalPausedMs = totalPaused;
      activeSession.durationMs = durationMs;
      await activeSession.save();

      // Auto-create WorkLog if duration >= 0.25 hours
      if (durationHours >= 0.25) {
        await WorkLog.create({
          task: id,
          user: session.userId,
          project: task.project,
          hours: Math.max(0.25, durationHours),
          description: `Time tracked via timer (${Math.round(durationMs / 60000)} min)`,
          date: new Date(activeSession.startTime),
        });
      }

      return NextResponse.json({ success: true, data: activeSession });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Timer action error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
