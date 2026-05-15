import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { createWorkLogSchema } from "@/lib/validations/worklog";
import WorkLog from "@/models/WorkLog";
import Task from "@/models/Task";

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
    const body = await request.json();
    const input = createWorkLogSchema.parse(body);

    await connectDB();

    const task = await Task.findById(id).lean();
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    const workLog = await WorkLog.create({
      task: id,
      user: session.userId,
      project: task.project,
      hours: input.hours,
      description: input.description,
      date: new Date(input.date),
    });

    return NextResponse.json({ success: true, data: workLog }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    console.error("Create work log error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
