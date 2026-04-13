import assert from "node:assert/strict"
import test from "node:test"

import {
  buildDuelScoreEvents,
  getDuelPairFilter,
  validateDuelChallenge,
  validateDuelResolution,
} from "../lib/duels.ts"

test("validateDuelChallenge rejects invalid duel inputs", () => {
  assert.equal(
    validateDuelChallenge({
      challengerId: "u1",
      opponentId: "u1",
      wagerPoints: 5,
    }),
    "You cannot challenge yourself.",
  )

  assert.equal(
    validateDuelChallenge({
      challengerId: "u1",
      opponentId: "u2",
      wagerPoints: 30,
    }),
    "Wager points must be an integer between 1 and 25.",
  )
})

test("validateDuelResolution only allows active duels with participant winners", () => {
  assert.deepEqual(
    validateDuelResolution({
      duel: {
        challenger_id: "u1",
        opponent_id: "u2",
        status: "active",
        wager_points: 5,
      },
      actorUserId: "u1",
      winnerUserId: "u2",
    }),
    {
      ok: true,
      loserUserId: "u1",
    },
  )

  assert.deepEqual(
    validateDuelResolution({
      duel: {
        challenger_id: "u1",
        opponent_id: "u2",
        status: "pending",
        wager_points: 5,
      },
      actorUserId: "u1",
      winnerUserId: "u2",
    }),
    {
      ok: false,
      error: "Only active duels can be resolved.",
    },
  )
})

test("buildDuelScoreEvents creates a winner gain and loser penalty for the same duel", () => {
  const events = buildDuelScoreEvents({
    duelId: "duel-123",
    winnerUserId: "u2",
    loserUserId: "u1",
    wagerPoints: 7,
  })

  assert.deepEqual(events, [
    {
      user_id: "u2",
      source_type: "duel",
      source_id: "duel-123",
      delta: 7,
      metadata: {
        duelId: "duel-123",
        wagerPoints: 7,
        outcome: "winner",
      },
    },
    {
      user_id: "u1",
      source_type: "duel",
      source_id: "duel-123",
      delta: -7,
      metadata: {
        duelId: "duel-123",
        wagerPoints: 7,
        outcome: "loser",
      },
    },
  ])
})

test("getDuelPairFilter matches both participant directions for open-duel checks", () => {
  assert.equal(
    getDuelPairFilter("u1", "u2"),
    "and(challenger_id.eq.u1,opponent_id.eq.u2),and(challenger_id.eq.u2,opponent_id.eq.u1)",
  )
})
