import type { Database } from "@/types/supabase"

export interface PartyFeatureFlags {
  duels: boolean
  rivalryCallouts: boolean
  projectorChaos: boolean
}

type PartyFeatureFlagRow = Database["public"]["Tables"]["party_feature_flags"]["Row"]

const DEFAULT_FLAGS: PartyFeatureFlags = {
  duels: false,
  rivalryCallouts: true,
  projectorChaos: false,
}

const FLAG_ENV_KEYS: Record<keyof PartyFeatureFlags, string[]> = {
  duels: ["FEATURE_DUELS", "NEXT_PUBLIC_FEATURE_DUELS"],
  rivalryCallouts: ["FEATURE_RIVALRY_CALLOUTS", "NEXT_PUBLIC_FEATURE_RIVALRY_CALLOUTS"],
  projectorChaos: ["FEATURE_PROJECTOR_CHAOS", "NEXT_PUBLIC_FEATURE_PROJECTOR_CHAOS"],
}

export function getDefaultPartyFeatureFlags(): PartyFeatureFlags {
  return {
    duels: readBooleanEnvValue(FLAG_ENV_KEYS.duels, DEFAULT_FLAGS.duels),
    rivalryCallouts: readBooleanEnvValue(FLAG_ENV_KEYS.rivalryCallouts, DEFAULT_FLAGS.rivalryCallouts),
    projectorChaos: readBooleanEnvValue(FLAG_ENV_KEYS.projectorChaos, DEFAULT_FLAGS.projectorChaos),
  }
}

export function mergePartyFeatureFlags(
  baseFlags: PartyFeatureFlags,
  rows: ReadonlyArray<Pick<PartyFeatureFlagRow, "key" | "enabled">>,
): PartyFeatureFlags {
  const mergedFlags = { ...baseFlags }

  for (const row of rows) {
    const flagName = normalizeFeatureFlagKey(row.key)
    if (flagName) {
      mergedFlags[flagName] = row.enabled
    }
  }

  return mergedFlags
}

export async function loadPartyFeatureFlags(
  loadRows: () => Promise<ReadonlyArray<Pick<PartyFeatureFlagRow, "key" | "enabled">>>,
) {
  const baseFlags = getDefaultPartyFeatureFlags()

  try {
    const rows = await loadRows()
    return mergePartyFeatureFlags(baseFlags, rows)
  } catch (error) {
    if (isMissingFlagsStorageError(error)) {
      return baseFlags
    }

    throw error
  }
}

export function normalizeFeatureFlagKey(rawKey: string): keyof PartyFeatureFlags | null {
  const normalizedKey = rawKey.trim().toLowerCase().replace(/[_\s]+/g, "-")

  switch (normalizedKey) {
    case "duels":
      return "duels"
    case "rivalry-callouts":
      return "rivalryCallouts"
    case "projector-chaos":
      return "projectorChaos"
    default:
      return null
  }
}

function readBooleanEnvValue(keys: string[], fallbackValue: boolean) {
  for (const key of keys) {
    const rawValue = process.env[key]
    if (rawValue === undefined) {
      continue
    }

    return parseBooleanFlag(rawValue, fallbackValue)
  }

  return fallbackValue
}

function parseBooleanFlag(rawValue: string, fallbackValue: boolean) {
  const normalizedValue = rawValue.trim().toLowerCase()

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false
  }

  return fallbackValue
}

function isMissingFlagsStorageError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false
  }

  const message = "message" in error && typeof error.message === "string" ? error.message.toLowerCase() : ""
  return message.includes("party_feature_flags") && (message.includes("does not exist") || message.includes("not found"))
}
