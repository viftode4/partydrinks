import assert from "node:assert/strict"
import test from "node:test"

import {
  getDefaultPartyFeatureFlags,
  mergePartyFeatureFlags,
  normalizeFeatureFlagKey,
} from "../lib/feature-flags.ts"

test("normalizeFeatureFlagKey maps storage keys onto typed flags", () => {
  assert.equal(normalizeFeatureFlagKey("duels"), "duels")
  assert.equal(normalizeFeatureFlagKey("rivalry_callouts"), "rivalryCallouts")
  assert.equal(normalizeFeatureFlagKey("projector-chaos"), "projectorChaos")
  assert.equal(normalizeFeatureFlagKey("unknown-flag"), null)
})

test("mergePartyFeatureFlags applies DB overrides without losing unrelated defaults", () => {
  const merged = mergePartyFeatureFlags(
    {
      duels: false,
      rivalryCallouts: true,
      projectorChaos: false,
    },
    [
      { key: "duels", enabled: true },
      { key: "projector-chaos", enabled: true },
    ],
  )

  assert.deepEqual(merged, {
    duels: true,
    rivalryCallouts: true,
    projectorChaos: true,
  })
})

test("getDefaultPartyFeatureFlags falls back to safe defaults", () => {
  const flags = getDefaultPartyFeatureFlags()

  assert.equal(typeof flags.duels, "boolean")
  assert.equal(typeof flags.rivalryCallouts, "boolean")
  assert.equal(typeof flags.projectorChaos, "boolean")
})
