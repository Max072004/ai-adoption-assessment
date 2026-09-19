import { NextResponse } from "next/server";
import {
  answerColumn,
  OBJECTIVE_ASSESSMENT_VERSION,
  OBJECTIVE_QUESTION_IDS,
} from "@/lib/assessment";
import { scoreObjectiveAnswers } from "@/lib/assessment-scoring";
import { createServiceClient } from "@/lib/supabase";
import { objectiveSubmissionSchema } from "@/lib/validation";

// Q22 evidence reuses the existing proof upload infrastructure (Q0 columns +
// "proofs" storage bucket) introduced in migration 002.
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

function getTextList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string");
}

function getEvidenceFile(formData: FormData) {
  const value = formData.get("q22_evidence_file");
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

function duplicateResponse(monthYear: string) {
  return NextResponse.json(
    {
      error: `You've already submitted your response for ${displayMonth(monthYear)}. Thank you!`,
    },
    { status: 409 },
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const evidenceFile = getEvidenceFile(formData);

    const payload = objectiveSubmissionSchema.safeParse({
      employee_id: getTextField(formData, "employee_id"),
      name: getTextField(formData, "name"),
      department: getTextField(formData, "department"),
      role: getTextField(formData, "role"),
      answers: Object.fromEntries(
        OBJECTIVE_QUESTION_IDS.map((id) => [id, getTextField(formData, id)]),
      ),
      q21_tools: getTextList(formData, "q21_tools"),
      q21_other_text: getTextField(formData, "q21_other_text"),
      q22_evidence_link: getTextField(formData, "q22_evidence_link"),
      q22_has_file: Boolean(evidenceFile),
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

    if (evidenceFile) {
      if (!ALLOWED_PROOF_TYPES.has(evidenceFile.type)) {
        return NextResponse.json(
          { error: "Please upload a PNG, JPG, JPEG, or PDF file for Q22." },
          { status: 400 },
        );
      }
      if (evidenceFile.size > MAX_PROOF_FILE_SIZE) {
        return NextResponse.json(
          { error: "Please upload a Q22 evidence file smaller than 10 MB." },
          { status: 400 },
        );
      }
    }

    const { data } = payload;
    // Drop the "Other" text when "Other" was not selected.
    const q21OtherText = data.q21_tools.includes("Other") ? data.q21_other_text : null;

    const supabase = createServiceClient();
    const monthYear = currentMonthYear();
    const { data: existing, error: lookupError } = await supabase
      .from("submissions")
      .select("id")
      .eq("employee_id", data.employee_id)
      .eq("month_year", monthYear)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) return duplicateResponse(monthYear);

    let evidenceFileUrl: string | null = null;
    if (evidenceFile) {
      const extension = ALLOWED_PROOF_TYPES.get(evidenceFile.type)!;
      const path = `${monthYear}/${data.employee_id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(path, evidenceFile, {
          contentType: evidenceFile.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from(PROOF_BUCKET)
        .getPublicUrl(path);
      evidenceFileUrl = publicUrl.publicUrl;
    }

    // Objective score is computed here against the server-side answer key.
    const objective = scoreObjectiveAnswers(data.answers);
    const answerColumns = Object.fromEntries(
      OBJECTIVE_QUESTION_IDS.map((id) => [answerColumn(id), data.answers[id]]),
    );

    const { error: insertError } = await supabase.from("submissions").insert({
      employee_id: data.employee_id,
      name: data.name,
      department: data.department,
      role: data.role,
      month_year: monthYear,
      assessment_version: OBJECTIVE_ASSESSMENT_VERSION,
      ...answerColumns,
      objective_score: objective.score,
      q21_tools: data.q21_tools,
      q21_other_text: q21OtherText,
      q0_proof: data.q22_evidence_link,
      q0_file_url: evidenceFileUrl,
      status: "pending",
    });

    if (insertError) {
      if (insertError.code === "23505") return duplicateResponse(monthYear);
      throw insertError;
    }

    // Employees only ever receive a confirmation. Never return scores,
    // correctness, or the answer key here.
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "We could not submit your response. Please try again." },
      { status: 500 },
    );
  }
}
