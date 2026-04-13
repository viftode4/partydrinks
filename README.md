# Party Drinks

Party Drinks is a Next.js + Supabase party scoreboard for a birthday event. It tracks drinks, renders a live leaderboard, shows a tweet wall, and includes a projector view for a shared screen.

## Current refactor status

The repo is being refactored in place according to:

- `.omx/plans/prd-birthday-party-refactor.md`
- `.omx/plans/test-spec-birthday-party-refactor.md`
- `docs/birthday-refactor-audit.md`
- `docs/birthday-operator-runbook.md`

### Must-ship scope

- stability and UX polish across auth, leaderboard, tweets, profile, and projector
- canonical server-authoritative scoring/ranking core
- duel gameplay with admin kill switches
- derived rivalry / hot-streak callouts that remain safely disableable

### Guardrails

- stabilize before adding spectacle
- keep gameplay features gated by default
- treat leaderboard ranking as server-authoritative
- prefer additive, reversible schema changes

## Product surfaces

- `/leaderboard` — mobile-first party ranking view
- `/tweets` — social feed for party updates
- `/profile` — player stats and profile details
- `/projector` — large-screen party display

## Local development

```bash
pnpm install
pnpm dev
```

### Verification commands

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

> There is currently no automated test script in `package.json`. That gap is tracked in `docs/birthday-refactor-audit.md`.

## Environment

Create a `.env` file with the Supabase + auth settings used by the app:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=...
```

See `SUPABASE_SETUP.md` for database setup notes.

## Refactor priorities

1. remove stale MVP / New Year branding and debug leftovers
2. reduce polling and duplicate fetch work, especially on projector
3. add feature flags and host kill switches before gameplay ships
4. introduce the canonical ledger / rank / duel core
5. rehearse with seeded traffic before party-night rollout

## Notes for contributors

- keep diffs small and reversible
- do not add new dependencies without explicit approval
- verify lint, typecheck, and build before claiming completion
- document bounded exceptions when a verification step cannot pass yet
- update the operator runbook whenever flags, rehearsal steps, or rollback behavior change
