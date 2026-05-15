import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import WorkLog from "@/models/WorkLog";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "Admin" && session.role !== "Team Lead")) {
      return NextResponse.json({ success: false, error: "Admin or Team Lead required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ success: false, error: "date parameter required" }, { status: 400 });
    }

    await connectDB();

    const User = (await import("@/models/User")).default;
    const user = await User.findById(session.userId).lean();
    if (!user?.team) {
      return NextResponse.json({ success: true, data: [] });
    }

    const teamMembers = await User.find({ team: user.team }).lean();
    const memberIds = teamMembers.map((m) => m._id);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await WorkLog.find({
      user: { $in: memberIds },
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("task", "title storyPoints")
      .populate("project", "name")
      .populate("user", "name")
      .sort({ user: 1, date: -1 })
      .lean();

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get team worklogs error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
