import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { DEPARTMENT_AAM } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase";
import { scoreSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = scoreSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "All eight scores must be whole numbers from 1 to 10." },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("id, department")
      .eq("id", payload.data.submission_id)
      .single();

    if (submissionError?.code === "PGRST116") {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    if (submissionError) throw submissionError;

    const scoreKeys = [
      "q0_score",
      "q1_score",
      "q2_score",
      "q3_score",
      "q4_score",
      "q5_score",
      "q6_score",
      "q7_score",
    ] as const;
    const rawScore = scoreKeys.reduce((sum, key) => sum + payload.data[key], 0);
    const aam =
      DEPARTMENT_AAM[submission.department as keyof typeof DEPARTMENT_AAM] ?? 0.75;
    const finalScore = rawScore;
    const now = new Date().toISOString();

    const { error: scoreError } = await supabase.from("scores").upsert(
      {
        submission_id: submission.id,
        ...Object.fromEntries(scoreKeys.map((key) => [key, payload.data[key]])),
        raw_score: rawScore,
        aam,
        normalized_score: finalScore,
        updated_at: now,
      },
      { onConflict: "submission_id" },
    );
    if (scoreError) throw scoreError;

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "reviewed",
        reviewed_at: now,
        admin_note: payload.data.admin_note,
      })
      .eq("id", submission.id);
    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      raw_score: rawScore,
      aam,
      normalized_score: finalScore,
    });
  } catch (error) {
    console.error("Save score error:", error);
    return NextResponse.json({ error: "Unable to save this review." }, { status: 500 });
  }
}
