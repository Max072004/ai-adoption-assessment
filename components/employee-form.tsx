"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ANSWER_LETTERS,
  OBJECTIVE_QUESTIONS,
  Q21_OTHER_OPTION,
  Q21_OTHER_PROMPT,
  Q21_QUESTION,
  Q21_TOOL_OPTIONS,
  Q22_QUESTION,
  type AnswerLetter,
  type ObjectiveQuestionId,
  type Q21Tool,
} from "@/lib/assessment";
import { ACTIVE_DEPARTMENTS, displayDepartment } from "@/lib/constants";

type Answers = Partial<Record<ObjectiveQuestionId, AnswerLetter>>;

type FormState = {
  employee_id: string;
  name: string;
  department: string;
  role: string;
  q21_other_text: string;
  q22_evidence_link: string;
};

const initialState: FormState = {
  employee_id: "",
  name: "",
  department: "",
  role: "",
  q21_other_text: "",
  q22_evidence_link: "",
};

const SECTIONS = [
  { id: "details", number: "01", title: "Your Details", short: "Details" },
  { id: "knowledge", number: "02", title: "AI Knowledge Check", short: "Q1-Q20" },
  { id: "tools", number: "03", title: "AI Tools", short: "Q21" },
  { id: "evidence", number: "04", title: "AI Work Evidence", short: "Q22" },
] as const;

const UI_DEPARTMENTS = ACTIVE_DEPARTMENTS.map((department) => ({
  label: displayDepartment(department),
  value: department,
}));

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

/** Single-select A-D options for one objective question. */
function ChoiceGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Record<AnswerLetter, string>;
  value: AnswerLetter | undefined;
  onChange: (value: AnswerLetter) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ANSWER_LETTERS.map((letter) => {
        const selected = value === letter;
        return (
          <label
            key={letter}
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
              value={letter}
              checked={selected}
              onChange={() => onChange(letter)}
              required
            />
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition ${
                selected
                  ? "border-indigo-400 bg-indigo-500 text-white"
                  : "border-zinc-700 text-zinc-500 group-hover:border-zinc-600"
              }`}
            >
              {selected ? <CheckIcon className="h-3.5 w-3.5" /> : letter}
            </span>
            <span
              className={`text-sm leading-5 ${selected ? "text-white" : "text-zinc-400"}`}
            >
              {options[letter]}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Multi-select tool checkboxes for Q21. */
function ToolCheckboxes({
  selected,
  onToggle,
}: {
  selected: Set<Q21Tool>;
  onToggle: (tool: Q21Tool) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {Q21_TOOL_OPTIONS.map((tool) => {
        const checked = selected.has(tool);
        return (
          <label
            key={tool}
            className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition duration-200 ${
              checked
                ? "border-indigo-500/70 bg-indigo-500/10"
                : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700 hover:bg-zinc-900"
            }`}
          >
            <input
              className="sr-only"
              type="checkbox"
              name="q21_tools"
              value={tool}
              checked={checked}
              onChange={() => onToggle(tool)}
            />
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                checked
                  ? "border-indigo-400 bg-indigo-500 text-white"
                  : "border-zinc-700 group-hover:border-zinc-600"
              }`}
            >
              {checked && <CheckIcon className="h-3.5 w-3.5" />}
            </span>
            <span className={`text-sm leading-5 ${checked ? "text-white" : "text-zinc-400"}`}>
              {tool}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function EmployeeForm() {
  const [form, setForm] = useState(initialState);
  const [answers, setAnswers] = useState<Answers>({});
  const [tools, setTools] = useState<Set<Q21Tool>>(() => new Set());
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleTool(tool: Q21Tool) {
    setTools((current) => {
      const next = new Set(current);
      if (next.has(tool)) {
        next.delete(tool);
      } else {
        next.add(tool);
      }
      return next;
    });
    // Deselecting "Other" clears its conditional text.
    if (tool === Q21_OTHER_OPTION && tools.has(Q21_OTHER_OPTION)) {
      update("q21_other_text", "");
    }
  }

  const otherSelected = tools.has(Q21_OTHER_OPTION);
  const answeredCount = OBJECTIVE_QUESTIONS.filter((question) =>
    Boolean(answers[question.id]),
  ).length;

  const sectionCompletion = useMemo(
    () => [
      [form.employee_id, form.name, form.department, form.role].every(Boolean),
      answeredCount === OBJECTIVE_QUESTIONS.length,
      tools.size > 0 && (!otherSelected || Boolean(form.q21_other_text.trim())),
      Boolean(form.q22_evidence_link.trim() || evidenceFile),
    ],
    [form, answeredCount, tools, otherSelected, evidenceFile],
  );
  const completedSections = sectionCompletion.filter(Boolean).length;
  const progress = Math.round((completedSections / SECTIONS.length) * 100);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("employee_id", form.employee_id);
      formData.append("name", form.name);
      formData.append("department", form.department);
      formData.append("role", form.role);
      OBJECTIVE_QUESTIONS.forEach((question) => {
        formData.append(question.id, answers[question.id] ?? "");
      });
      tools.forEach((tool) => formData.append("q21_tools", tool));
      formData.append("q21_other_text", otherSelected ? form.q21_other_text : "");
      formData.append("q22_evidence_link", form.q22_evidence_link);
      if (evidenceFile) formData.append("q22_evidence_file", evidenceFile);

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
            Assessment submitted successfully.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-zinc-400">
            Thank you for completing this month&apos;s AI adoption assessment.
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
              Monthly AI adoption assessment
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              Twenty quick multiple-choice questions, the AI tools you explored, and
              one example of AI-assisted work. It takes about ten minutes.
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
            className="mt-3 grid grid-cols-4 gap-1"
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
                    <option key={department.value} value={department.value}>
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
            id="knowledge"
            number="02"
            title="AI Knowledge Check"
            description={`Questions 1 to 20. Select one answer for each question. ${answeredCount} of ${OBJECTIVE_QUESTIONS.length} answered.`}
          >
            {OBJECTIVE_QUESTIONS.map((question, index) => (
              <Question
                key={question.id}
                number={`Q${index + 1}`}
                title={question.title}
              >
                <ChoiceGroup
                  name={question.id}
                  options={question.options}
                  value={answers[question.id]}
                  onChange={(letter) =>
                    setAnswers((current) => ({ ...current, [question.id]: letter }))
                  }
                />
              </Question>
            ))}
          </Section>

          <Section
            id="tools"
            number="03"
            title="AI Tools"
            description="Tell us which AI tools you have been working with."
          >
            <Question
              number="Q21"
              title={Q21_QUESTION}
              helper="Select all that apply."
            >
              <ToolCheckboxes selected={tools} onToggle={toggleTool} />
              {otherSelected && (
                <div className="animate-fade-up mt-4">
                  <label className="label">
                    {Q21_OTHER_PROMPT}
                    <input
                      className="field"
                      value={form.q21_other_text}
                      onChange={(event) => update("q21_other_text", event.target.value)}
                      placeholder="e.g. Mistral, Pika, Otter.ai"
                      maxLength={MAX_TEXT}
                      required
                    />
                  </label>
                </div>
              )}
            </Question>
          </Section>

          <Section
            id="evidence"
            number="04"
            title="AI Work Evidence"
            description="Show us one real piece of AI-assisted work from this month."
          >
            <Question
              number="Q22"
              title={Q22_QUESTION}
              helper="Required: share a link or upload a PNG, JPG, JPEG, or PDF file (up to 10 MB)."
            >
              <div className="space-y-4">
                <label className="label">
                  Link
                  <input
                    className="field"
                    type="url"
                    value={form.q22_evidence_link}
                    onChange={(event) => update("q22_evidence_link", event.target.value)}
                    placeholder="https://example.com/your-ai-assisted-work"
                  />
                </label>
                <label className="label">
                  Evidence file
                  <span className="helper">Screenshot or PDF upload, up to 10 MB</span>
                  <input
                    className="field file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-xs file:font-medium file:text-zinc-200 hover:file:bg-zinc-700"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                    onChange={(event) =>
                      setEvidenceFile(event.target.files?.item(0) ?? null)
                    }
                  />
                </label>
              </div>
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
