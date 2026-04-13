import test from "node:test"
import assert from "node:assert/strict"

import { buildPartyInsights } from "../lib/party-insights.ts"

test("buildPartyInsights highlights rank movement and nearby rivalry gaps", () => {
  const insights = buildPartyInsights([
    {
      id: "u1",
      username: "Ava",
      image_url: "/ava.png",
      total_points: 22,
      cigarette_count: 1,
      rank: 1,
      previousRank: 2,
      champions: ["Beer"],
    },
    {
      id: "u2",
      username: "Beau",
      image_url: "/beau.png",
      total_points: 20,
      cigarette_count: 2,
      rank: 2,
      previousRank: 1,
      champions: [],
    },
    {
      id: "u3",
      username: "Cam",
      image_url: "/cam.png",
      total_points: 9,
      cigarette_count: 0,
      rank: 3,
      previousRank: 3,
      champions: [],
    },
  ])

  assert.equal(insights.u1?.primary?.label, "Hot streak")
  assert.match(insights.u1?.primary?.detail ?? "", /Climbed 1 spot/)
  assert.equal(insights.u1?.rivalry?.label, "Rivalry alert")
  assert.match(insights.u1?.rivalry?.detail ?? "", /Beau is only 2 points away/)

  assert.equal(insights.u2?.primary?.label, "Turbulence")
  assert.match(insights.u2?.primary?.detail ?? "", /Slipped 1 spot/)
})

test("buildPartyInsights falls back to champion and throne copy when ranks are stable", () => {
  const insights = buildPartyInsights([
    {
      id: "u1",
      username: "Ava",
      image_url: "/ava.png",
      total_points: 30,
      cigarette_count: 0,
      rank: 1,
      previousRank: 1,
      champions: ["Beer", "Wine"],
    },
    {
      id: "u2",
      username: "Beau",
      image_url: "/beau.png",
      total_points: 18,
      cigarette_count: 1,
      rank: 2,
      previousRank: 2,
      champions: ["Shot", "Cigarette"],
    },
  ])

  assert.equal(insights.u1?.primary?.label, "Cake boss")
  assert.match(insights.u1?.primary?.detail ?? "", /2 crowns/)
  assert.equal(insights.u2?.primary?.label, "Heat check")
})
