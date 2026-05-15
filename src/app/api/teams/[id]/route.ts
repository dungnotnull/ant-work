import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { updateTeamSchema } from "@/lib/validations/team";
import Team from "@/models/Team";
import User from "@/models/User";

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

    const team = await Team.findById(id)
      .populate("lead", "name email")
      .populate("members", "name email")
      .lean();

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("Get team error:", error);
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
    if (!session || session.role !== "Admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const input = updateTeamSchema.parse(body);

    await connectDB();

    if (input.members) {
      const oldTeam = await Team.findById(id).lean();
      if (oldTeam) {
        await User.updateMany(
          { _id: { $in: oldTeam.members }, team: id },
          { $unset: { team: 1 } }
        );
        await User.updateMany(
          { _id: { $in: input.members } },
          { $set: { team: id } }
        );
      }
    }

    const team = await Team.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true })
      .populate("lead", "name email")
      .populate("members", "name email")
      .lean();

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Update team error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
