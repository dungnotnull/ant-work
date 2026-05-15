import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { createTeamSchema } from "@/lib/validations/team";
import Team from "@/models/Team";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let teams;
    if (session.role === "Admin") {
      teams = await Team.find().populate("lead", "name email").populate("members", "name email").lean();
    } else {
      teams = await Team.find({ members: session.userId })
        .populate("lead", "name email")
        .populate("members", "name email")
        .lean();
    }

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error("Get teams error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input = createTeamSchema.parse(body);

    await connectDB();

    const leadUser = await User.findById(input.lead);
    if (!leadUser) {
      return NextResponse.json(
        { success: false, error: "Lead user not found" },
        { status: 400 }
      );
    }

    const team = await Team.create({
      name: input.name,
      description: input.description || "",
      lead: input.lead,
      members: [input.lead],
    });

    await User.findByIdAndUpdate(input.lead, { team: team._id });

    const populatedTeam = await Team.findById(team._id)
      .populate("lead", "name email")
      .populate("members", "name email")
      .lean();

    return NextResponse.json({ success: true, data: populatedTeam }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Create team error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
