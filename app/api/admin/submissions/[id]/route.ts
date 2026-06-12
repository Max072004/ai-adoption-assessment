import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid submission ID." }, { status: 400 });
    }

    const { data, error } = await createServiceClient()
      .from("submissions")
      .select("*, scores(*)")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    if (error) throw error;

    return NextResponse.json({ submission: data });
  } catch (error) {
    console.error("Submission detail error:", error);
    return NextResponse.json(
      { error: "Unable to load this submission." },
      { status: 500 },
    );
  }
}
