# StudyOS

Responsive personal study workspace built with React, TypeScript, Vite, Tailwind, React Router, TanStack Query, React Hook Form, Zod and Supabase.

## Run

Use Node 22 or newer. Run `npm ci`, then `npm run dev`.

The local development server offers a clearly labeled, temporary sample-data preview. Production builds never expose that preview or bundle the sample records. Without Supabase configuration, production shows a setup-in-progress screen. No study records are stored in localStorage.

## Connect Supabase

1. Inspect the project with the read-only `scripts/verify-supabase-schema.sql`. For a fresh database, apply the migrations in filename order: `202609230001_initial.sql`, `202609270001_backfill_existing_profiles.sql`, `202609280001_explicit_api_access.sql`, and `20260930162349_harden_profile_and_rls.sql`. They create the app tables, RLS, ownership constraints, RPCs, private file bucket, existing-user profiles, explicit authenticated API grants, and restrict the internal profile trigger, then refresh the schema cache. No sample study records are inserted. For a partially configured database, compare its schema and migration history first and apply only missing changes; do not rerun the initial migration or reset an existing database blindly. Re-run the audit: all 27 rows must report `ready = true`.
2. The project administrator enables Email authentication and new user signups, keeps email confirmation enabled, and configures custom SMTP for confirmation and password reset mail. Supabase's default mailer only sends to project team addresses, so it cannot support public signups.
3. Set the Supabase Auth Site URL to the production origin and allow the exact production redirect URL ending in `/`. Add a local development URL only for local testing. Avoid broad production wildcards. Sign-up confirmation and password reset links return to this URL.
4. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project's URL and publishable browser key. Never put a service-role key, database password, or SMTP credential in the frontend or GitHub repository.
5. Restart the development server or rebuild the deployment; Vite embeds public environment values at build time. Verify email account creation, confirmation, sign-in, password recovery, sign-out, reload persistence, two-account isolation, and PDF/image upload/download on the actual service before opening the deployment to other users.

Vite environment values are embedded at build time. Changing them requires a rebuild. RLS applies to all app tables and storage paths. Private files open with short-lived signed URLs.

## Implemented areas

- Dashboard, editable tasks, focus timer, calendar, daily score and streak calculations.
- Tawjihi subjects, units/topics, exams, files, mistakes and review scheduling.
- SAT companion answer sheets with bulk IDs, editable answers, normalized grading, session timer, history, duplicate detection and analytics. No College Board questions are displayed or recreated.
- IELTS reading/listening logs, writing and speaking records, mistakes and files. Bands are user-entered estimates.
- Universities, scholarships, requirements, applications, essays, achievements, documents and deadlines.
- Explicit Inbox review and acceptance, analytics, settings and JSON export.
- Responsive sidebar/bottom navigation and installable PWA shell.

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run test:db`, and `npm run build`.

The database check runs all migrations in PGlite PostgreSQL with mocked Supabase auth/storage schemas. App-table grants come from the actual migrations, not test fixtures. It checks all 27 tables, IELTS CRUD and cross-user isolation, preexisting-account profile creation, score constraints, answer grading, atomic imports, ownership references and private storage paths. It does not replace testing against a live Supabase project.

## GitHub source publication

The public GitHub repository contains only the application files enumerated by `node scripts/github-source-list.mjs`. The private Site's git history also contains supplied design reference images and original product specifications, so do not mirror that history to GitHub. No credentials or private reference files belong in the GitHub copy. The GitHub workflow runs the local checks without live Supabase secrets.

## Current limits

The email/password build is deployed to the existing owner-only Site with the matching Supabase project URL and publishable key. On 2026-09-28 the live project received all required schema migrations, and on 2026-09-30 a hardening migration. The live schema audit reports all 27 tables ready; a rollback-only IELTS write test verified owner access and cross-account isolation. The project still needs confirmation of Email Auth, custom SMTP, and allowed redirect settings, followed by real signup, persistence, recovery and private-file tests before opening the Site to other users. File upload progress indicates processing stages, not bytes transferred. Offline writes and automatic email/WhatsApp ingestion are not implemented. See `docs/VERIFICATION.md` for evidence and remaining checks.
