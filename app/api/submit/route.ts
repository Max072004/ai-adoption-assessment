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
      q0_file_url: null,
      q1_scale: getTextField(formData, "q1_scale"),
      q2_text: getTextField(formData, "q2_text"),
      q3_text: getTextField(formData, "q3_text"),
      q4_text: getTextField(formData, "q4_text"),
      q5_yesno: getTextField(formData, "q5_yesno"),
      q5_detail: getTextField(formData, "q5_detail"),
      q6_choice: getTextField(formData, "q6_choice"),
      q7_choice: getTextField(formData, "q7_choice"),
      q8_text: getTextField(formData, "q8_text"),
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
