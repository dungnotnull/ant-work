import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { updateEpicSchema } from "@/lib/validations/workItem";
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

    const epic = await Epic.findById(id).populate("createdBy", "name").lean();
    if (!epic) {
      return NextResponse.json({ success: false, error: "Epic not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: epic });
  } catch (error) {
    console.error("Get epic error:", error);
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
    const input = updateEpicSchema.parse(body);

    await connectDB();

    const epic = await Epic.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true })
      .populate("createdBy", "name")
      .lean();

    if (!epic) {
      return NextResponse.json({ success: false, error: "Epic not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: epic });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: (error as any).errors },
        { status: 400 }
      );
    }
    console.error("Update epic error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
