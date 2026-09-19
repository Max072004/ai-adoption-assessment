import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { OBJECTIVE_ASSESSMENT_VERSION } from "@/lib/assessment";
import { DEPARTMENT_AAM } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase";
import { objectiveReviewSchema, scoreSchema } from "@/lib/validation";

type SubmissionRow = {
  id: string;
  department: string;
  assessment_version: string | null;
  objective_score: number | null;
};

export async function POST(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body: unknown = await request.json();
    const submissionId = z
      .object({ submission_id: z.string().uuid() })
      .safeParse(body);
    if (!submissionId.success) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    const supabase = createServiceClient();
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("id, department, assessment_version, objective_score")
      .eq("id", submissionId.data.submission_id)
      .single<SubmissionRow>();

    if (submissionError?.code === "PGRST116") {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    if (submissionError) throw submissionError;

    if (submission.assessment_version === OBJECTIVE_ASSESSMENT_VERSION) {
      return saveObjectiveReview(supabase, submission, body);
    }
    return saveLegacyReview(supabase, submission, body);
  } catch (error) {
    console.error("Save score error:", error);
    return NextResponse.json({ error: "Unable to save this review." }, { status: 500 });
  }
}

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * Objective assessment (assessment_version = "objective_v1").
 * Q1-Q20 were scored at submission time; admin supplies Q21/Q22 (1-10 each).
 * final_score = objective_score + q21_manual_score + q22_manual_score.
 */
async function saveObjectiveReview(
  supabase: ServiceClient,
  submission: SubmissionRow,
  body: unknown,
) {
  const payload = objectiveReviewSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json(
      { error: "Q21 and Q22 scores must be whole numbers from 1 to 10." },
      { status: 400 },
    );
  }
  if (submission.objective_score == null) {
    return NextResponse.json(
      { error: "This submission has no objective score and cannot be reviewed." },
      { status: 409 },
    );
  }

  const finalScore =
    submission.objective_score +
    payload.data.q21_manual_score +
    payload.data.q22_manual_score;
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("submissions")
    .update({
      q21_manual_score: payload.data.q21_manual_score,
      q22_manual_score: payload.data.q22_manual_score,
      final_score: finalScore,
      status: "reviewed",
      reviewed_at: now,
      admin_note: payload.data.admin_note,
    })
    .eq("id", submission.id);
  if (updateError) throw updateError;

  return NextResponse.json({
    success: true,
    objective_score: submission.objective_score,
    q21_manual_score: payload.data.q21_manual_score,
    q22_manual_score: payload.data.q22_manual_score,
    final_score: finalScore,
  });
}

/** Legacy Month 1/2/3 review: eight manual scores stored in public.scores. */
async function saveLegacyReview(
  supabase: ServiceClient,
  submission: SubmissionRow,
  body: unknown,
) {
  const payload = scoreSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json(
      { error: "All eight scores must be whole numbers from 1 to 10." },
      { status: 400 },
    );
  }

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
}
