-- Final objective assessment (Q1-Q20 auto-scored MCQs + Q21/Q22 manual review).
--
-- Additive and safe for the existing production database:
--   * Only adds nullable columns and constraints that existing rows satisfy.
--   * Never drops columns, tables, or rows, and never rewrites historical data.
--   * Legacy Month 1/2/3 rows keep assessment_version = null and continue to use
--     the existing public.scores table.
--
-- Q22 evidence reuses the existing q0_proof (link) and q0_file_url (proofs bucket)
-- columns rather than introducing a second upload mechanism.

alter table public.submissions
  add column if not exists assessment_version text,
  add column if not exists q1_answer text,
  add column if not exists q2_answer text,
  add column if not exists q3_answer text,
  add column if not exists q4_answer text,
  add column if not exists q5_answer text,
  add column if not exists q6_answer text,
  add column if not exists q7_answer text,
  add column if not exists q8_answer text,
  add column if not exists q9_answer text,
  add column if not exists q10_answer text,
  add column if not exists q11_answer text,
  add column if not exists q12_answer text,
  add column if not exists q13_answer text,
  add column if not exists q14_answer text,
  add column if not exists q15_answer text,
  add column if not exists q16_answer text,
  add column if not exists q17_answer text,
  add column if not exists q18_answer text,
  add column if not exists q19_answer text,
  add column if not exists q20_answer text,
  add column if not exists objective_score integer,
  add column if not exists q21_tools text[],
  add column if not exists q21_other_text text,
  add column if not exists q21_manual_score integer,
  add column if not exists q22_manual_score integer,
  add column if not exists final_score integer;

-- The legacy free-text assessments required these columns. Month 2 and Month 3
-- inserted placeholder values to satisfy them; the objective assessment stores
-- nothing there. Relaxing NOT NULL does not touch existing rows.
alter table public.submissions
  alter column q1_scale drop not null,
  alter column q2_text drop not null,
  alter column q3_text drop not null,
  alter column q4_text drop not null,
  alter column q5_yesno drop not null,
  alter column q6_choice drop not null,
  alter column q7_choice drop not null;

alter table public.submissions
  drop constraint if exists submissions_assessment_version_check;
alter table public.submissions
  add constraint submissions_assessment_version_check
  check (assessment_version is null or assessment_version in ('objective_v1'));

alter table public.submissions
  drop constraint if exists submissions_objective_answers_check;
alter table public.submissions
  add constraint submissions_objective_answers_check
  check (
    (q1_answer is null or q1_answer in ('A', 'B', 'C', 'D'))
    and (q2_answer is null or q2_answer in ('A', 'B', 'C', 'D'))
    and (q3_answer is null or q3_answer in ('A', 'B', 'C', 'D'))
    and (q4_answer is null or q4_answer in ('A', 'B', 'C', 'D'))
    and (q5_answer is null or q5_answer in ('A', 'B', 'C', 'D'))
    and (q6_answer is null or q6_answer in ('A', 'B', 'C', 'D'))
    and (q7_answer is null or q7_answer in ('A', 'B', 'C', 'D'))
    and (q8_answer is null or q8_answer in ('A', 'B', 'C', 'D'))
    and (q9_answer is null or q9_answer in ('A', 'B', 'C', 'D'))
    and (q10_answer is null or q10_answer in ('A', 'B', 'C', 'D'))
    and (q11_answer is null or q11_answer in ('A', 'B', 'C', 'D'))
    and (q12_answer is null or q12_answer in ('A', 'B', 'C', 'D'))
    and (q13_answer is null or q13_answer in ('A', 'B', 'C', 'D'))
    and (q14_answer is null or q14_answer in ('A', 'B', 'C', 'D'))
    and (q15_answer is null or q15_answer in ('A', 'B', 'C', 'D'))
    and (q16_answer is null or q16_answer in ('A', 'B', 'C', 'D'))
    and (q17_answer is null or q17_answer in ('A', 'B', 'C', 'D'))
    and (q18_answer is null or q18_answer in ('A', 'B', 'C', 'D'))
    and (q19_answer is null or q19_answer in ('A', 'B', 'C', 'D'))
    and (q20_answer is null or q20_answer in ('A', 'B', 'C', 'D'))
  );

-- Objective: 20 questions x 2 marks. Manual: the established 1-10 scale per
-- question (same as public.scores). Final = objective + q21 + q22 (max 60).
alter table public.submissions
  drop constraint if exists submissions_objective_score_check;
alter table public.submissions
  add constraint submissions_objective_score_check
  check (objective_score is null or objective_score between 0 and 40);

alter table public.submissions
  drop constraint if exists submissions_q21_manual_score_check;
alter table public.submissions
  add constraint submissions_q21_manual_score_check
  check (q21_manual_score is null or q21_manual_score between 1 and 10);

alter table public.submissions
  drop constraint if exists submissions_q22_manual_score_check;
alter table public.submissions
  add constraint submissions_q22_manual_score_check
  check (q22_manual_score is null or q22_manual_score between 1 and 10);

alter table public.submissions
  drop constraint if exists submissions_final_score_check;
alter table public.submissions
  add constraint submissions_final_score_check
  check (final_score is null or final_score between 0 and 60);

create index if not exists submissions_assessment_version_idx
  on public.submissions (assessment_version);

-- The app inserts through the service role, but keep the public insert policy
-- from ever setting server-computed or admin-only scoring fields.
drop policy if exists "Public can create submissions" on public.submissions;
create policy "Public can create submissions"
  on public.submissions
  for insert
  to anon
  with check (
    status = 'pending'
    and admin_note is null
    and reviewed_at is null
    and objective_score is null
    and q21_manual_score is null
    and q22_manual_score is null
    and final_score is null
  );
