import { z } from "zod";
import { DEPARTMENTS, Q6_OPTIONS, Q7_OPTIONS } from "@/lib/constants";

const requiredText = z.string().trim().min(1).max(5000);
const optionalText = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .nullable()
  .transform((value) => value || null);

export const submissionSchema = z
  .object({
    employee_id: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(200),
    department: z.enum(DEPARTMENTS as [string, ...string[]]),
    role: z.string().trim().min(1).max(200),
    q0_proof: optionalText,
    q1_scale: z.coerce.number().int().min(1).max(10),
    q2_text: requiredText,
    q3_text: requiredText,
    q4_text: requiredText,
    q5_yesno: z.enum(["Yes", "No"]),
    q5_detail: optionalText,
    q6_choice: z.enum(Q6_OPTIONS),
    q7_choice: z.enum(Q7_OPTIONS),
    q8_text: optionalText,
  })
  .superRefine((data, ctx) => {
    if (data.q5_yesno === "Yes" && !data.q5_detail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["q5_detail"],
        message: "Please tell us which tool or feature you tried.",
      });
    }
  });

const scoreValue = z.coerce.number().int().min(1).max(10);

export const scoreSchema = z.object({
  submission_id: z.string().uuid(),
  q0_score: scoreValue,
  q1_score: scoreValue,
  q2_score: scoreValue,
  q3_score: scoreValue,
  q4_score: scoreValue,
  q5_score: scoreValue,
  q6_score: scoreValue,
  q7_score: scoreValue,
  admin_note: optionalText,
});

export const loginSchema = z.object({
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
