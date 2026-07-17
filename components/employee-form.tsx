"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Q10_BLOCKER_OPTIONS,
  Q1_FREQUENCY_OPTIONS,
  Q3_IMPACT_OPTIONS,
  Q5_WORKFLOW_OPTIONS,
  Q9_CHANGE_OPTIONS,
} from "@/lib/constants";

type FormState = {
  employee_id: string;
  name: string;
  department: string;
  role: string;
  q0_proof: string;
  q1_choice: string;
  q2_task_text: string;
  q3_impact_choice: string;
  q4_problem_text: string;
  q5_workflow_choice: string;
  q6_teaching_text: string;
  q7_outcome_text: string;
  q8_wrong_result_text: string;
  q9_change_choice: string;
  q9_change_text: string;
  q10_blocker_choice: string;
};

const initialState: FormState = {
  employee_id: "",
  name: "",
  department: "",
  role: "",
  q0_proof: "",
  q1_choice: "",
  q2_task_text: "",
  q3_impact_choice: "",
  q4_problem_text: "",
  q5_workflow_choice: "",
  q6_teaching_text: "",
  q7_outcome_text: "",
  q8_wrong_result_text: "",
  q9_change_choice: "",
  q9_change_text: "",
  q10_blocker_choice: "",
};

const SECTIONS = [
  { id: "details", number: "01", title: "Your Details", short: "Details" },
  { id: "usage", number: "02", title: "Usage Snapshot", short: "Usage" },
  {
    id: "application",
    number: "03",
    title: "Practical Application",
    short: "Application",
  },
  {
    id: "exploration",
    number: "04",
    title: "Exploration & Curiosity",
    short: "Exploration",
  },
  {
    id: "growth",
    number: "05",
    title: "Confidence & Growth",
    short: "Growth",
  },
] as const;

const UI_DEPARTMENTS = [
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "HR", value: "HR" },
  { label: "Accounts", value: "Accounts" },
  { label: "Admin", value: "Admin" },
  { label: "Operations", value: "Operations" },
  { label: "Editor", value: "Editor / Media" },
] as const;

const MAX_TEXT = 5000;

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.75 13.75 8.25 19.25 10 13.75 11.75 12 17.25 10.25 11.75 4.75 10 10.25 8.25 12 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m18.5 15 .75 2.25L21.5 18l-2.25.75L18.5 21l-.75-2.25L15.5 18l2.25-.75L18.5 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="m5 10.5 3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Section({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="surface-card scroll-mt-36 p-5 sm:p-8">
      <div className="mb-8 flex items-start gap-4 border-b border-zinc-800 pb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-xs font-bold text-indigo-300">
          {number}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function Question({
  number,
  title,
  helper,
  children,
}: {
  number?: string;
  title: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        {number && (
          <span className="mt-0.5 min-w-7 rounded-md bg-zinc-800/80 px-1.5 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {number}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-6 text-zinc-200">{title}</p>
          {helper && <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p>}
        </div>
      </div>
      <div className={number ? "ml-0 mt-3 sm:ml-10" : "mt-3"}>{children}</div>
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  required,
  minHeight = "min-h-36",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minHeight?: string;
}) {
  return (
    <div>
      <textarea
        className={`field ${minHeight} resize-y leading-6`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={MAX_TEXT}
      />
      <div className="mt-2 flex justify-end text-[11px] tabular-nums text-zinc-600">
        {value.length.toLocaleString()} / {MAX_TEXT.toLocaleString()}
      </div>
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 4;
}) {
  return (
    <div className={`grid gap-3 ${columns === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
      {options.map((option, index) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={`group relative flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition duration-200 ${
              selected
                ? "border-indigo-500/70 bg-indigo-500/10 shadow-[0_0_0_3px_rgba(99,102,241,0.08)]"
                : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700 hover:bg-zinc-900"
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              required
            />
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition ${
                selected
                  ? "border-indigo-400 bg-indigo-500 text-white"
                  : "border-zinc-700 text-zinc-500 group-hover:border-zinc-600"
              }`}
            >
              {selected ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={`text-sm leading-5 ${selected ? "text-white" : "text-zinc-400"}`}
            >
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function EmployeeForm() {
  const [form, setForm] = useState(initialState);
  const [q0File, setQ0File] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const sectionCompletion = useMemo(
    () => [
      [form.employee_id, form.name, form.department, form.role].every(Boolean),
      Boolean(
        (form.q0_proof || q0File) &&
          form.q1_choice &&
          form.q2_task_text,
      ),
      Boolean(form.q3_impact_choice && form.q4_problem_text),
      Boolean(
        form.q5_workflow_choice &&
          form.q6_teaching_text &&
          form.q7_outcome_text &&
          form.q8_wrong_result_text,
      ),
      Boolean(form.q9_change_choice && form.q10_blocker_choice),
    ],
    [form, q0File],
  );
  const completedSections = sectionCompletion.filter(Boolean).length;
  const progress = Math.round((completedSections / SECTIONS.length) * 100);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (q0File) formData.append("q0_file", q0File);

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "We could not submit your response. Please try again.");
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center px-4 py-16">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="surface-card animate-fade-up relative w-full max-w-xl overflow-hidden p-7 text-center sm:p-12">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.12)]">
            <CheckIcon className="h-8 w-8" />
          </div>
          <p className="eyebrow mt-8">Assessment complete</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            You&apos;re all set.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-zinc-400">
            Your response has been submitted successfully. Thank you for taking the
            time to share how AI fits into your work.
          </p>
          <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Response securely recorded
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="mx-auto max-w-[1000px] px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <header className="relative pb-10 sm:pb-14">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                <SparkIcon />
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-200">
                AI Adoption Portal
              </span>
            </div>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium text-zinc-500">
              Monthly assessment
            </span>
          </div>

          <div className="max-w-3xl">
            <p className="eyebrow">Your AI journey, this month</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl sm:leading-[1.05]">
              How is AI changing the way you work?
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              Share real examples, honest challenges, and the tools shaping your
              workflow. There are no perfect answers, only useful ones.
            </p>
          </div>
        </header>

        <div className="sticky top-3 z-30 mb-6 rounded-2xl border border-zinc-800/90 bg-[#0d0d0d]/90 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-1.5 min-w-20 flex-1 overflow-hidden rounded-full bg-zinc-800 sm:max-w-44">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-400">
                {progress}% complete
              </span>
            </div>
            <span className="hidden text-xs text-zinc-600 sm:block">
              {completedSections} of {SECTIONS.length} sections
            </span>
          </div>
          <nav
            className="mt-3 grid grid-cols-5 gap-1"
            aria-label="Assessment sections"
          >
            {SECTIONS.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-label={section.title}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition sm:px-3 ${
                  sectionCompletion[index]
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                {sectionCompletion[index] && <CheckIcon className="h-3.5 w-3.5" />}
                <span className="sm:hidden">{index + 1}</span>
                <span className="hidden truncate sm:inline">{section.short}</span>
              </a>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Section
            id="details"
            number="01"
            title="Your Details"
            description="A few basics so we can place your responses in the right context."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="label">
                Employee ID
                <span className="helper">Your company-issued identifier</span>
                <input
                  className="field"
                  value={form.employee_id}
                  onChange={(event) => update("employee_id", event.target.value)}
                  placeholder="e.g. EMP-1042"
                  autoComplete="off"
                  required
                />
              </label>
              <label className="label">
                Full Name
                <span className="helper">As it appears in company records</span>
                <input
                  className="field"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="label">
                Department
                <span className="helper">Your primary team</span>
                <select
                  className="field"
                  value={form.department}
                  onChange={(event) => update("department", event.target.value)}
                  required
                >
                  <option value="">Select department</option>
                  {UI_DEPARTMENTS.map((department) => (
                    <option key={department.label} value={department.value}>
                      {department.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="label">
                Role / Designation
                <span className="helper">Your current position</span>
                <input
                  className="field"
                  value={form.role}
                  onChange={(event) => update("role", event.target.value)}
                  placeholder="e.g. Senior Executive"
                  required
                />
              </label>
            </div>
          </Section>

          <Section
            id="usage"
            number="02"
            title="Usage Snapshot"
            description="Show evidence and describe how often AI appeared in your actual work."
          >
            <Question
              number="Q0"
              title="AI Work Evidence"
              helper="Required: share evidence of AI-assisted work completed this month. Use a link or upload a PNG, JPG, JPEG, or PDF proof file."
            >
              <div className="space-y-4">
                <label className="label">
                  Link
                  <input
                    className="field"
                    type="url"
                    value={form.q0_proof}
                    onChange={(event) => update("q0_proof", event.target.value)}
                    placeholder="https://example.com/your-ai-assisted-work"
                  />
                </label>
                <label className="label">
                  Proof file
                  <span className="helper">
                    Screenshot or PDF upload, up to 10 MB
                  </span>
                  <input
                    className="field file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-xs file:font-medium file:text-zinc-200 hover:file:bg-zinc-700"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    onChange={(event) =>
                      setQ0File(event.target.files?.item(0) ?? null)
                    }
                  />
                </label>
              </div>
            </Question>

            <Question
              number="Q1"
              title="In the last 30 days, how often did you use AI for actual work tasks?"
            >
              <RadioGroup
                name="q1_choice"
                options={Q1_FREQUENCY_OPTIONS}
                value={form.q1_choice}
                onChange={(value) => update("q1_choice", value)}
              />
            </Question>

            <Question
              number="Q2"
              title="Describe ONE specific task where AI is now a regular part of your work."
              helper="What exactly do you do and what does AI do?"
            >
              <TextArea
                value={form.q2_task_text}
                onChange={(value) => update("q2_task_text", value)}
                placeholder="For example: I prepare the client brief, then use AI to summarize themes and draft the first outline..."
                required
              />
            </Question>
          </Section>

          <Section
            id="application"
            number="03"
            title="Impact & Problem Solving"
            description="Tell us what changed in your weekly work and what new problem you solved."
          >
            <Question
              number="Q3"
              title="Which of the following best describes the impact AI has on your weekly work?"
            >
              <RadioGroup
                name="q3_impact_choice"
                options={Q3_IMPACT_OPTIONS}
                value={form.q3_impact_choice}
                onChange={(value) => update("q3_impact_choice", value)}
              />
            </Question>
            <Question
              number="Q4"
              title="Describe a work problem you solved with AI this month that you had not solved with AI before."
              helper="This must be different from your Q2 answer."
            >
              <TextArea
                value={form.q4_problem_text}
                onChange={(value) => update("q4_problem_text", value)}
                placeholder="The new problem I solved was..."
                required
              />
            </Question>
          </Section>

          <Section
            id="exploration"
            number="04"
            title="Workflow & Sharing"
            description="Help us understand how embedded AI is in your process and whether the learning spread."
          >
            <Question
              number="Q5"
              title="Where does AI currently sit in your workflow?"
            >
              <RadioGroup
                name="q5_workflow_choice"
                options={Q5_WORKFLOW_OPTIONS}
                value={form.q5_workflow_choice}
                onChange={(value) => update("q5_workflow_choice", value)}
              />
            </Question>

            <Question
              number="Q6"
              title="Have you shown or taught an AI approach to a colleague this month?"
              helper="If yes, explain what you shared. If not, briefly say no."
            >
              <TextArea
                value={form.q6_teaching_text}
                onChange={(value) => update("q6_teaching_text", value)}
                placeholder="I shared..."
                required
              />
            </Question>
          </Section>

          <Section
            id="growth"
            number="05"
            title="Outcomes & Reflection"
            description="Capture measurable outcomes, failure handling, and blockers for better support."
          >
            <Question
              number="Q7"
              title="What measurable outcome improved because of AI this month?"
              helper="Examples: faster turnaround time, more leads handled, better documentation, fewer errors, faster reporting, better communication, or other. Then describe the improvement."
            >
              <TextArea
                value={form.q7_outcome_text}
                onChange={(value) => update("q7_outcome_text", value)}
                placeholder="The measurable improvement was..."
                required
              />
            </Question>

            <Question
              number="Q8"
              title="Describe one specific time this month AI gave you a wrong or unusable result."
              helper="What happened and what did you do?"
            >
              <TextArea
                value={form.q8_wrong_result_text}
                onChange={(value) => update("q8_wrong_result_text", value)}
                placeholder="AI gave an unusable result when..."
                required
              />
            </Question>

            <Question
              number="Q9"
              title="Compared to last month, how has your use of AI changed?"
              helper="Informational only. This question is not scored."
            >
              <RadioGroup
                name="q9_change_choice"
                options={Q9_CHANGE_OPTIONS}
                value={form.q9_change_choice}
                onChange={(value) => update("q9_change_choice", value)}
              />
              <div className="mt-4">
                <label className="label">
                  What changed?
                  <TextArea
                    value={form.q9_change_text}
                    onChange={(value) => update("q9_change_text", value)}
                    placeholder="Optional context..."
                    minHeight="min-h-24"
                  />
                </label>
              </div>
            </Question>

            <Question
              number="Q10"
              title="Biggest blocker to using AI more in your role?"
              helper="Informational only. This question is not scored."
            >
              <RadioGroup
                name="q10_blocker_choice"
                options={Q10_BLOCKER_OPTIONS}
                value={form.q10_blocker_choice}
                onChange={(value) => update("q10_blocker_choice", value)}
              />
            </Question>
          </Section>

          <div className="surface-card p-5 sm:p-6">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
              >
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Ready to submit?</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Review your answers before sending. You can submit once per month.
                </p>
              </div>
              <button
                className="button-primary w-full shrink-0 sm:w-auto"
                disabled={submitting}
              >
                {submitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {submitting ? "Submitting response..." : "Submit assessment"}
                {!submitting && <ArrowIcon />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
