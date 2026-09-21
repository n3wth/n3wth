# Skills → Cloudflare D1 + Better Auth migration (N-709)

Status: code complete, local validation passed, production cutover NOT executed (no cloud deploys per task scope).

## What changed

- Auth backend: Supabase Auth → self-hosted Better Auth 1.7.5 with its native D1
  binding support (`database: env.DB` — no custom adapter; the adapter duck-types
  `prepare`/`batch`/`exec` and drives D1 through its own Kysely dialect).
- Sign-in: Magic-link only (`emailAndPassword` disabled), via the
  `magicLink` plugin. Tokens are stored in the core `verification` table and
  consumed atomically on first redemption — replay rejection is durable in D1.
- Rate limiting: `rateLimit.storage = "database"` — counters persist in the
  `rateLimit` table, so limits hold across requests, isolates, and restarts.
- Origin checks: `trustedOrigins` (from `BETTER_AUTH_URL` origin +
  `TRUSTED_ORIGINS`) plus explicit `advanced.disableOriginCheck: false`
  (Better Auth skips origin checks under `NODE_ENV=test` by default; the
  explicit flag keeps the guard on everywhere).
- Owner checks replacing Supabase RLS now run server-side in route handlers
  (see "Authorization rules" below).
- Client auth client factory added at `src/lib/auth-client.ts`
  (`better-auth/react` + `magicLinkClient`). The Supabase-backed
  `AuthProvider` component is untouched; swapping the UI to this client is a
  follow-up change and must update `src/components/AuthProvider.test.tsx`
  accordingly.

## Schema (DDL)

Two ordered migrations in `apps/skills/migrations/`, wired to Wrangler via the
`d1_databases[].migrations_dir` entry in `wrangler.jsonc`:

- `0001_better_auth.sql` — Better Auth core tables: `user`, `session`,
  `account`, `verification`, plus `rateLimit` (durable rate limiting).
- `0002_app.sql` — app tables: `profiles`, `upvotes`, `comments` (bound to
  `user(id)`), `votes` (anonymous fingerprint votes), `analytics`,
  `playground_usage`, `workflow_usage`, `feature_requests`.

Conventions (deliberate, D1-native):

- IDs: `TEXT` primary keys. New rows use `crypto.randomUUID()` (or Better
  Auth's generator for its own tables). Imported legacy rows keep their fixed
  UUIDs — `user.id` is plain TEXT, so an INSERT of a preserved UUID works
  unchanged; magic-link sign-in for an imported email attaches sessions to the
  preserved UUID (covered by a test).
- Timestamps: ISO 8601 **TEXT** everywhere (`new Date().toISOString()`;
  helper `nowIso()` in `src/server/db/d1.ts`). This matches the Better Auth
  D1 dialect, which serializes `Date` via `toISOString()`. Do NOT mix INTEGER
  epoch columns into this schema.
- Booleans: INTEGER 0/1 (Better Auth adapter convention for D1/sqlite).
- JSON: any future JSON payload goes in a TEXT column with explicit
  `JSON.parse`/`JSON.stringify` at the repository boundary — no implicit
  driver conversion.

## Worker wiring

- `wrangler.jsonc`: `d1_databases` binding `DB` (database_name
  `n3wth-skills`, `database_id` placeholder `REPLACE_WITH_D1_DATABASE_ID` —
  set the real ID at provisioning; do not commit real IDs if policy says
  otherwise) with `migrations_dir: migrations`.
- Auth endpoints: `app/api/auth/[...all]/route.ts` — lazily builds the Better
  Auth instance against `env.DB` per request (one instance per isolate via
  `WeakMap` cache).
  - `POST /api/auth/sign-in/magic-link`
  - `GET  /api/auth/magic-link/verify`
  - `POST /api/auth/sign-out`
  - `GET  /api/auth/get-session`
- Comments/votes routes (`app/api/comments/route.ts`, `app/api/vote/route.ts`)
  resolve session via `auth.api.getSession({ headers })`; if `DB` binding is
  absent, GET endpoints degrade to empty responses and writes return 503 —
  same shape as the pre-migration Supabase-absent fallbacks.
- The legacy Neon anonymous-vote count remains as a read-time additive
  fallback in `votesGet` (env-driven, silently 0 when no `DATABASE_URL`) per
  the "Neon remains only as fallback" decision.

## Authorization rules (former Supabase RLS, now server-side)

Implemented in `src/server/handlers/comments.ts` / `votes.ts`:

| Rule | Former RLS policy | Now |
| --- | --- | --- |
| Anyone can read comments | comments SELECT `using (true)` | public `commentsGet` |
| Insert own comment only | INSERT `with check (auth.uid() = user_id)` | `commentsPost` forces `user_id` from the session; payload `user_id` is ignored |
| Delete own comment | DELETE `using (auth.uid() = user_id)` | `commentsDelete` fetches owner, 403 unless owner (404 if missing, 401 unauthenticated) |
| Anyone can read vote counts | upvotes SELECT `using (true)` | public `votesGet` |
| Insert/delete own upvote | INSERT/DELETE `auth.uid() = user_id` | `votesPost`/`votesDelete` bind the session user's id; idempotent via `UNIQUE(user_id, skill_id)` |
| Anonymous votes | n/a (Neon) | fingerprint rows in `votes`, `UNIQUE(skill_id, fingerprint)` |

`profiles`: read via `getProfile`/`listComments` join (public); insert/update
owned rows only — the profile write paths are not yet routed through public
endpoints (follow-up when the account UI moves to Better Auth).

## Environment variables (names only — never commit values)

- `BETTER_AUTH_SECRET` (secret, required): random 32+ byte signing secret.
  `wrangler secret put BETTER_AUTH_SECRET`.
- `BETTER_AUTH_URL` (var, required): canonical origin, e.g.
  `https://skills.newth.ai`.
- `TRUSTED_ORIGINS` (var, optional): comma-separated extra origins allowed
  for auth callbacks (e.g. preview hostnames). The `BETTER_AUTH_URL` origin
  is always trusted.
- Magic-link email (see open question): `RESEND_API_KEY` (secret) if Resend,
  plus `MAGIC_LINK_FROM` (var) for the From address.
- `MAGIC_LINK_OUTBOX=1` (var, local/test only): captures links to an
  in-memory outbox instead of sending — used by the local validation suite.

## Open question: production email sender

Decision deliberately NOT made in this change. Options:

1. **Resend** — implemented path (`sendViaResend` in
   `src/server/email/magic-link.ts`). Simple HTTPS API, good deliverability;
   needs `RESEND_API_KEY` secret + verified n3wth sender domain.
2. **MailChannels** (Workers-native, free tier was deprecated — verify current
   status before choosing) — fetch-based, no extra secret, but deliverability
   and SPF/DKIM setup burden sit on us.
3. **Existing n3wth sender** — reuse whatever transactional pipeline other
   n3wth properties already use for consistent domain reputation; requires
   exposing it as a Worker-callable endpoint.

Recommendation: start with Resend unless the existing n3wth sender is trivially
callable from Workers. The sender is swappable behind one function, so this
does not block code merge — only production cutover.

## Neon inventory approach (counts only, no personal rows)

Neon keeps `votes` (fingerprint), `analytics` (view/copy), `playground_usage`,
`workflow_usage`. Rehearsal exports **counts only** — no email addresses, no
fingerprints, no per-row dumps leave Neon during rehearsal:

```sql
SELECT 'votes'            AS table_name, COUNT(*) FROM votes
UNION ALL SELECT 'analytics',        COUNT(*) FROM analytics
UNION ALL SELECT 'playground_usage', COUNT(*) FROM playground_usage
UNION ALL SELECT 'workflow_usage',   COUNT(*) FROM workflow_usage;
```

Also collect per-`skill_id` vote counts (`SELECT skill_id, COUNT(*) FROM votes
GROUP BY skill_id`) for post-cutover parity checks against D1
(`SELECT skill_id, COUNT(*) FROM votes GROUP BY skill_id`). Decision needed at
cutover: import legacy rows wholesale (fingerprints have no direct personal
identifiers) or import nothing and keep a permanently additive read fallback.
Current code keeps the read fallback, so importing nothing is safe.

Skills has NO Supabase data to preserve (user-confirmed) — no identity bridge,
no data export from Supabase. New accounts start fresh in D1.

## Local validation evidence (miniflare/workerd via wrangler getPlatformProxy)

Synthetic only — no cloud deploys, no real emails, no production secrets.
`MAGIC_LINK_OUTBOX=1` captures links; the D1 binding is a real workerd-backed
Miniflare instance.

Command: `npx vitest run src/server/auth/auth.d1-auth.test.ts src/server/handlers/owner-checks.d1-auth.test.ts`

Covered:
- magic-link request + issuance (link captured with token)
- single redemption: 302 + session cookie + `get-session` returns the user
- replay rejection: second verify of same link → `error=INVALID_TOKEN`,
  no session minted (token consumed atomically in D1)
- signout: `sign-out` invalidates server-side; subsequent `get-session` → null
- hostile origins: untrusted `callbackURL` at sign-in → 403 (link never
  issued); tampered verify URL → 403, no redirect off-origin; cookie-bearing
  POST from untrusted Origin → 403 (CSRF)
- preserved UUID import: fixed-UUID `user` row inserted directly; magic-link
  sign-in returns a session with `user.id` equal to the imported UUID
- durable rate limiting: 6th magic-link request in the window → 429;
  `rateLimit` rows present in D1; a freshly constructed auth instance over the
  same DB (isolate-restart simulation) still returns 429
- owner checks: comment POST forces session-user ownership, DELETE 403 for
  non-owner / 200 owner; vote POST/DELETE touch only the session user's row;
  anonymous fingerprint voting preserved

Result: 8 passed / 8 (both files). `npm run typecheck`, `npm run lint`,
`npm run test:unit` (315 tests, 29 files), `npm run build` — all green.

## Preview D1 (per-PR isolation)

Each Skills PR preview gets its own D1 database `n3wth-skills-pr-<N>`
(managed by `scripts/cloudflare-preview-skills-d1.mjs` from
`.github/workflows/cloudflare-preview.yml`; runbook: `docs/skills/preview-d1.mdx`):

- Setup runs before deploy: account/permission/binding preflight, idempotent
  `migrations apply --remote` from `apps/skills/migrations/`, dynamic `DB`
  binding for the preview Worker. Production database name/ID is refused
  before any mutation.
- Post-deploy check verifies the `BETTER_AUTH_SECRET` secret name exists
  (values never read or overwritten; rotation is manual) and that
  `BETTER_AUTH_URL` is exactly the preview host.
- Preview configs strip `MAGIC_LINK_OUTBOX`; the dev outbox stays local-only.
- PR close deletes the preview Worker, domain, DNS record, and per-PR database.
- Recovery never deletes data: rerun setup to resume the journal; pre-apply
  backups are captured automatically.

## Go / No-Go checklist

Before production cutover:

- [ ] Create the D1 database (`wrangler d1 create n3wth-skills`) and put the
      real `database_id` in `wrangler.jsonc`.
- [ ] Apply migrations remotely:
      `wrangler d1 migrations apply n3wth-skills --remote`.
      Must complete before first traffic — Better Auth 1.7 validates the
      schema at init and auth requests fail while tables are missing.
- [ ] Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (workers secrets/vars).
- [ ] Decide the email sender (open question above); set `RESEND_API_KEY` /
      `MAGIC_LINK_FROM` or wire the chosen sender. Without a sender,
      `sign-in/magic-link` returns 500 by design (fail loud, never silently
      drop a login email).
- [ ] Confirm `TRUSTED_ORIGINS` covers every production/preview hostname that
      may carry auth callbacks.
- [ ] Freeze Neon writes for votes (read fallback continues to work), run the
      counts-only inventory, record counts for parity.
- [ ] Re-run the synthetic workerd suite against a preview deployment before
      production DNS cutover.
- [ ] Flip the UI to `src/lib/auth-client.ts` (AuthProvider swap) or verify
      Supabase UI paths are fenced off.
- [ ] Post-cutover: compare per-skill vote counts D1 vs Neon snapshot; monitor
      auth error rate and D1 usage against free allowances (25B reads / 50M
      writes / 5GB on Workers Paid).

Rollback: cut `BETTER_AUTH_URL`/DNS back; Supabase client codepaths remain
in-tree (they no-op without Supabase env); anonymous vote reads keep working
via the Neon fallback unchanged.
