import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validations/project";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Epic from "@/models/Epic";
import Story from "@/models/Story";
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

    const project = await Project.findById(id)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Get project error:", error);
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
    if (!session || (session.role !== "Admin" && session.role !== "Team Lead")) {
      return NextResponse.json(
        { success: false, error: "Admin or Team Lead access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const input = updateProjectSchema.parse(body);

    await connectDB();

    const project = await Project.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true })
      .populate("team", "name")
      .populate("createdBy", "name email")
      .lean();

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Update project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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
    await connectDB();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Cascade delete: subtasks -> tasks -> stories -> epics -> project
    // Tasks reference stories which reference epics, so find via epics under this project
    const projectEpics = await Epic.find({ project: id }).select("_id").lean();
    const epicIds = projectEpics.map((e) => e._id);

    const projectStories = await Story.find({ epic: { $in: epicIds } }).select("_id").lean();
    const storyIds = projectStories.map((s) => s._id);

    const projectTasks = await Task.find({ story: { $in: storyIds } }).select("_id").lean();
    const taskIds = projectTasks.map((t) => t._id);

    await SubTask.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ _id: { $in: taskIds } });
    await Story.deleteMany({ _id: { $in: storyIds } });
    await Epic.deleteMany({ _id: { $in: epicIds } });
    await Project.deleteOne({ _id: id });

    return NextResponse.json({ success: true, data: { message: "Project and all associated data deleted" } });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
