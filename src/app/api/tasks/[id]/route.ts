import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validations/workItem";
import { rollupFromTask } from "@/lib/rollup";
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

    const task = await Task.findById(id)
      .populate("assignees", "name email")
      .populate("createdBy", "name email")
      .populate("reviewer", "name email")
      .lean();

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const input = updateTaskSchema.parse(body);

    await connectDB();

    const updateData: Record<string, unknown> = { ...input };

    if ("dueDate" in input) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    if ("startDate" in input) {
      updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    }

    const task = await Task.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate("assignees", "name email")
      .populate("createdBy", "name email")
      .populate("reviewer", "name email")
      .lean();

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    if ("storyPoints" in input) {
      await rollupFromTask(id);
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Update task error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
