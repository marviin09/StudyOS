# Verification — 2026-09-27

Passed: TypeScript, ESLint, 12 calculation tests, full migration execution and database integrity/RLS integration checks, production build including PWA generation.

Browser verified: preview entry, dashboard rendering, task creation, task completion and derived progress update. Preview creation works on HTTP as well as HTTPS using Web Crypto random bytes. Sequential preview writes use current state. SAT blur updates patch only the edited column.

The project URL and public browser key were supplied and configured in the deployed owner-only Site. The email/password screen is deployed, but production acceptance remains blocked on applying both migrations, configuring Email Auth, custom SMTP and the production redirect URL, and testing live auth, persisted reloads, storage uploads/signed downloads and two-account isolation on the actual service. Other visitors cannot reach the owner-only Site until its audience is deliberately changed. Database tests use PostgreSQL with Supabase schemas mocked, not a running Supabase service.

Account preparation: Production builds remove preview access and sample records. Email/password is the primary sign-in; signup can require confirmation, and password recovery returns to the configured StudyOS origin. Owner-scoped queries and writes complement PostgreSQL RLS. New auth users receive their own profile, and a two-user integration check verifies profile creation, row isolation, foreign-key ownership and private file path ownership. Live signup, email delivery, recovery and actual multi-account persistence still require Supabase project configuration.

Workspace error recovery: Supabase `PGRST205` or `42P01` during record loading means a required table is unavailable. The UI now identifies missing database setup and offers a working retry and sign-out action. Retry refetches the profile as well as study records. The app can create the signed-in user's missing profile after the profile table exists, and the second migration backfills accounts created before the initial migration. These changes cannot make records persistent until the administrator applies the database migrations.

The production build reports a nonfatal main-bundle size warning. Responsive CSS is implemented; device-specific keyboard, installability and touch checks still require real-device acceptance. Sample records are intentionally temporary and visibly identified.

Browser verified SAT: creation of a ten-row sheet from pasted IDs; whitespace/case normalization; one correct, one incorrect and eight ungraded answers yielding 50% graded accuracy; timer start and finish; completion summary. Desktop answer-sheet screenshot inspected: input columns, result labels, timer, sidebar and purple visual treatment render correctly.
