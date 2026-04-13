import assert from "node:assert/strict"
import test from "node:test"

import { buildLeaderboard } from "../lib/leaderboard.ts"

const users = [
  { id: "u1", username: "Ava", profile_image_url: "/ava.png" },
  { id: "u2", username: "Beau", profile_image_url: "/beau.png" },
  { id: "u3", username: "Cam", profile_image_url: "/cam.png" },
]

const drinks = [
  { user_id: "u1", points: 4, drink_type: "Beer" as const },
  { user_id: "u1", points: 2, drink_type: "Wine" as const },
  { user_id: "u2", points: 3, drink_type: "Beer" as const },
  { user_id: "u2", points: 5, drink_type: "Cocktail" as const },
]

const cigarettes = [
  { user_id: "u1", count: 1 },
  { user_id: "u2", count: 2 },
  { user_id: "u2", count: 1 },
]

test("buildLeaderboard ranks active users from server-derived totals", () => {
  const leaderboard = buildLeaderboard(users, drinks, cigarettes, "all")

  assert.deepEqual(
    leaderboard.map((user) => ({
      id: user.id,
      rank: user.rank,
      total_points: user.total_points,
      cigarette_count: user.cigarette_count,
    })),
    [
      { id: "u2", rank: 1, total_points: 8, cigarette_count: 3 },
      { id: "u1", rank: 2, total_points: 6, cigarette_count: 1 },
    ],
  )
  assert.deepEqual(leaderboard[0]?.champions, ["Cocktail", "Cigarette"])
  assert.deepEqual(leaderboard[1]?.champions, ["Beer", "Wine"])
})

test("buildLeaderboard applies category filters and excludes zero-point users", () => {
  const beerLeaderboard = buildLeaderboard(users, drinks, cigarettes, "Beer")
  const cigaretteLeaderboard = buildLeaderboard(users, drinks, cigarettes, "cigarettes")

  assert.deepEqual(beerLeaderboard.map((user) => [user.id, user.total_points, user.rank]), [
    ["u1", 4, 1],
    ["u2", 3, 2],
  ])
  assert.deepEqual(cigaretteLeaderboard.map((user) => [user.id, user.total_points, user.rank]), [
    ["u2", 3, 1],
    ["u1", 1, 2],
  ])
})
