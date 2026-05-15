import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { createStorySchema } from "@/lib/validations/workItem";
import Story from "@/models/Story";
import Epic from "@/models/Epic";

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

    const stories = await Story.find({ epic: id }).populate("createdBy", "name").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: stories });
  } catch (error) {
    console.error("Get stories error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const input = createStorySchema.parse(body);

    await connectDB();

    const epic = await Epic.findById(id).lean();
    if (!epic) {
      return NextResponse.json({ success: false, error: "Epic not found" }, { status: 404 });
    }

    const story = await Story.create({
      ...input,
      epic: id,
      project: epic.project,
      createdBy: session.userId,
    });

    // Rollup: recalculate epic story points
    const { rollupFromStory } = await import("@/lib/rollup");
    await rollupFromStory(story._id.toString());

    const populated = await Story.findById(story._id).populate("createdBy", "name").lean();
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: (error as any).errors },
        { status: 400 }
      );
    }
    console.error("Create story error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
