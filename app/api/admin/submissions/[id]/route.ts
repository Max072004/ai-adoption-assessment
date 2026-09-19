import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import {
  answerColumn,
  OBJECTIVE_ASSESSMENT_VERSION,
  OBJECTIVE_QUESTION_IDS,
} from "@/lib/assessment";
import { scoreObjectiveAnswers } from "@/lib/assessment-scoring";
import { createServiceClient } from "@/lib/supabase";
import type { ObjectiveBreakdown, SubmissionDetail } from "@/lib/types";

/**
 * Admin-only per-question breakdown for objective submissions. Computed here
 * (behind the admin session) so the answer key never reaches the client.
 */
function buildObjectiveBreakdown(submission: SubmissionDetail): ObjectiveBreakdown {
  const answers = Object.fromEntries(
    OBJECTIVE_QUESTION_IDS.map((id) => [id, submission[answerColumn(id)] ?? null]),
  ) as Parameters<typeof scoreObjectiveAnswers>[0];
  const { results } = scoreObjectiveAnswers(answers);
  return Object.fromEntries(
    OBJECTIVE_QUESTION_IDS.map((id) => [
      id,
      { answer: answers[id], correct: results[id] },
    ]),
  ) as ObjectiveBreakdown;
}

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
      .single<SubmissionDetail>();

    if (error?.code === "PGRST116") {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    if (error) throw error;

    const submission: SubmissionDetail =
      data.assessment_version === OBJECTIVE_ASSESSMENT_VERSION
        ? { ...data, objective_breakdown: buildObjectiveBreakdown(data) }
        : data;

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Submission detail error:", error);
    return NextResponse.json(
      { error: "Unable to load this submission." },
      { status: 500 },
    );
  }
}
