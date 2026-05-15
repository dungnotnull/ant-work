import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { createSubTaskSchema } from "@/lib/validations/workItem";
import { rollupFromTask } from "@/lib/rollup";
import Task from "@/models/Task";
import SubTask from "@/models/SubTask";

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

    const subtasks = await SubTask.find({ task: id })
      .populate("assignee", "name email")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, data: subtasks });
  } catch (error) {
    console.error("Get task subtasks error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
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
    const body = await request.json();
    const input = createSubTaskSchema.parse(body);

    await connectDB();

    const task = await Task.findById(id).lean();
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const subtask = await SubTask.create({
      title: input.title,
      description: input.description || "",
      task: id,
      project: task.project,
      status: input.status || "To Do",
      priority: input.priority || "Medium",
      storyPoints: input.storyPoints || 0,
      assignee: input.assignee || session.userId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      createdBy: session.userId,
    });

    await rollupFromTask(id);

    const populatedSubtask = await SubTask.findById(subtask._id)
      .populate("assignee", "name email")
      .lean();

    return NextResponse.json({ success: true, data: populatedSubtask }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Create subtask error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
