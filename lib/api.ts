import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/session";

export async function requireAdmin(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function serverError(message = "Something went wrong. Please try again.") {
  return NextResponse.json({ error: message }, { status: 500 });
}
