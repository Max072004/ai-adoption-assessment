import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { submissionSchema } from "@/lib/validation";

const PROOF_BUCKET = "proofs";
const MAX_PROOF_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_PROOF_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["application/pdf", "pdf"],
]);

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

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getProofFile(formData: FormData) {
  const value = formData.get("q0_file");
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const proofFile = getProofFile(formData);
    const payload = submissionSchema.safeParse({
      employee_id: getTextField(formData, "employee_id"),
      name: getTextField(formData, "name"),
      department: getTextField(formData, "department"),
      role: getTextField(formData, "role"),
      q0_proof: getTextField(formData, "q0_proof"),
      q0_file_url: proofFile ? "pending-upload" : null,
      q1_choice: getTextField(formData, "q1_choice"),
      q2_task_text: getTextField(formData, "q2_task_text"),
      q3_impact_choice: getTextField(formData, "q3_impact_choice"),
      q4_problem_text: getTextField(formData, "q4_problem_text"),
      q5_workflow_choice: getTextField(formData, "q5_workflow_choice"),
      q6_teaching_text: getTextField(formData, "q6_teaching_text"),
      q7_outcome_text: getTextField(formData, "q7_outcome_text"),
      q8_wrong_result_text: getTextField(formData, "q8_wrong_result_text"),
      q9_change_choice: getTextField(formData, "q9_change_choice"),
      q9_change_text: getTextField(formData, "q9_change_text"),
      q10_blocker_choice: getTextField(formData, "q10_blocker_choice"),
    });
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
    if (proofFile) {
      if (!ALLOWED_PROOF_TYPES.has(proofFile.type)) {
        return NextResponse.json(
          { error: "Please upload a PNG, JPG, JPEG, or PDF file for Q0." },
          { status: 400 },
        );
      }
      if (proofFile.size > MAX_PROOF_FILE_SIZE) {
        return NextResponse.json(
          { error: "Please upload a Q0 proof file smaller than 10 MB." },
          { status: 400 },
        );
      }
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

    let q0FileUrl: string | null = null;
    if (proofFile) {
      const extension = ALLOWED_PROOF_TYPES.get(proofFile.type);
      if (!extension) {
        return NextResponse.json(
          { error: "Please upload a PNG, JPG, JPEG, or PDF file for Q0." },
          { status: 400 },
        );
      }
      const path = `${monthYear}/${payload.data.employee_id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(path, proofFile, {
          contentType: proofFile.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from(PROOF_BUCKET)
        .getPublicUrl(path);
      q0FileUrl = publicUrl.publicUrl;
    }

    const { error: insertError } = await supabase.from("submissions").insert({
      ...payload.data,
      q0_file_url: q0FileUrl,
      q1_scale: {
        Daily: 10,
        "A few times a week": 8,
        Weekly: 6,
        "A few times a month": 4,
        "Rarely or never": 1,
      }[payload.data.q1_choice],
      q2_text: payload.data.q2_task_text,
      q3_text: payload.data.q3_impact_choice,
      q4_text: payload.data.q4_problem_text,
      q5_yesno: "Yes",
      q5_detail: payload.data.q6_teaching_text,
      q6_choice: "Try rephrasing/asking differently",
      q7_choice: "Same as before",
      q8_text: payload.data.q8_wrong_result_text,
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
