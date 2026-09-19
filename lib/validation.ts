import { z } from "zod";
import {
  ANSWER_LETTERS,
  MANUAL_SCORE_MAX,
  MANUAL_SCORE_MIN,
  OBJECTIVE_QUESTION_IDS,
  Q21_OTHER_OPTION,
  Q21_TOOL_OPTIONS,
  type ObjectiveQuestionId,
} from "@/lib/assessment";
import { ACTIVE_DEPARTMENTS } from "@/lib/constants";

const optionalText = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .nullable()
  .transform((value) => value || null);

const answerLetter = z.enum(ANSWER_LETTERS, {
  errorMap: () => ({ message: "Please answer every question from Q1 to Q20." }),
});

// Q1-Q20: every question is required and accepts exactly one letter.
const objectiveAnswersShape = Object.fromEntries(
  OBJECTIVE_QUESTION_IDS.map((id) => [id, answerLetter]),
) as Record<ObjectiveQuestionId, typeof answerLetter>;

export const objectiveSubmissionSchema = z
  .object({
    employee_id: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(200),
    department: z.enum(ACTIVE_DEPARTMENTS as [string, ...string[]], {
      errorMap: () => ({ message: "Please select a valid department." }),
    }),
    role: z.string().trim().min(1).max(200),
    answers: z.object(objectiveAnswersShape),
    q21_tools: z
      .array(
        z.enum(Q21_TOOL_OPTIONS, {
          errorMap: () => ({ message: "Please choose AI tools from the list." }),
        }),
      )
      .min(1, "Please select at least one AI tool for Q21.")
      .transform((tools) => Array.from(new Set(tools))),
    q21_other_text: optionalText,
    q22_evidence_link: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .nullable()
      .transform((value) => value || null)
      .refine(
        (value) => value === null || /^https?:\/\/\S+$/i.test(value),
        "Please enter a valid link (starting with http:// or https://) for Q22.",
      ),
    q22_has_file: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.q21_tools.includes(Q21_OTHER_OPTION) && !data.q21_other_text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["q21_other_text"],
        message: "Please tell us which other AI tool(s) you used or explored.",
      });
    }
    if (!data.q22_evidence_link && !data.q22_has_file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["q22_evidence_link"],
        message: "Please share a link or upload a file as evidence for Q22.",
      });
    }
  });

export type ObjectiveSubmissionInput = z.infer<typeof objectiveSubmissionSchema>;

// Legacy manual scoring (Month 1/2/3): eight integer scores from 1 to 10.
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

// Objective assessment manual review: Q21 and Q22 on the same 1-10 scale.
const manualScoreValue = z.coerce
  .number()
  .int()
  .min(MANUAL_SCORE_MIN)
  .max(MANUAL_SCORE_MAX);

export const objectiveReviewSchema = z.object({
  submission_id: z.string().uuid(),
  q21_manual_score: manualScoreValue,
  q22_manual_score: manualScoreValue,
  admin_note: optionalText,
});

export const loginSchema = z.object({
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
