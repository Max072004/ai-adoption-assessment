create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null,
  name text not null,
  department text not null,
  role text not null,
  month_year text not null check (month_year ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  q0_proof text,
  q1_scale integer not null check (q1_scale between 1 and 10),
  q2_text text not null,
  q3_text text not null,
  q4_text text not null,
  q5_yesno text not null check (q5_yesno in ('Yes', 'No')),
  q5_detail text,
  q6_choice text not null check (
    q6_choice in (
      'Give up and do it manually',
      'Try rephrasing/asking differently',
      'Try a different AI tool',
      'Look up how others solved similar problems'
    )
  ),
  q7_choice text not null check (
    q7_choice in (
      'Got worse / forgot how to use it',
      'Same as before',
      'Slightly better',
      'Significantly better'
    )
  ),
  q8_text text,
  status text not null default 'pending' check (status in ('pending', 'reviewed')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint submissions_employee_month_unique unique (employee_id, month_year)
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  q0_score integer check (q0_score between 1 and 10),
  q1_score integer check (q1_score between 1 and 10),
  q2_score integer check (q2_score between 1 and 10),
  q3_score integer check (q3_score between 1 and 10),
  q4_score integer check (q4_score between 1 and 10),
  q5_score integer check (q5_score between 1 and 10),
  q6_score integer check (q6_score between 1 and 10),
  q7_score integer check (q7_score between 1 and 10),
  raw_score numeric check (raw_score between 8 and 80),
  aam numeric not null check (aam > 0),
  normalized_score numeric check (normalized_score >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists submissions_month_year_idx
  on public.submissions (month_year);

create index if not exists submissions_month_status_idx
  on public.submissions (month_year, status);

create index if not exists submissions_department_idx
  on public.submissions (department);

alter table public.submissions enable row level security;
alter table public.scores enable row level security;

drop policy if exists "Public can create submissions" on public.submissions;
create policy "Public can create submissions"
  on public.submissions
  for insert
  to anon
  with check (
    status = 'pending'
    and admin_note is null
    and reviewed_at is null
  );

-- No SELECT, UPDATE, or DELETE policies are created for submissions.
-- No public policies are created for scores. The service role bypasses RLS.

grant usage on schema public to anon, authenticated;
grant insert on public.submissions to anon;
revoke select, update, delete on public.submissions from anon;
revoke all on public.scores from anon, authenticated;
