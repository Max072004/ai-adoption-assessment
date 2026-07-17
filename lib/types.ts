export type Submission = {
  id: string;
  employee_id: string;
  name: string;
  department: string;
  role: string;
  month_year: string;
  q0_proof: string | null;
  q0_file_url: string | null;
  q1_scale: number;
  q2_text: string;
  q3_text: string;
  q4_text: string;
  q5_yesno: "Yes" | "No";
  q5_detail: string | null;
  q6_choice: string;
  q7_choice: string;
  q8_text: string | null;
  status: "pending" | "reviewed";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

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

export type SubmissionDetail = Submission & {
  scores: Score | Score[] | null;
};

export type Ranking = Pick<
  Submission,
  "id" | "employee_id" | "name" | "department" | "role"
> & {
  raw_score: number;
  final_score: number;
  rank: number;
  flagged: boolean;
};
