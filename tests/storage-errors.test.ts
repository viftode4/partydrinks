import assert from "node:assert/strict"
import test from "node:test"

import { isStorageBucketMissingError } from "../lib/storage-errors.ts"

test("isStorageBucketMissingError matches bucket-not-found messages without Supabase-specific fields", () => {
  assert.equal(isStorageBucketMissingError({ message: "Bucket not found" }), true)
  assert.equal(isStorageBucketMissingError({ message: "permission denied" }), false)
  assert.equal(isStorageBucketMissingError(null), false)
})
