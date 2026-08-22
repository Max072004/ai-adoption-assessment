import { z } from "zod";
import {
  DEPARTMENTS,
  Q10_SUPPORT_OPTIONS,
  Q4_INTEGRATION_OPTIONS,
  Q6_SKILL_OPTIONS,
  Q7_SHARING_OPTIONS,
  Q9_CHALLENGE_OPTIONS,
} from "@/lib/constants";

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
    q0_file_url: optionalText,
    q1_technology_text: requiredText,
    q2_use_case_text: requiredText,
    q3_problem_solving_text: requiredText,
    q4_integration_choice: z.enum(Q4_INTEGRATION_OPTIONS),
    q4_integration_text: optionalText,
    q5_judgment_text: requiredText,
    q6_skill_choice: z.enum(Q6_SKILL_OPTIONS),
    q6_skill_example_text: requiredText,
    q7_sharing_choice: z.enum(Q7_SHARING_OPTIONS),
    q7_sharing_text: optionalText,
    q8_future_opportunity_text: requiredText,
    q9_challenge_choice: z.enum(Q9_CHALLENGE_OPTIONS),
    q9_challenge_text: optionalText,
    q10_support_choice: z.enum(Q10_SUPPORT_OPTIONS),
    q10_support_text: optionalText,
  })
  .superRefine((data, ctx) => {
    if (!data.q0_proof && !data.q0_file_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["q0_proof"],
        message: "Please provide a Q0 proof link or upload a proof file.",
      });
    }
    if (data.q4_integration_choice === "Yes" && !data.q4_integration_text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["q4_integration_text"],
        message: "Please explain what you combined and what you achieved.",
      });
    }
    if (data.q7_sharing_choice === "Yes" && !data.q7_sharing_text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["q7_sharing_text"],
        message: "Please explain what you shared and how it could help them.",
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
