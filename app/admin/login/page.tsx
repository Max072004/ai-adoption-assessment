import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute left-[15%] top-[15%] h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[10%] right-[10%] h-64 w-64 rounded-full bg-violet-500/5 blur-[100px]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-800 bg-[#0d0d0d] shadow-2xl shadow-black/40 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[620px] overflow-hidden border-r border-zinc-800 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.16),transparent_38%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
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
              <span className="text-sm font-semibold text-white">AI Adoption Portal</span>
            </div>
          </div>
          <div className="relative">
            <p className="eyebrow">Assessment intelligence</p>
            <h1 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em] text-white">
              Turn employee insight into a smarter AI strategy.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">
              Review practical adoption, identify support needs, and track progress
              across every team from one focused workspace.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {["Secure reviews", "Role context", "Clear rankings"].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-zinc-800 bg-black/20 px-3 py-3 text-xs text-zinc-400"
              >
                <span className="mb-2 block h-1.5 w-1.5 rounded-full bg-indigo-400" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[560px] items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-9 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3 13.7 8.3 19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <p className="eyebrow">Admin workspace</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mb-8 mt-3 text-sm leading-6 text-zinc-500">
              Sign in to review assessments and monitor adoption.
            </p>
            <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
              <AdminLoginForm />
            </Suspense>
            <p className="mt-8 text-center text-[11px] leading-5 text-zinc-600">
              Protected administrative access. Sessions expire automatically.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
