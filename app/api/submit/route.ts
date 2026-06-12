import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { submissionSchema } from "@/lib/validation";

function currentMonthYear() {
  return new Date().toISOString().slice(0, 7);
}

function displayMonth(monthYear: string) {
  const [year, month] = monthYear.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export async function POST(request: Request) {
  try {
    const payload = submissionSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        {
          error:
            payload.error.issues[0]?.message ??
            "Please check the form and complete all required fields.",
        },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const monthYear = currentMonthYear();
    const { data: existing, error: lookupError } = await supabase
      .from("submissions")
      .select("id")
      .eq("employee_id", payload.data.employee_id)
      .eq("month_year", monthYear)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing) {
      return NextResponse.json(
        {
          error: `You've already submitted your response for ${displayMonth(monthYear)}. Thank you!`,
        },
        { status: 409 },
      );
    }

    const { error: insertError } = await supabase.from("submissions").insert({
      ...payload.data,
      q5_detail: payload.data.q5_yesno === "Yes" ? payload.data.q5_detail : null,
      month_year: monthYear,
      status: "pending",
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error: `You've already submitted your response for ${displayMonth(monthYear)}. Thank you!`,
          },
          { status: 409 },
        );
      }
      throw insertError;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "We could not submit your response. Please try again." },
      { status: 500 },
    );
  }
}
