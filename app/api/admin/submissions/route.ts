import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { DEPARTMENTS } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase";
import { monthSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const department = url.searchParams.get("department");

    if (!month || !monthSchema.safeParse(month).success) {
      return NextResponse.json({ error: "A valid month is required." }, { status: 400 });
    }
    if (department && !DEPARTMENTS.includes(department)) {
      return NextResponse.json({ error: "Invalid department." }, { status: 400 });
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("submissions")
      .select(
        "id, employee_id, name, department, role, month_year, status, created_at",
      )
      .eq("month_year", month)
      .order("created_at", { ascending: false });

    if (department) query = query.eq("department", department);

    const [{ data: submissions, error }, { data: monthRows, error: monthsError }] =
      await Promise.all([
        query,
        supabase
          .from("submissions")
          .select("month_year")
          .order("month_year", { ascending: false }),
      ]);

    if (error) throw error;
    if (monthsError) throw monthsError;

    const months = Array.from(
      new Set((monthRows ?? []).map((row) => row.month_year as string)),
    );

    return NextResponse.json({ submissions: submissions ?? [], months });
  } catch (error) {
    console.error("List submissions error:", error);
    return NextResponse.json(
      { error: "Unable to load submissions." },
      { status: 500 },
    );
  }
}
