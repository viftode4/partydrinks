# Birthday operator runbook

Date: 2026-04-13

This runbook translates the approved PRD + test spec into event-ops notes for feature flags, rehearsal, and rollback.

## 1) Pre-party checklist

- deploy a build that passes `pnpm build`
- confirm typecheck/lint blockers are either fixed or explicitly accepted for the event build
- verify auth, leaderboard, tweets, profile, and projector routes load on mobile
- confirm gameplay features default to **off** until rehearsal is complete

## 2) Suggested feature-flag matrix

The current repository does not yet implement these flags. Treat this as the operator contract the product should meet before party-night rollout.

| Flag / control | Default | Purpose | Emergency effect |
| --- | --- | --- | --- |
| `duels_enabled` | off | enables challenge / accept / resolve flows | disables duel entry points without breaking core logging |
| `rivalry_callouts_enabled` | off | enables rivalry / hot-streak presentation | hides derived gameplay callouts |
| `projector_chaos_enabled` | off | enables projector-only spectacle/callout effects | falls back to stable leaderboard/tweets projector |
| `gameplay_enabled` | off | top-level gameplay master switch | disables all non-core mechanics |

## 3) Enable sequence

1. verify core logging + leaderboard remain stable with all gameplay flags off
2. enable `duels_enabled` only after resolution flows are rehearsed
3. enable `rivalry_callouts_enabled` only after duel/core ranking stability is confirmed
4. enable any projector-only chaos/callout layer last

## 4) Seeded rehearsal targets

Match the approved test spec:

- 25 seeded users
- 200 total ledger events
- 30 rapid events inside a 60-second burst window
- 8 overlapping duel attempts
- projector active during the burst

### Rehearsal pass criteria

- zero corrupted rankings
- no duplicate duel resolutions
- >=99% successful core actions for logging / posting / duel resolution
- no unrecoverable auth/session failures
- projector stays readable and does not lock up during the burst

## 5) Party-night rollback rules

Rollback should happen in this order:

1. disable projector-only chaos or callout layers
2. disable rivalry / hot-streak callouts
3. disable duels
4. keep core leaderboard + drink logging online if they remain healthy
5. if ranking correctness is in doubt, stop gameplay entirely and revert to the last verified stable build

## 6) What to record during rehearsal or live ops

- timestamp of each flag change
- errors affecting auth/session persistence
- ranking mismatches between UI and server response payloads
- projector freezes, refetch storms, or unreadable states
- any duel conflict or double-resolution attempt

## 7) Current implementation blockers to clear before event-ready status

- `pnpm exec tsc --noEmit` currently fails in `lib/storage.ts`
- `pnpm lint` is blocked by missing ESLint configuration
- `pnpm test` is unavailable because no test command is defined
- duel / rivalry / kill-switch flows are not yet implemented in the current app code
