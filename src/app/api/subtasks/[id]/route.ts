import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { updateSubTaskSchema } from "@/lib/validations/workItem";
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

    const subtask = await SubTask.findById(id).populate("assignee", "name email").lean();
    if (!subtask) {
      return NextResponse.json({ success: false, error: "SubTask not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subtask });
  } catch (error) {
    console.error("Get subtask error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
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
    const input = updateSubTaskSchema.parse(body);

    await connectDB();

    const updateData: Record<string, unknown> = { ...input };
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    if (input.assignee !== undefined) {
      updateData.assignee = input.assignee || null;
    }

    const subtask = await SubTask.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate("assignee", "name email")
      .lean();

    if (!subtask) {
      return NextResponse.json({ success: false, error: "SubTask not found" }, { status: 404 });
    }

    // Rollup if story points changed
    if (input.storyPoints !== undefined) {
      const { rollupFromTask } = await import("@/lib/rollup");
      await rollupFromTask(subtask.task.toString());
    }

    return NextResponse.json({ success: true, data: subtask });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: (error as any).errors },
        { status: 400 }
      );
    }
    console.error("Update subtask error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
