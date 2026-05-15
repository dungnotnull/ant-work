import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import WorkLog from "@/models/WorkLog";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await connectDB();

    const filter: Record<string, unknown> = { user: session.userId };
    if (startDate || endDate) {
      filter.date = {
        ...(startDate && { $gte: new Date(startDate) }),
        ...(endDate && { $lte: new Date(endDate) }),
      };
    }

    const logs = await WorkLog.find(filter)
      .populate("task", "title storyPoints")
      .populate("project", "name")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get my worklogs error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
