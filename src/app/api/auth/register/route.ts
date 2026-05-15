import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/mongodb";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(input.password);

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: "Member",
    });

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
