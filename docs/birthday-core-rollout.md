# Birthday core rollout + rollback notes

Date: 2026-04-13

## Scope covered here

- feature-flag defaults and kill-switch handling
- additive duel + score-ledger schema
- idempotent ledger backfill for historical drinks
- rollback/cutover notes for the birthday event

## New primitives

### `party_feature_flags`
- `duels`
- `rivalry-callouts`
- `projector-chaos`

Default posture stays safe:
- duels off
- rivalry callouts on
- projector chaos off

### `score_events`
- additive, append-only score ledger
- one event per historical drink row
- duel resolution writes one positive and one negative event

### `duels`
- `pending -> active -> completed|cancelled`
- unique open-duel guard per participant pair
- resolution handled through SQL so duel state and score ledger stay in sync

## Backfill sequence

1. Apply the migration that creates `party_feature_flags`, `score_events`, `duels`, and `authoritative_rankings`.
2. Let the migration backfill drink events into `score_events`.
3. Compare `authoritative_rankings.total_points` against the existing leaderboard totals for a sample of users before cutover.
4. Keep duels disabled until parity checks pass.

## Rollback

If the new party core misbehaves on event night:

1. Disable `duels` in `party_feature_flags`.
2. Keep the legacy drink-based leaderboard path active until ranking parity is confirmed again.
3. Because the migration is additive, old routes still read existing tables and do not require destructive rollback.
4. If needed, stop calling the duel-resolution RPC; historical tables remain intact.

## Rehearsal checklist

- seed 25 users
- seed 200 historical drink events
- verify `authoritative_rankings` matches sampled leaderboard totals
- run 8 overlapping duel attempts and confirm only one open duel exists per pair
- resolve active duels and confirm winner/loser score events land exactly once
