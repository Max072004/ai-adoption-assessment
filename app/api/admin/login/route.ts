import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createSessionToken } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function POST(request: Request) {
  try {
    const payload = loginSchema.safeParse(await request.json());
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!payload.success || !expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const valid =
      safeEqual(payload.data.username, expectedUsername) &&
      safeEqual(payload.data.password, expectedPassword);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(payload.data.username);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}
