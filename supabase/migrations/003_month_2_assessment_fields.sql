alter table public.submissions
  add column if not exists q1_choice text,
  add column if not exists q2_task_text text,
  add column if not exists q3_impact_choice text,
  add column if not exists q4_problem_text text,
  add column if not exists q5_workflow_choice text,
  add column if not exists q6_teaching_text text,
  add column if not exists q7_outcome_text text,
  add column if not exists q8_wrong_result_text text,
  add column if not exists q9_change_choice text,
  add column if not exists q9_change_text text,
  add column if not exists q10_blocker_choice text;
