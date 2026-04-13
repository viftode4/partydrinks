import type { Database, Json } from "@/types/supabase"

export const DUEL_STATUSES = ["pending", "active", "completed", "cancelled"] as const

export type DuelStatus = (typeof DUEL_STATUSES)[number]
export type DuelRow = Database["public"]["Tables"]["duels"]["Row"]
export type DuelInsert = Database["public"]["Tables"]["duels"]["Insert"]
export type ScoreEventInsert = Database["public"]["Tables"]["score_events"]["Insert"]

export interface DuelChallengeInput {
  challengerId: string
  opponentId: string
  wagerPoints: number
}

export interface DuelResolutionInput {
  duel: Pick<DuelRow, "challenger_id" | "opponent_id" | "status" | "wager_points">
  actorUserId: string
  winnerUserId: string
}

export function validateDuelChallenge(input: DuelChallengeInput) {
  if (!input.challengerId || !input.opponentId) {
    return "Both duel participants are required."
  }

  if (input.challengerId === input.opponentId) {
    return "You cannot challenge yourself."
  }

  if (!Number.isInteger(input.wagerPoints) || input.wagerPoints < 1 || input.wagerPoints > 25) {
    return "Wager points must be an integer between 1 and 25."
  }

  return null
}

export function validateDuelResolution(input: DuelResolutionInput) {
  if (input.duel.status !== "active") {
    return {
      ok: false as const,
      error: "Only active duels can be resolved.",
    }
  }

  const participants = new Set([input.duel.challenger_id, input.duel.opponent_id])
  if (!participants.has(input.actorUserId)) {
    return {
      ok: false as const,
      error: "Only duel participants can resolve this duel.",
    }
  }

  if (!participants.has(input.winnerUserId)) {
    return {
      ok: false as const,
      error: "Winner must be one of the duel participants.",
    }
  }

  const loserUserId = input.winnerUserId === input.duel.challenger_id ? input.duel.opponent_id : input.duel.challenger_id

  return {
    ok: true as const,
    loserUserId,
  }
}

export function buildDuelScoreEvents(params: {
  duelId: string
  winnerUserId: string
  loserUserId: string
  wagerPoints: number
}) {
  const metadata = {
    duelId: params.duelId,
    wagerPoints: params.wagerPoints,
  } satisfies Json

  return [
    {
      user_id: params.winnerUserId,
      source_type: "duel",
      source_id: params.duelId,
      delta: params.wagerPoints,
      metadata: {
        ...metadata,
        outcome: "winner",
      },
    } satisfies ScoreEventInsert,
    {
      user_id: params.loserUserId,
      source_type: "duel",
      source_id: params.duelId,
      delta: -params.wagerPoints,
      metadata: {
        ...metadata,
        outcome: "loser",
      },
    } satisfies ScoreEventInsert,
  ]
}

export function getDuelPairFilter(userId: string, opponentId: string) {
  return `and(challenger_id.eq.${userId},opponent_id.eq.${opponentId}),and(challenger_id.eq.${opponentId},opponent_id.eq.${userId})`
}
