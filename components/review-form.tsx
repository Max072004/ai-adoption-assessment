"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { DEPARTMENT_CONTEXT_NOTES } from "@/lib/constants";
import type { Score, SubmissionDetail } from "@/lib/types";

type ScoreKey =
  | "q0_score"
  | "q1_score"
  | "q2_score"
  | "q3_score"
  | "q4_score"
  | "q5_score"
  | "q6_score"
  | "q7_score";

type ReviewQuestion = {
  answer: string;
  score: ScoreKey;
  short: string;
  label: string;
  group: string;
  number: string;
};

const LEGACY_QUESTIONS: ReviewQuestion[] = [
  {
    answer: "q0_proof",
    score: "q0_score",
    short: "Work proof",
    label: "AI-assisted work proof or example",
    group: "Evidence",
    number: "Q0",
  },
  {
    answer: "q1_scale",
    score: "q1_score",
    short: "Daily usage",
    label: "AI usage in daily work",
    group: "Usage",
    number: "Q1",
  },
  {
    answer: "q2_text",
    score: "q2_score",
    short: "Recent use",
    label: "Most recent work-related AI use",
    group: "Usage",
    number: "Q2",
  },
  {
    answer: "q3_text",
    score: "q3_score",
    short: "Routine work",
    label: "Repetitive work and AI application",
    group: "Application",
    number: "Q3",
  },
  {
    answer: "q4_text",
    score: "q4_score",
    short: "Delegation",
    label: "Work they would hand over to AI",
    group: "Application",
    number: "Q4",
  },
  {
    answer: "q5_yesno",
    score: "q5_score",
    short: "Exploration",
    label: "New AI tool or feature exploration",
    group: "Curiosity",
    number: "Q5",
  },
  {
    answer: "q6_choice",
    score: "q6_score",
    short: "Problem solving",
    label: "Problem-solving behavior",
    group: "Curiosity",
    number: "Q6",
  },
  {
    answer: "q7_choice",
    score: "q7_score",
    short: "Growth",
    label: "Confidence and growth",
    group: "Growth",
    number: "Q7",
  },
];

const MONTH_2_QUESTIONS: ReviewQuestion[] = [
  {
    answer: "q1_choice",
    score: "q0_score",
    short: "Frequency",
    label: "AI use frequency in the last 30 days",
    group: "Usage",
    number: "Q1",
  },
  {
    answer: "q2_task_text",
    score: "q1_score",
    short: "Regular task",
    label: "Specific task where AI is now regular",
    group: "Usage",
    number: "Q2",
  },
  {
    answer: "q3_impact_choice",
    score: "q2_score",
    short: "Impact",
    label: "Weekly work impact",
    group: "Impact",
    number: "Q3",
  },
  {
    answer: "q4_problem_text",
    score: "q3_score",
    short: "New problem",
    label: "New work problem solved with AI this month",
    group: "Problem solving",
    number: "Q4",
  },
  {
    answer: "q5_workflow_choice",
    score: "q4_score",
    short: "Workflow",
    label: "Current place of AI in workflow",
    group: "Workflow",
    number: "Q5",
  },
  {
    answer: "q6_teaching_text",
    score: "q5_score",
    short: "Teaching",
    label: "AI approach shown or taught to a colleague",
    group: "Sharing",
    number: "Q6",
  },
  {
    answer: "q7_outcome_text",
    score: "q6_score",
    short: "Outcome",
    label: "Measurable outcome improved by AI",
    group: "Outcome",
    number: "Q7",
  },
  {
    answer: "q8_wrong_result_text",
    score: "q7_score",
    short: "Wrong result",
    label: "Wrong or unusable AI result and response",
    group: "Judgment",
    number: "Q8",
  },
];

const MONTH_2_INFO_QUESTIONS = [
  {
    answer: "q9_change_choice",
    label: "Compared to last month, how has AI use changed?",
    detail: "q9_change_text",
    number: "Q9",
  },
  {
    answer: "q10_blocker_choice",
    label: "Biggest blocker to using AI more in their role",
    number: "Q10",
  },
] as const;

type ScoreState = Record<ScoreKey, string>;

const blankScores: ScoreState = {
  q0_score: "",
  q1_score: "",
  q2_score: "",
  q3_score: "",
  q4_score: "",
  q5_score: "",
  q6_score: "",
  q7_score: "",
};

function answerText(submission: SubmissionDetail, answer: string) {
  if (answer === "q0_proof") {
    if (submission.q0_proof) return submission.q0_proof;
    if (submission.q0_file_url) return "Uploaded proof file provided.";
    return "No response provided.";
  }
  if (answer === "q1_scale") return `${submission.q1_scale} / 10`;
  if (answer === "q5_yesno") {
    return submission.q5_yesno === "Yes"
      ? `Yes - ${submission.q5_detail || "No detail provided."}`
      : "No";
  }
  return String(submission[answer as keyof SubmissionDetail] ?? "No response provided.");
}

function isMonth2Submission(submission: SubmissionDetail) {
  return Boolean(
    submission.q1_choice ||
      submission.q2_task_text ||
      submission.q3_impact_choice ||
      submission.q4_problem_text,
  );
}

function infoAnswerText(
  submission: SubmissionDetail,
  answer: (typeof MONTH_2_INFO_QUESTIONS)[number]["answer"],
  detail?: "q9_change_text",
) {
  const primary = submission[answer] || "No response provided.";
  if (!detail) return primary;
  return submission[detail] ? `${primary}\n\n${submission[detail]}` : primary;
}

function getScoreRecord(value: Score | Score[] | null) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function displayDepartment(value: string) {
  return value === "Editor / Media" ? "Editor" : value;
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16 10H4m5 5-5-5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScoreControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const numericValue = Number(value || 1);
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0d0d0d] p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs font-medium text-zinc-400">{label}</span>
        <div className="flex items-center gap-1">
          <input
            className="h-8 w-11 rounded-lg border border-zinc-700 bg-zinc-900 text-center text-sm font-semibold tabular-nums text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            type="number"
            min="1"
            max="10"
            step="1"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required
            aria-label={`${label} score`}
          />
          <span className="text-xs text-zinc-600">/10</span>
        </div>
      </div>
      <input
        className="w-full"
        type="range"
        min="1"
        max="10"
        step="1"
        value={numericValue}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} score slider`}
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(numericValue - 1) * 11.11}%, #27272a ${(numericValue - 1) * 11.11}%, #27272a 100%)`,
        }}
      />
    </div>
  );
}

export function ReviewForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [scores, setScores] = useState<ScoreState>(blankScores);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmission() {
      try {
        const response = await fetch(`/api/admin/submissions/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        const detail = data.submission as SubmissionDetail;
        const existingScores = getScoreRecord(detail.scores);
        setSubmission(detail);
        setAdminNote(detail.admin_note ?? "");

        if (existingScores) {
          setScores(
            Object.fromEntries(
              Object.keys(blankScores).map((key) => [
                key,
                existingScores[key as keyof Score] == null
                  ? ""
                  : String(existingScores[key as keyof Score]),
              ]),
            ) as ScoreState,
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this submission.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSubmission();
  }, [id]);

  const scoringSummary = useMemo(() => {
    const values = Object.values(scores);
    const completed = values.filter((value) => {
      const numeric = Number(value);
      return numeric >= 1 && numeric <= 10;
    }).length;
    const raw = values.reduce((sum, value) => sum + (Number(value) || 0), 0);
    return { completed, raw };
  }, [scores]);

  const month2 = submission ? isMonth2Submission(submission) : false;
  const questions = month2 ? MONTH_2_QUESTIONS : LEGACY_QUESTIONS;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: id,
          ...Object.fromEntries(
            Object.entries(scores).map(([key, value]) => [key, Number(value)]),
          ),
          admin_note: adminNote,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(`/admin?month=${submission?.month_year}&saved=1`);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save the review.",
      );
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <AdminHeader compact />
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <Link
          href="/admin"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
        >
          <BackIcon />
          Back to submissions
        </Link>

        {loading && (
          <div className="surface-card flex items-center justify-center gap-3 py-24 text-sm text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
            Loading assessment...
          </div>
        )}
        {!loading && error && !submission && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {submission && (
          <form onSubmit={save}>
            <header className="surface-card relative mb-6 overflow-hidden p-5 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-base font-semibold text-zinc-200">
                    {submission.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                        {submission.employee_id}
                      </p>
                      <span
                        className={
                          submission.status === "reviewed"
                            ? "status-reviewed"
                            : "status-pending"
                        }
                      >
                        {submission.status === "reviewed" ? "Reviewed" : "Pending review"}
                      </span>
                    </div>
                    <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {submission.name}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                      {displayDepartment(submission.department)} · {submission.role}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Questions
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-200">8 scored</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Final score range
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-200">8-80 raw</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="min-w-0 space-y-5">
                <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M10 14v-4m0-3h.01M17 10A7 7 0 1 1 3 10a7 7 0 0 1 14 0Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                        Department context
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {DEPARTMENT_CONTEXT_NOTES[submission.department] ??
                          "Assess practical, role-relevant use of AI."}
                      </p>
                    </div>
                  </div>
                </section>

                <div>
                  <div className="mb-4">
                    <p className="eyebrow">Employee responses</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Review the full assessment
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {month2 && (
                      <article className="surface-card scroll-mt-24 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-[11px] font-bold text-zinc-400">
                            Q0
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                              Evidence
                            </p>
                            <h3 className="mt-1 text-sm font-semibold leading-6 text-zinc-200">
                              AI Work Evidence
                            </h3>
                          </div>
                        </div>
                        <div className="mt-5 rounded-xl border border-zinc-800/80 bg-[#0d0d0d] px-4 py-4 sm:px-5">
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-zinc-300">
                            {answerText(submission, "q0_proof")}
                          </p>
                          {submission.q0_file_url && (
                            <a
                              className="mt-3 inline-flex text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
                              href={submission.q0_file_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open uploaded proof
                            </a>
                          )}
                        </div>
                      </article>
                    )}

                    {questions.map((question, index) => (
                      <article
                        id={`response-${index}`}
                        key={question.score}
                        className="surface-card scroll-mt-24 p-5 sm:p-6"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-[11px] font-bold text-zinc-400">
                            {question.number}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                              {question.group}
                            </p>
                            <h3 className="mt-1 text-sm font-semibold leading-6 text-zinc-200">
                              {question.label}
                            </h3>
                          </div>
                        </div>
                        <div className="mt-5 rounded-xl border border-zinc-800/80 bg-[#0d0d0d] px-4 py-4 sm:px-5">
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-zinc-300">
                            {answerText(submission, question.answer)}
                          </p>
                          {question.answer === "q0_proof" && submission.q0_file_url && (
                            <a
                              className="mt-3 inline-flex text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
                              href={submission.q0_file_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open uploaded proof
                            </a>
                          )}
                        </div>
                      </article>
                    ))}

                    {month2 ? (
                      MONTH_2_INFO_QUESTIONS.map((question) => (
                        <article key={question.number} className="surface-card p-5 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-500">
                              {question.number}
                            </span>
                            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                              Informational only · Not scored
                            </span>
                          </div>
                          <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                            {question.label}
                          </h3>
                          <div className="mt-4 rounded-xl border border-zinc-800/80 bg-[#0d0d0d] px-4 py-4 sm:px-5">
                            <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-zinc-300">
                              {infoAnswerText(
                                submission,
                                question.answer,
                                "detail" in question ? question.detail : undefined,
                              )}
                            </p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <article className="surface-card p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-500">
                            Q8
                          </span>
                          <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                            Training needs only · Not scored
                          </span>
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                          Frustrations or confusion
                        </h3>
                        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-[#0d0d0d] px-4 py-4 sm:px-5">
                          <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-zinc-300">
                            {submission.q8_text || "No response provided."}
                          </p>
                        </div>
                      </article>
                    )}
                  </div>
                </div>
              </div>

              <aside className="xl:sticky xl:top-24">
                <div className="surface-card overflow-hidden">
                  <div className="border-b border-zinc-800 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">Scoring panel</p>
                        <h2 className="mt-2 text-lg font-semibold text-white">
                          Final score
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold tabular-nums text-white">
                          {scoringSummary.raw}
                          <span className="text-sm font-normal text-zinc-600"> / 80</span>
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                          Raw total
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${(scoringSummary.completed / 8) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-zinc-600">
                      {scoringSummary.completed} of 8 scores complete
                    </p>
                  </div>

                  <div className="max-h-none space-y-2.5 p-4 xl:max-h-[calc(100vh-370px)] xl:overflow-y-auto">
                    {questions.map((question, index) => (
                      <ScoreControl
                        key={question.score}
                        label={
                          month2
                            ? `Score ${index + 1} · ${question.number} · ${question.short}`
                            : `${question.number} · ${question.short}`
                        }
                        value={scores[question.score]}
                        onChange={(value) =>
                          setScores((current) => ({
                            ...current,
                            [question.score]: value,
                          }))
                        }
                      />
                    ))}
                  </div>

                  <div className="border-t border-zinc-800 p-4">
                    <label className="label">
                      Private admin note
                      <span className="helper">Visible only to administrators</span>
                      <textarea
                        className="field min-h-24 resize-y"
                        value={adminNote}
                        onChange={(event) => setAdminNote(event.target.value)}
                        placeholder="Add context or follow-up notes..."
                      />
                    </label>

                    {error && (
                      <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-xs leading-5 text-red-300">
                        {error}
                      </div>
                    )}

                    <button
                      className="button-primary mt-4 w-full"
                      disabled={saving || scoringSummary.completed < 8}
                    >
                      {saving && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}
                      {saving
                        ? "Saving review..."
                        : submission.status === "reviewed"
                          ? "Update review"
                          : "Save completed review"}
                    </button>
                    <p className="mt-3 text-center text-[10px] leading-4 text-zinc-600">
                      Saving updates the employee&apos;s status and monthly ranking.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
