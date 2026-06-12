"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import type { Ranking, Submission } from "@/lib/types";

type Tab = "submissions" | "rankings";

const FILTER_DEPARTMENTS = [
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "HR", value: "HR" },
  { label: "Accounts", value: "Accounts" },
  { label: "Admin", value: "Admin" },
  { label: "Operations", value: "Operations" },
  { label: "Editor", value: "Editor / Media" },
] as const;

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function displayDepartment(value: string) {
  return value === "Editor / Media" ? "Editor" : value;
}

function escapeCsv(value: string | number | boolean) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 5.5h12M4 10h12M4 14.5h7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">{description}</p>
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "rankings" ? "rankings" : "submissions";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [month, setMonth] = useState(searchParams.get("month") ?? currentMonth());
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [months, setMonths] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(searchParams.get("saved") === "1");

  const syncUrl = useCallback(
    (nextTab: Tab, nextMonth: string) => {
      const params = new URLSearchParams();
      if (nextTab === "rankings") params.set("tab", "rankings");
      params.set("month", nextMonth);
      router.replace(`/admin?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(false), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const submissionsRequest = fetch(`/api/admin/submissions?month=${month}`);
      const rankingsRequest =
        tab === "rankings" ? fetch(`/api/admin/rankings?month=${month}`) : null;
      const [submissionsResponse, rankingsResponse] = await Promise.all([
        submissionsRequest,
        rankingsRequest,
      ]);
      const submissionsData = await submissionsResponse.json();
      if (!submissionsResponse.ok) throw new Error(submissionsData.error);
      setSubmissions(submissionsData.submissions);
      setMonths(submissionsData.months);

      if (rankingsResponse) {
        const rankingsData = await rankingsResponse.json();
        if (!rankingsResponse.ok) throw new Error(rankingsData.error);
        setRankings(rankingsData.rankings);
        setMonths((current) =>
          Array.from(new Set([...current, ...(rankingsData.months ?? [])])).sort().reverse(),
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load assessment data.",
      );
    } finally {
      setLoading(false);
    }
  }, [month, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const availableMonths = useMemo(
    () => Array.from(new Set([currentMonth(), month, ...months])).sort().reverse(),
    [month, months],
  );

  const metrics = useMemo(() => {
    const reviewed = submissions.filter((item) => item.status === "reviewed").length;
    const total = submissions.length;
    return {
      total,
      pending: total - reviewed,
      reviewed,
      completion: total ? Math.round((reviewed / total) * 100) : 0,
    };
  }, [submissions]);

  const visibleSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return submissions.filter((item) => {
      const matchesDepartment = !department || item.department === department;
      const matchesSearch =
        !query ||
        [item.employee_id, item.name, item.department, item.role].some((value) =>
          value.toLowerCase().includes(query),
        );
      return matchesDepartment && matchesSearch;
    });
  }, [department, search, submissions]);

  function changeTab(nextTab: Tab) {
    setTab(nextTab);
    syncUrl(nextTab, month);
  }

  function changeMonth(nextMonth: string) {
    setMonth(nextMonth);
    syncUrl(tab, nextMonth);
  }

  function exportCsv() {
    const headers = [
      "Rank",
      "Employee ID",
      "Name",
      "Department",
      "Role",
      "Raw Score",
      "AAM",
      "Normalized Score",
      "Flagged",
    ];
    const rows = rankings.map((row) => [
      row.rank,
      row.employee_id,
      row.name,
      row.department,
      row.role,
      row.raw_score,
      row.aam,
      row.normalized_score,
      row.flagged ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ai-adoption-rankings-${month}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const metricCards = [
    {
      label: "Total submissions",
      value: metrics.total,
      detail: "Received this month",
      color: "text-white",
      dot: "bg-indigo-400",
    },
    {
      label: "Pending reviews",
      value: metrics.pending,
      detail: "Awaiting assessment",
      color: "text-amber-300",
      dot: "bg-amber-400",
    },
    {
      label: "Reviewed",
      value: metrics.reviewed,
      detail: "Assessments completed",
      color: "text-emerald-300",
      dot: "bg-emerald-400",
    },
    {
      label: "Completion",
      value: `${metrics.completion}%`,
      detail: "Monthly review progress",
      color: "text-indigo-300",
      dot: "bg-indigo-400",
    },
  ];

  return (
    <div className="app-shell">
      <AdminHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Assessment overview
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Track participation, review employee responses, and understand adoption
              across the organization.
            </p>
          </div>
          <label className="w-full text-xs font-medium uppercase tracking-wider text-zinc-500 sm:w-auto">
            Assessment period
            <select
              className="field mt-2 min-w-56 normal-case tracking-normal"
              value={month}
              onChange={(event) => changeMonth(event.target.value)}
            >
              {availableMonths.map((value) => (
                <option key={value} value={value}>
                  {monthLabel(value)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div key={card.label} className="surface-card p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <span className={`h-1.5 w-1.5 rounded-full ${card.dot}`} />
                {card.label}
              </div>
              <div className={`mt-4 text-3xl font-semibold tracking-tight ${card.color}`}>
                {loading ? <span className="text-zinc-700">--</span> : card.value}
              </div>
              <p className="mt-2 text-xs text-zinc-600">{card.detail}</p>
              {card.label === "Completion" && (
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${metrics.completion}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </section>

        <div className="mb-6 flex w-fit rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {(["submissions", "rankings"] as Tab[]).map((item) => (
            <button
              key={item}
              onClick={() => changeTab(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                tab === item
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {item === "submissions" ? "Submissions" : "Leaderboard"}
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15">
              ✓
            </span>
            Review saved successfully.
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {tab === "submissions" ? (
          <section className="surface-card overflow-hidden">
            <div className="border-b border-zinc-800 p-4 sm:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Employee submissions</h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    {visibleSubmissions.length} assessment
                    {visibleSubmissions.length === 1 ? "" : "s"} shown
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative min-w-0 sm:w-64">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                      <SearchIcon />
                    </span>
                    <input
                      className="field mt-0 py-2.5 pl-10"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search people or roles..."
                    />
                  </label>
                  <label>
                    <span className="sr-only">Filter by department</span>
                    <select
                      className="field mt-0 min-w-48 py-2.5"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                    >
                      <option value="">All departments</option>
                      {FILTER_DEPARTMENTS.map((item) => (
                        <option key={item.label} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] uppercase tracking-wider text-zinc-600">
                  <tr>
                    <th className="w-[26%] px-5 py-3.5 font-medium">Employee</th>
                    <th className="w-[20%] px-5 py-3.5 font-medium">Department</th>
                    <th className="w-[20%] px-5 py-3.5 font-medium">Role</th>
                    <th className="w-[14%] px-5 py-3.5 font-medium">Status</th>
                    <th className="w-[20%] px-5 py-3.5 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {!loading &&
                    visibleSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        tabIndex={0}
                        onClick={() => router.push(`/admin/submissions/${submission.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            router.push(`/admin/submissions/${submission.id}`);
                          }
                        }}
                        className="group cursor-pointer text-zinc-400 transition hover:bg-zinc-900/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300">
                              {submission.name
                                .split(" ")
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-zinc-200 group-hover:text-white">
                                {submission.name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-zinc-600">
                                {submission.employee_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="truncate px-5 py-4">
                          {displayDepartment(submission.department)}
                        </td>
                        <td className="truncate px-5 py-4">{submission.role}</td>
                        <td className="px-5 py-4">
                          <span
                            className={
                              submission.status === "reviewed"
                                ? "status-reviewed"
                                : "status-pending"
                            }
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {submission.status === "reviewed" ? "Reviewed" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-zinc-600">
                          <div className="flex items-center justify-between gap-3">
                            {dateLabel(submission.created_at)}
                            <span className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-400">
                              <ArrowIcon />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-zinc-800 lg:hidden">
              {!loading &&
                visibleSubmissions.map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => router.push(`/admin/submissions/${submission.id}`)}
                    className="block w-full p-4 text-left transition hover:bg-zinc-900/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300">
                          {submission.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {submission.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {submission.employee_id} · {displayDepartment(submission.department)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={
                          submission.status === "reviewed"
                            ? "status-reviewed"
                            : "status-pending"
                        }
                      >
                        {submission.status === "reviewed" ? "Reviewed" : "Pending"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-800/70 pt-3 text-xs">
                      <span className="truncate text-zinc-500">{submission.role}</span>
                      <span className="shrink-0 text-zinc-600">
                        {shortDate(submission.created_at)}
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-zinc-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
                Loading submissions...
              </div>
            )}
            {!loading && visibleSubmissions.length === 0 && (
              <EmptyState
                title="No submissions found"
                description={
                  search || department
                    ? "Try clearing your search or choosing a different department."
                    : "New employee assessments will appear here as they are submitted."
                }
              />
            )}
          </section>
        ) : (
          <section>
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">Monthly leaderboard</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Ranked by department-adjusted normalized score.
                </p>
              </div>
              <button
                className="button-primary w-full sm:w-auto"
                onClick={exportCsv}
                disabled={rankings.length === 0}
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M10 3v9m0 0 3-3m-3 3L7 9M4 14.5v1A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Export full CSV
              </button>
            </div>

            <div className="surface-card hidden overflow-hidden lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] uppercase tracking-wider text-zinc-600">
                  <tr>
                    <th className="w-[9%] px-5 py-3.5 font-medium">Rank</th>
                    <th className="w-[25%] px-5 py-3.5 font-medium">Employee</th>
                    <th className="w-[19%] px-5 py-3.5 font-medium">Department</th>
                    <th className="w-[18%] px-5 py-3.5 font-medium">Role</th>
                    <th className="w-[11%] px-5 py-3.5 font-medium">Raw</th>
                    <th className="w-[8%] px-5 py-3.5 font-medium">AAM</th>
                    <th className="w-[10%] px-5 py-3.5 text-right font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {!loading &&
                    rankings.map((row) => (
                      <tr
                        key={row.id}
                        className={`${
                          row.flagged ? "bg-red-500/[0.035]" : ""
                        } text-zinc-400 transition hover:bg-zinc-900/60`}
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                              row.rank === 1
                                ? "border border-amber-400/30 bg-amber-400/10 text-amber-300"
                                : row.rank === 2
                                  ? "border border-zinc-400/20 bg-zinc-400/10 text-zinc-300"
                                  : row.rank === 3
                                    ? "border border-orange-500/20 bg-orange-500/10 text-orange-300"
                                    : "bg-zinc-900 text-zinc-500"
                            }`}
                          >
                            {row.rank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="truncate font-medium text-zinc-200">{row.name}</p>
                          <p className="mt-0.5 truncate text-xs text-zinc-600">
                            {row.employee_id}
                          </p>
                        </td>
                        <td className="truncate px-5 py-4">
                          {displayDepartment(row.department)}
                        </td>
                        <td className="truncate px-5 py-4">{row.role}</td>
                        <td className="px-5 py-4 tabular-nums">{row.raw_score} / 80</td>
                        <td className="px-5 py-4 tabular-nums">{row.aam}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="font-semibold tabular-nums text-white">
                            {row.normalized_score.toFixed(1)}
                          </div>
                          {row.flagged && (
                            <span className="mt-1 inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-300">
                              Flagged
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {loading && (
                <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-zinc-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
                  Building leaderboard...
                </div>
              )}
              {!loading && rankings.length === 0 && (
                <EmptyState
                  title="No reviewed submissions yet"
                  description="The leaderboard will populate after the first assessment is reviewed."
                />
              )}
            </div>

            <div className="space-y-3 lg:hidden">
              {!loading &&
                rankings.map((row) => (
                  <article
                    key={row.id}
                    className={`surface-card p-4 ${
                      row.rank <= 3 ? "border-indigo-500/20" : ""
                    } ${row.flagged ? "bg-red-500/[0.035]" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          row.rank === 1
                            ? "bg-amber-400/10 text-amber-300"
                            : row.rank === 2
                              ? "bg-zinc-400/10 text-zinc-300"
                              : row.rank === 3
                                ? "bg-orange-500/10 text-orange-300"
                                : "bg-zinc-900 text-zinc-500"
                        }`}
                      >
                        #{row.rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-white">
                              {row.name}
                            </h3>
                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {displayDepartment(row.department)} · {row.role}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-semibold tabular-nums text-white">
                              {row.normalized_score.toFixed(1)}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                              Normalized
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                          <span>Raw: {row.raw_score} / 80</span>
                          <span>AAM: {row.aam}</span>
                          {row.flagged && (
                            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-red-300">
                              Flagged
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              {loading && (
                <div className="surface-card flex items-center justify-center gap-3 px-5 py-16 text-sm text-zinc-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
                  Building leaderboard...
                </div>
              )}
              {!loading && rankings.length === 0 && (
                <div className="surface-card">
                  <EmptyState
                    title="No reviewed submissions yet"
                    description="The leaderboard will populate after the first assessment is reviewed."
                  />
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
