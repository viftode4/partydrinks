# Birthday refactor audit

Date: 2026-04-13

## Scope

This audit reviews the current repository against:

- `.omx/plans/prd-birthday-party-refactor.md`
- `.omx/plans/test-spec-birthday-party-refactor.md`

It focuses on code-quality and documentation readiness for the approved birthday-party refactor.

## Executive summary

The codebase still reflects its original MVP state. The biggest gaps against the approved refactor are stale event branding, projector/debug noise, polling-heavy data fetching, and the absence of documented test coverage or gameplay gating.

## Findings by lane

### 1) Core stability + migration safety

- `package.json` only exposes `dev`, `build`, `start`, and `lint`; there is no dedicated `test` script and no explicit `typecheck` script.
- `app/layout.tsx` still contains generic metadata plus a `v0.dev` generator marker, which reads like unfinished scaffold output.
- The repo documentation previously described a quick MVP rather than the approved birthday refactor plan.

### 2) Birthday UI redesign

- `components/leaderboard-content.tsx:61` still renders `New Year's Leaderboard`, which conflicts with the birthday-event brief.
- `app/globals.css` still contains New Year-specific comments, a sign that event theming cleanup is incomplete.
- The README did not previously describe the birthday-specific product direction, refactor scope, or rollout guardrails.

### 3) Projector redesign + refresh strategy

- `app/projector/page.tsx:48-72` logs full leaderboard payloads and mapped user objects to the console on every refresh.
- `app/projector/page.tsx:95` polls every 5 seconds and fetches leaderboard + tweets on each cycle.
- `components/leaderboard-content.tsx:46` and `components/tweets-content.tsx:39` also poll independently every 10 seconds, which increases fetch churn across surfaces.

### 4) Duels + rivalry / hot-streak callouts

- A repository search did not find implemented duel, rivalry, hot-streak, feature-flag, or kill-switch flows in the current app code.
- Based on repo evidence, these mechanics still need to land behind admin-controlled gates before they can be treated as party-night safe.

### 5) Verification / rehearsal readiness

- There is no automated test suite wired into `package.json`.
- The approved seeded rehearsal thresholds exist in the plan docs, but there is no repo-local runbook or scripted rehearsal evidence yet.
- Verification currently depends on lint, build, and ad-hoc manual checks.

## Recommended execution order

1. **Stability pass first**
   - remove scaffold/debug leftovers
   - standardize metadata and event copy
   - add explicit verification scripts
2. **Performance pass**
   - consolidate refresh behavior
   - reduce redundant leaderboard/tweet polling
   - make projector updates readable under burst traffic
3. **Gameplay safety pass**
   - add feature flags / kill switches first
   - ship duels next
   - keep rivalry / hot-streak callouts derived-only
4. **Rehearsal pass**
   - capture seeded verification steps
   - document rollback / disable procedures

## Documentation updates completed in this task

- Rewrote `README.md` to reflect the approved birthday-party refactor scope.
- Added this audit document so the team has a concrete gap list tied to the PRD and test spec.

## Verification snapshot (2026-04-13)

- `pnpm build` ✅ passes and produces the current Next.js app bundle.
- `pnpm exec tsc --noEmit` ❌ fails in `lib/storage.ts` because `StorageError` is accessed via a non-existent `code` property.
- `pnpm lint` ❌ cannot run non-interactively because the repo does not yet include an ESLint configuration.
- `pnpm test` ❌ no test command is defined.

## Suggested next follow-ups

- Add a scripted `typecheck` command and a real `test` command in `package.json`.
- Replace stale New Year copy before UI redesign work branches further.
- Remove projector debug logging before performance rehearsal.
- Capture a party-night verification/runbook document once feature flags and gameplay toggles land.
