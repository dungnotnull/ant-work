import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validations/project";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Team from "@/models/Team";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let projects;
    if (session.role === "Admin") {
      projects = await Project.find()
        .populate("team", "name")
        .populate("createdBy", "name email")
        .lean();
    } else {
      // Find teams where the user is a member, then get projects for those teams
      const userTeams = await Team.find({ members: session.userId }).select("_id").lean();
      const teamIds = userTeams.map((t) => t._id);
      projects = await Project.find({ team: { $in: teamIds } })
        .populate("team", "name")
        .populate("createdBy", "name email")
        .lean();
    }

    // Attach task counts per project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const doneTasks = await Task.countDocuments({ project: project._id, status: "Done" });
        return { ...project, totalTasks, doneTasks };
      })
    );

    return NextResponse.json({ success: true, data: projectsWithCounts });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "Admin" && session.role !== "Team Lead")) {
      return NextResponse.json(
        { success: false, error: "Admin or Team Lead access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input = createProjectSchema.parse(body);

    await connectDB();

    const project = await Project.create({
      name: input.name,
      description: input.description || "",
      team: input.team,
      createdBy: session.userId,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: populatedProject }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
