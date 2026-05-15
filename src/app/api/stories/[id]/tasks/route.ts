import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { createTaskSchema } from "@/lib/validations/workItem";
import { rollupFromTask } from "@/lib/rollup";
import Story from "@/models/Story";
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

    const tasks = await Task.find({ story: id })
      .populate("assignees", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Get story tasks error:", error);
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
    const input = createTaskSchema.parse(body);

    await connectDB();

    const story = await Story.findById(id).lean();
    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    const task = await Task.create({
      title: input.title,
      description: input.description || "",
      story: id,
      project: story.project,
      status: input.status || "To Do",
      priority: input.priority || "Medium",
      storyPoints: input.storyPoints || 0,
      assignees: input.assignees || [session.userId],
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      createdBy: session.userId,
    });

    await rollupFromTask(task._id.toString());

    const populatedTask = await Task.findById(task._id)
      .populate("assignees", "name email")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: populatedTask }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Create task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
