import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import {
  FINAL_MAX_SCORE,
  LEGACY_FLAG_THRESHOLD,
  LEGACY_MAX_SCORE,
  OBJECTIVE_ASSESSMENT_VERSION,
  OBJECTIVE_FLAG_THRESHOLD,
} from "@/lib/assessment";
import { createServiceClient } from "@/lib/supabase";
import type { AssessmentVersion, Ranking } from "@/lib/types";
import { monthSchema } from "@/lib/validation";

type ScoreRow = { raw_score: number | string | null };

type RankingRow = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  role: string;
  month_year: string;
  assessment_version: AssessmentVersion | null;
  objective_score: number | null;
  q21_manual_score: number | null;
  q22_manual_score: number | null;
  final_score: number | null;
  q21_tools: string[] | null;
  q21_other_text: string | null;
  q0_proof: string | null;
  q0_file_url: string | null;
  scores: ScoreRow | ScoreRow[] | null;
};

type Unranked = Omit<Ranking, "rank">;

/**
 * Builds one ranking row per reviewed submission, using the scoring model that
 * matches the submission. Returns null when the submission has not completed
 * its scoring workflow (legacy rows without a scores record, objective rows
 * whose manual Q21/Q22 review has not been saved).
 */
function toRankingRow(row: RankingRow): Unranked | null {
  const base = {
    id: row.id,
    employee_id: row.employee_id,
    name: row.name,
    department: row.department,
    role: row.role,
    month_year: row.month_year,
    assessment_version: row.assessment_version,
  };

  if (row.assessment_version === OBJECTIVE_ASSESSMENT_VERSION) {
    if (
      row.final_score == null ||
      row.objective_score == null ||
      row.q21_manual_score == null ||
      row.q22_manual_score == null
    ) {
      return null;
    }
    const finalScore = Number(row.final_score);
    return {
      ...base,
      scoring_model: "objective",
      raw_score: finalScore,
      final_score: finalScore,
      max_score: FINAL_MAX_SCORE,
      flagged: finalScore < OBJECTIVE_FLAG_THRESHOLD,
      objective_score: Number(row.objective_score),
      q21_manual_score: Number(row.q21_manual_score),
      q22_manual_score: Number(row.q22_manual_score),
      q21_tools: row.q21_tools,
      q21_other_text: row.q21_other_text,
      q22_evidence_link: row.q0_proof,
      q22_evidence_file: row.q0_file_url,
    };
  }

  // Legacy Month 1/2/3: final score is the raw sum of eight manual scores (/80).
  const score = Array.isArray(row.scores) ? row.scores[0] : row.scores;
  if (!score || score.raw_score == null) return null;
  const finalScore = Number(score.raw_score);
  return {
    ...base,
    scoring_model: "legacy",
    raw_score: finalScore,
    final_score: finalScore,
    max_score: LEGACY_MAX_SCORE,
    flagged: finalScore < LEGACY_FLAG_THRESHOLD,
    objective_score: null,
    q21_manual_score: null,
    q22_manual_score: null,
    q21_tools: null,
    q21_other_text: null,
    q22_evidence_link: null,
    q22_evidence_file: null,
  };
}

function rankWithinModel(rows: Unranked[]): Ranking[] {
  return rows
    .sort((left, right) => right.final_score - left.final_score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const month = new URL(request.url).searchParams.get("month");
    if (!month || !monthSchema.safeParse(month).success) {
      return NextResponse.json({ error: "A valid month is required." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const [{ data, error }, { data: monthRows, error: monthsError }] =
      await Promise.all([
        supabase
          .from("submissions")
          .select(
            "id, employee_id, name, department, role, month_year, assessment_version, objective_score, q21_manual_score, q22_manual_score, final_score, q21_tools, q21_other_text, q0_proof, q0_file_url, scores(raw_score)",
          )
          .eq("month_year", month)
          .eq("status", "reviewed"),
        supabase
          .from("submissions")
          .select("month_year")
          .order("month_year", { ascending: false }),
      ]);

    if (error) throw error;
    if (monthsError) throw monthsError;

    const rows = (data ?? []) as unknown as RankingRow[];
    const scored = rows
      .map(toRankingRow)
      .filter((row): row is Unranked => row !== null);

    // Scores from different models are never compared against each other.
    // Each model is ranked independently; objective (current) rows come first.
    const rankings: Ranking[] = [
      ...rankWithinModel(scored.filter((row) => row.scoring_model === "objective")),
      ...rankWithinModel(scored.filter((row) => row.scoring_model === "legacy")),
    ];
    const months = Array.from(
      new Set((monthRows ?? []).map((row) => row.month_year as string)),
    );

    return NextResponse.json({ rankings, months });
  } catch (error) {
    console.error("Rankings error:", error);
    return NextResponse.json({ error: "Unable to load rankings." }, { status: 500 });
  }
}
