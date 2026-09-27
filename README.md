# StudyOS

Responsive personal study workspace built with React, TypeScript, Vite, Tailwind, React Router, TanStack Query, React Hook Form, Zod and Supabase.

## Run

Use Node 22 or newer. Run `npm ci`, then `npm run dev`.

The local development server offers a clearly labeled, temporary sample-data preview. Production builds never expose that preview or bundle the sample records. Without Supabase configuration, production shows a setup-in-progress screen. No study records are stored in localStorage.

## Connect Supabase

1. Apply `supabase/migrations/202609230001_initial.sql` to the application owner's Supabase project before creating users. It provisions tables, owner-based row security, cross-account reference constraints, automatic profile creation, transactional practice/import functions, and the private `academic-files` bucket. It inserts no sample study records.
2. An eligible project administrator enables Email authentication and new user signups, keeps email confirmation enabled, and configures custom SMTP for confirmation and password reset mail. Supabase's default mailer only sends to project team addresses, so it cannot support public signups.
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

The database check runs the actual migration in PGlite PostgreSQL with mocked Supabase auth/storage schemas. It checks score constraints, answer grading, atomic import acceptance, duplicate acceptance prevention, RLS isolation, cross-owner references and storage path ownership. It does not replace testing against a live Supabase project.

## GitHub source publication

Run `node scripts/github-source-list.mjs` for the exact application files intended for the GitHub repository. Make the first GitHub commit from these files alone. The private Site's git history also contains supplied design reference images and original product specifications, so do not mirror that history to GitHub. No credentials or private reference files belong in the GitHub copy. The GitHub workflow runs the local checks without live Supabase secrets.

## Current limits

The Supabase project URL and publishable key are configured locally; the migration, Email provider, custom SMTP, and allowed redirect URL still require setup by the project administrator. Until they are configured and the updated build is deployed, the previously published version remains a labeled development preview. After deploying the new production build without configuration, the app will show setup in progress instead of sample records. Live authentication, persistent records, storage transfers and recovery flows remain connection-dependent acceptance gates. File upload progress indicates processing stages, not bytes transferred. Offline writes and automatic email/WhatsApp ingestion are not implemented. See `docs/VERIFICATION.md` for evidence and remaining checks.
