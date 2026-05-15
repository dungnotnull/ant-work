import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Task from "@/models/Task";
import { TASK_STATUSES } from "@/lib/constants";
import { groupBy } from "lodash";

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

    const tasks = await Task.find({ project: id })
      .populate("assignees", "name email")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    const grouped = groupBy(tasks, "status");

    // Ensure all columns exist even if empty
    const board: Record<string, typeof tasks> = {};
    for (const status of TASK_STATUSES) {
      board[status] = grouped[status] || [];
    }

    return NextResponse.json({ success: true, data: board });
  } catch (error) {
    console.error("Get board error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
