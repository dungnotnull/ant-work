import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Comment from "@/models/Comment";

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

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

    const comments = await Comment.find({ task: id })
      .populate("user", "name email")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("Get comments error:", error);
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
    const input = createCommentSchema.parse(body);

    await connectDB();

    const comment = await Comment.create({
      task: id,
      user: session.userId,
      content: input.content,
    });

    const populated = await comment.populate("user", "name email");

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    console.error("Create comment error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
