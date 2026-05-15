import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { createEpicSchema } from "@/lib/validations/workItem";
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

    const epics = await Epic.find({ project: id }).populate("createdBy", "name").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: epics });
  } catch (error) {
    console.error("Get epics error:", error);
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
    const input = createEpicSchema.parse(body);

    await connectDB();

    const epic = await Epic.create({
      ...input,
      project: id,
      createdBy: session.userId,
    });

    const populated = await Epic.findById(epic._id).populate("createdBy", "name").lean();
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: (error as any).errors },
        { status: 400 }
      );
    }
    console.error("Create epic error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
