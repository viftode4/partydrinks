import assert from "node:assert/strict"
import test from "node:test"

import { limitProjectorTweets, mergeProjectorLeaderboardUsers } from "../lib/projector.ts"

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
