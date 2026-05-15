import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ success: false, error: "Admin required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, team } = body;

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (role) updateData.role = role;
    if (team !== undefined) updateData.team = team || null;

    const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .select("-password")
      .populate("team", "name")
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
