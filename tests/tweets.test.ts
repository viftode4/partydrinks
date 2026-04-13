import assert from "node:assert/strict"
import test from "node:test"

import { buildUserStatsMap, formatTweetsWithStats, normalizeTweetUser } from "../lib/tweets.ts"

test("normalizeTweetUser accepts Supabase object and array join shapes", () => {
  const objectUser = normalizeTweetUser(
    { id: "u1", username: "Ava", profile_image_url: "/ava.png" },
    "fallback",
  )
  const arrayUser = normalizeTweetUser(
    [{ id: "u2", username: "Beau", profile_image_url: "/beau.png" }],
    "fallback",
  )
  const missingUser = normalizeTweetUser(null, "u3")

  assert.equal(objectUser.username, "Ava")
  assert.equal(arrayUser.username, "Beau")
  assert.deepEqual(missingUser, {
    id: "u3",
    username: "Unknown",
    profile_image_url: "",
  })
})

test("formatTweetsWithStats enriches tweets with leaderboard totals", () => {
  const stats = buildUserStatsMap([
    { user_id: "u1", total_points: 11, cigarette_count: 2 },
    { user_id: "u2", total_points: null, cigarette_count: 4 },
  ])

  const tweets = formatTweetsWithStats(
    [
      {
        id: "t1",
        content: "first",
        image_url: null,
        created_at: "2026-01-01T00:00:00.000Z",
        user_id: "u1",
        users: [{ id: "u1", username: "Ava", profile_image_url: "/ava.png" }],
      },
      {
        id: "t2",
        content: "second",
        image_url: "/party.png",
        created_at: "2026-01-01T00:00:01.000Z",
        user_id: "u2",
        users: { id: "u2", username: "Beau", profile_image_url: "/beau.png" },
      },
    ],
    stats,
  )

  assert.deepEqual(
    tweets.map((tweet) => ({
      id: tweet.id,
      username: tweet.user.username,
      total_points: tweet.total_points,
      cigarette_count: tweet.cigarette_count,
    })),
    [
      { id: "t1", username: "Ava", total_points: 11, cigarette_count: 2 },
      { id: "t2", username: "Beau", total_points: 0, cigarette_count: 4 },
    ],
  )
})
