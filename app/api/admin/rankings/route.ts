import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { createServiceClient } from "@/lib/supabase";
import type { Ranking } from "@/lib/types";
import { monthSchema } from "@/lib/validation";

type RankingRow = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  role: string;
  scores:
    | {
        raw_score: number | string | null;
        aam: number | string;
        normalized_score: number | string | null;
      }
    | {
        raw_score: number | string | null;
        aam: number | string;
        normalized_score: number | string | null;
      }[]
    | null;
};

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
            "id, employee_id, name, department, role, scores!inner(raw_score, aam, normalized_score)",
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
    const ranked = rows
      .map((row) => {
        const score = Array.isArray(row.scores) ? row.scores[0] : row.scores;
        return {
          id: row.id,
          employee_id: row.employee_id,
          name: row.name,
          department: row.department,
          role: row.role,
          raw_score: Number(score?.raw_score ?? 0),
          aam: Number(score?.aam ?? 0),
          normalized_score: Number(score?.normalized_score ?? 0),
        };
      })
      .sort((left, right) => right.normalized_score - left.normalized_score);

    const flagStart = Math.max(0, ranked.length - 5);
    const rankings: Ranking[] = ranked.map((row, index) => ({
      ...row,
      rank: index + 1,
      flagged: index >= flagStart,
    }));
    const months = Array.from(
      new Set((monthRows ?? []).map((row) => row.month_year as string)),
    );

    return NextResponse.json({ rankings, months });
  } catch (error) {
    console.error("Rankings error:", error);
    return NextResponse.json({ error: "Unable to load rankings." }, { status: 500 });
  }
}
