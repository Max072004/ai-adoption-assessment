import { z } from "zod";
import {
  DEPARTMENTS,
  Q10_BLOCKER_OPTIONS,
  Q1_FREQUENCY_OPTIONS,
  Q3_IMPACT_OPTIONS,
  Q5_WORKFLOW_OPTIONS,
  Q9_CHANGE_OPTIONS,
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
    q1_choice: z.enum(Q1_FREQUENCY_OPTIONS),
    q2_task_text: requiredText,
    q3_impact_choice: z.enum(Q3_IMPACT_OPTIONS),
    q4_problem_text: requiredText,
    q5_workflow_choice: z.enum(Q5_WORKFLOW_OPTIONS),
    q6_teaching_text: requiredText,
    q7_outcome_text: requiredText,
    q8_wrong_result_text: requiredText,
    q9_change_choice: z.enum(Q9_CHANGE_OPTIONS),
    q9_change_text: optionalText,
    q10_blocker_choice: z.enum(Q10_BLOCKER_OPTIONS),
  })
  .superRefine((data, ctx) => {
    if (!data.q0_proof && !data.q0_file_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["q0_proof"],
        message: "Please provide a Q0 proof link or upload a proof file.",
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
