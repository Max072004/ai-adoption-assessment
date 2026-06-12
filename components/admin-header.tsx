"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3 13.7 8.3 19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function AdminHeader({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0a0a0a]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-white">
              AI Adoption
            </span>
            {!compact && (
              <span className="hidden text-[11px] text-zinc-500 sm:block">
                Assessment intelligence
              </span>
            )}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Admin session
          </div>
          <button
            className="button-secondary shrink-0"
            onClick={logout}
            disabled={loggingOut}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M8 4H4.75A1.75 1.75 0 0 0 3 5.75v8.5C3 15.22 3.78 16 4.75 16H8m4-3 3-3-3-3m3 3H7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
