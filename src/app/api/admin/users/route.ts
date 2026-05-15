import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json({ success: false, error: "Admin required" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find().select("-password").populate("team", "name").lean();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
