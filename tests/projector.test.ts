import assert from "node:assert/strict"
import test from "node:test"

import {
  findClosestProjectorBattle,
  findProjectorHotStreak,
  limitProjectorTweets,
  mergeProjectorLeaderboardUsers,
} from "../lib/projector.ts"

test("mergeProjectorLeaderboardUsers preserves previous rank history and image fallback", () => {
  const merged = mergeProjectorLeaderboardUsers(
    [
      {
        id: "u1",
        username: "Ava",
        rank: 2,
        total_points: 10,
        cigarette_count: 1,
        profile_image_url: "/ava.png",
      },
      {
        id: "u2",
        username: "Beau",
        rank: 1,
        total_points: 12,
        cigarette_count: 0,
        image_url: "/beau.png",
      },
    ],
    [
      {
        id: "u1",
        username: "Ava",
        image_url: "/ava-old.png",
        total_points: 8,
        cigarette_count: 1,
        rank: 1,
      },
    ],
  )

  assert.deepEqual(
    merged.map((user) => ({
      id: user.id,
      image_url: user.image_url,
      previousRank: user.previousRank,
    })),
    [
      { id: "u1", image_url: "/ava.png", previousRank: 1 },
      { id: "u2", image_url: "/beau.png", previousRank: 1 },
    ],
  )
})

test("limitProjectorTweets keeps the newest tweets list bounded", () => {
  const tweets = Array.from({ length: 12 }, (_, index) => ({ id: `t-${index}` }))

  assert.equal(limitProjectorTweets(tweets).length, 10)
  assert.deepEqual(limitProjectorTweets(tweets, 3), [
    { id: "t-0" },
    { id: "t-1" },
    { id: "t-2" },
  ])
})

test("findClosestProjectorBattle prefers the tightest adjacent race", () => {
  const battle = findClosestProjectorBattle([
    {
      id: "u1",
      username: "Ava",
      image_url: "",
      total_points: 15,
      cigarette_count: 0,
      rank: 1,
      previousRank: 1,
    },
    {
      id: "u2",
      username: "Beau",
      image_url: "",
      total_points: 14,
      cigarette_count: 0,
      rank: 2,
      previousRank: 3,
    },
    {
      id: "u3",
      username: "Cam",
      image_url: "",
      total_points: 8,
      cigarette_count: 0,
      rank: 3,
      previousRank: 2,
    },
  ])

  assert.deepEqual(
    battle && {
      leader: battle.leader.username,
      challenger: battle.challenger.username,
      gap: battle.gap,
    },
    { leader: "Ava", challenger: "Beau", gap: 1 },
  )
})

test("findProjectorHotStreak returns the biggest upward mover", () => {
  const streak = findProjectorHotStreak([
    {
      id: "u1",
      username: "Ava",
      image_url: "",
      total_points: 15,
      cigarette_count: 0,
      rank: 1,
      previousRank: 1,
    },
    {
      id: "u2",
      username: "Beau",
      image_url: "",
      total_points: 14,
      cigarette_count: 0,
      rank: 2,
      previousRank: 5,
    },
    {
      id: "u3",
      username: "Cam",
      image_url: "",
      total_points: 8,
      cigarette_count: 0,
      rank: 3,
      previousRank: 4,
    },
  ])

  assert.deepEqual(
    streak && {
      user: streak.user.username,
      placesGained: streak.placesGained,
    },
    { user: "Beau", placesGained: 3 },
  )
})
