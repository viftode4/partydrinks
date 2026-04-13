import assert from "node:assert/strict"
import test from "node:test"

import { buildAuthoritativeRankings } from "../lib/authoritative-rankings.ts"

test("buildAuthoritativeRankings sorts ledger totals and assigns dense ranks", () => {
  const rankings = buildAuthoritativeRankings([
    {
      user_id: "u3",
      username: "Cam",
      profile_image_url: "/cam.png",
      total_points: 0,
    },
    {
      user_id: "u1",
      username: "Ava",
      profile_image_url: "/ava.png",
      total_points: 12,
    },
    {
      user_id: "u2",
      username: "Beau",
      profile_image_url: "/beau.png",
      total_points: 12,
    },
  ])

  assert.deepEqual(rankings, [
    {
      user_id: "u1",
      username: "Ava",
      profile_image_url: "/ava.png",
      total_points: 12,
      rank: 1,
    },
    {
      user_id: "u2",
      username: "Beau",
      profile_image_url: "/beau.png",
      total_points: 12,
      rank: 2,
    },
  ])
})
