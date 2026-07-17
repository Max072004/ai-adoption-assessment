# AI Adoption Assessment Portal

A full-stack monthly employee AI adoption assessment built with Next.js App Router,
TypeScript, Tailwind CSS, and Supabase Postgres.

## Features

- Mobile-friendly public employee assessment
- One submission per employee per calendar month
- Signed, HTTP-only admin session cookie
- Protected admin submission and review workflow
- Month 2 assessment fields with backward-compatible legacy submissions
- Q0 link and proof-file uploads through Supabase Storage
- Monthly rankings with final-score flags
- CSV export
- Supabase constraints and Row Level Security

## Local setup

### 1. Install dependencies

Use Node.js 20 or newer.

```bash
npm install
```

### 2. Create Supabase tables

1. Create a free project at [Supabase](https://supabase.com).
2. Open the project's SQL Editor.
3. Run the full contents of each file in `supabase/migrations/` in filename order.

The migrations create the tables, storage bucket, database constraints, indexes,
and RLS policies. The public `anon` role can insert pending submissions and upload
proof files to the `proofs` bucket. Admin APIs use the service role after
validating the signed admin cookie.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-long-random-password
SESSION_SECRET=your-random-secret-of-at-least-32-characters
```

Find the Supabase URL and keys under **Project Settings > API**. Never expose the
service role key in client code or commit `.env.local`.

Generate strong secrets with:

```bash
openssl rand -base64 24
openssl rand -base64 48
```

Use the first value for `ADMIN_PASSWORD` and the second for `SESSION_SECRET`.

### 4. Run locally

```bash
npm run dev
```

Open:

- Employee form: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Deploy to GitHub and Vercel

1. Create a Git repository and push this project to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add all six variables from `.env.example` in the Vercel project settings.
4. Deploy. Vercel detects Next.js automatically.

Use separate Supabase projects and credentials for preview/production environments
if test data must remain isolated.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Public employee assessment |
| `/admin/login` | Admin login |
| `/admin` | Protected submissions and rankings dashboard |
| `/admin/submissions/[id]` | Protected review editor |

All `/api/admin/*` endpoints independently validate the signed session cookie.
Middleware also redirects unauthenticated admin page requests to the login screen.

## Scoring

Admins enter eight integer scores from 1 to 10. For Month 2, the eight manual
scores map to Q1 through Q8. Q0 proof, Q9, and Q10 are informational only. The
server calculates:

```text
raw_score = q0 + q1 + q2 + q3 + q4 + q5 + q6 + q7
final_score = raw_score
```

Employees are flagged only when the final score is below 50. The database keeps
the AAM column for future use, but AAM is not used in score calculations,
leaderboards, or CSV exports.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```
