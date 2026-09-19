import type {
  AnswerLetter,
  OBJECTIVE_ASSESSMENT_VERSION,
  ObjectiveAnswerColumn,
  ObjectiveQuestionId,
} from "@/lib/assessment";

export type AssessmentVersion = typeof OBJECTIVE_ASSESSMENT_VERSION;

/** Q1-Q20 selected letters, keyed by database column (q1_answer ... q20_answer). */
export type ObjectiveAnswerColumns = Record<ObjectiveAnswerColumn, AnswerLetter | null>;

export type Submission = ObjectiveAnswerColumns & {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  role: string;
  month_year: string;
  /** null for legacy Month 1/2/3 rows; "objective_v1" for the final assessment. */
  assessment_version: AssessmentVersion | null;
  /** Q0 (legacy) / Q22 (objective) evidence link and uploaded proof. */
  q0_proof: string | null;
  q0_file_url: string | null;
  // Objective assessment scoring (assessment_version = "objective_v1").
  objective_score: number | null;
  q21_tools: string[] | null;
  q21_other_text: string | null;
  q21_manual_score: number | null;
  q22_manual_score: number | null;
  final_score: number | null;
  // Month 2 fields.
  q1_choice: string | null;
  q2_task_text: string | null;
  q3_impact_choice: string | null;
  q4_problem_text: string | null;
  q5_workflow_choice: string | null;
  q6_teaching_text: string | null;
  q7_outcome_text: string | null;
  q8_wrong_result_text: string | null;
  q9_change_choice: string | null;
  q9_change_text: string | null;
  q10_blocker_choice: string | null;
  // Month 3 fields.
  q1_technology_text: string | null;
  q2_use_case_text: string | null;
  q3_problem_solving_text: string | null;
  q4_integration_choice: "Yes" | "No" | null;
  q4_integration_text: string | null;
  q5_judgment_text: string | null;
  q6_skill_choice: string | null;
  q6_skill_example_text: string | null;
  q7_sharing_choice: "Yes" | "No" | null;
  q7_sharing_text: string | null;
  q8_future_opportunity_text: string | null;
  q9_challenge_choice: string | null;
  q9_challenge_text: string | null;
  q10_support_choice: string | null;
  q10_support_text: string | null;
  // Month 1 fields (nullable since migration 005; always populated on legacy rows).
  q1_scale: number | null;
  q2_text: string | null;
  q3_text: string | null;
  q4_text: string | null;
  q5_yesno: "Yes" | "No" | null;
  q5_detail: string | null;
  q6_choice: string | null;
  q7_choice: string | null;
  q8_text: string | null;
  status: "pending" | "reviewed";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

/** Legacy manual scores (public.scores). Not used by the objective assessment. */
export type Score = {
  q0_score: number | null;
  q1_score: number | null;
  q2_score: number | null;
  q3_score: number | null;
  q4_score: number | null;
  q5_score: number | null;
  q6_score: number | null;
  q7_score: number | null;
  raw_score: number | null;
  aam: number;
  normalized_score: number | null;
};

/** Admin-only Q1-Q20 breakdown computed server-side from the answer key. */
export type ObjectiveBreakdown = Record<
  ObjectiveQuestionId,
  { answer: AnswerLetter | null; correct: boolean }
>;

export type SubmissionDetail = Submission & {
  scores: Score | Score[] | null;
  objective_breakdown?: ObjectiveBreakdown | null;
};

export type ScoringModel = "legacy" | "objective";

export type Ranking = Pick<
  Submission,
  "id" | "employee_id" | "name" | "department" | "role" | "month_year"
> & {
  scoring_model: ScoringModel;
  assessment_version: AssessmentVersion | null;
  raw_score: number;
  final_score: number;
  max_score: number;
  rank: number;
  flagged: boolean;
  // Objective-model details (null for legacy rows).
  objective_score: number | null;
  q21_manual_score: number | null;
  q22_manual_score: number | null;
  q21_tools: string[] | null;
  q21_other_text: string | null;
  q22_evidence_link: string | null;
  q22_evidence_file: string | null;
};
