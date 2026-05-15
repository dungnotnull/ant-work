import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { updateStorySchema } from "@/lib/validations/workItem";
import Story from "@/models/Story";

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

    const story = await Story.findById(id).populate("createdBy", "name").lean();
    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: story });
  } catch (error) {
    console.error("Get story error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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
    const input = updateStorySchema.parse(body);

    await connectDB();

    const story = await Story.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true })
      .populate("createdBy", "name")
      .lean();

    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    // Rollup if story points changed
    if (input.storyPoints !== undefined) {
      const { rollupFromStory } = await import("@/lib/rollup");
      await rollupFromStory(id);
    }

    return NextResponse.json({ success: true, data: story });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: (error as any).errors },
        { status: 400 }
      );
    }
    console.error("Update story error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
