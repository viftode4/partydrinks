import type { LeaderboardUser } from "./types"

export type PartyCalloutTone = "hot" | "rivalry" | "steady" | "drop"

export interface PartyCallout {
  tone: PartyCalloutTone
  label: string
  detail: string
}

export interface PartyInsight {
  rankDelta: number
  primary: PartyCallout | null
  rivalry: PartyCallout | null
}

export function buildPartyInsights(users: ReadonlyArray<LeaderboardUser>) {
  const sortedUsers = [...users].sort((left, right) => left.rank - right.rank)
  const insights: Record<string, PartyInsight> = {}

  sortedUsers.forEach((user, index) => {
    const rankDelta = typeof user.previousRank === "number" ? user.previousRank - user.rank : 0
    const champions = user.champions ?? []

    let primary: PartyCallout | null = null

    if (rankDelta > 0) {
      primary = {
        tone: "hot",
        label: "Hot streak",
        detail: `Climbed ${rankDelta} ${rankDelta === 1 ? "spot" : "spots"} since the last refresh.`,
      }
    } else if (rankDelta < 0) {
      primary = {
        tone: "drop",
        label: "Turbulence",
        detail: `Slipped ${Math.abs(rankDelta)} ${Math.abs(rankDelta) === 1 ? "spot" : "spots"} — time to answer back.`,
      }
    } else if (user.rank === 1) {
      primary = {
        tone: "steady",
        label: "Cake boss",
        detail:
          champions.length > 0
            ? `Still holding the birthday throne with ${champions.length} ${champions.length === 1 ? "crown" : "crowns"}.`
            : "Still holding the birthday throne.",
      }
    } else if (champions.length >= 2) {
      primary = {
        tone: "hot",
        label: "Heat check",
        detail: `Owning ${champions.length} category crowns tonight.`,
      }
    } else if (user.rank <= 3) {
      primary = {
        tone: "steady",
        label: "Front-row chaos",
        detail: "Still camped in the podium splash zone.",
      }
    }

    const neighbors = [sortedUsers[index - 1], sortedUsers[index + 1]].filter(Boolean) as LeaderboardUser[]
    const closestNeighbor = neighbors
      .map((neighbor) => ({
        neighbor,
        gap: Math.abs(neighbor.total_points - user.total_points),
      }))
      .sort((left, right) => left.gap - right.gap)[0]

    const rivalry =
      closestNeighbor && closestNeighbor.gap <= 5
        ? {
            tone: "rivalry" as const,
            label: closestNeighbor.gap === 0 ? "Dead heat" : "Rivalry alert",
            detail:
              closestNeighbor.gap === 0
                ? `${closestNeighbor.neighbor.username} is tied with ${user.username}.`
                : `${closestNeighbor.neighbor.username} is only ${closestNeighbor.gap} ${closestNeighbor.gap === 1 ? "point" : "points"} away.`,
          }
        : null

    insights[user.id] = {
      rankDelta,
      primary,
      rivalry,
    }
  })

  return insights
}
