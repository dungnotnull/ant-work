import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Task from "@/models/Task";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    await connectDB();

    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Find tasks that overlap with the date range
    const tasks = await Task.find({
      project: id,
      $or: [
        { createdAt: { $lte: endDate }, dueDate: { $gte: startDate } },
        { createdAt: { $lte: endDate }, dueDate: null },
      ],
    })
      .populate("assignees", "name email")
      .select("title status priority createdAt dueDate storyPoints assignees")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Timeline error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
