-- October 2026 assessment (objective_v2).
--
-- The questions changed but the storage shape did not: answers still live in
-- q1_answer..q20_answer and scores in objective_score / q21_manual_score /
-- q22_manual_score / final_score. The only schema change needed is widening
-- the assessment_version CHECK constraint so new rows can be inserted.
--
-- Additive and safe: no columns, rows or historical data are touched, and
-- every existing row already satisfies the new constraint.

alter table public.submissions
  drop constraint if exists submissions_assessment_version_check;
alter table public.submissions
  add constraint submissions_assessment_version_check
  check (
    assessment_version is null
    or assessment_version in ('objective_v1', 'objective_v2')
  );
