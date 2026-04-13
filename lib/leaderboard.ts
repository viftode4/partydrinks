import type { LeaderboardUser } from "./types"

export const DRINK_TYPES = ["Beer", "Wine", "Cocktail", "Shot"] as const

export type DrinkType = (typeof DRINK_TYPES)[number]
export type LeaderboardFilter = "all" | "cigarettes" | DrinkType

export interface LeaderboardUserRecord {
  id: string
  username: string
  profile_image_url: string
}

export interface DrinkRecord {
  user_id: string
  points: number
  drink_type: DrinkType
}

export interface CigaretteRecord {
  user_id: string
  count: number
}

export function calculateChampions(
  allDrinks: ReadonlyArray<DrinkRecord>,
  cigaretteCounts: ReadonlyArray<CigaretteRecord>,
) {
  const champions: Record<string, string> = {}

  for (const type of DRINK_TYPES) {
    const pointsByUser: Record<string, number> = {}

    for (const drink of allDrinks) {
      if (drink.drink_type === type) {
        pointsByUser[drink.user_id] = (pointsByUser[drink.user_id] || 0) + drink.points
      }
    }

    let championId = ""
    let maxPoints = 0

    for (const [userId, points] of Object.entries(pointsByUser)) {
      if (points > maxPoints) {
        championId = userId
        maxPoints = points
      }
    }

    if (championId && maxPoints > 0) {
      champions[type] = championId
    }
  }

  const cigaretteTotals: Record<string, number> = {}
  for (const cigarette of cigaretteCounts) {
    cigaretteTotals[cigarette.user_id] = (cigaretteTotals[cigarette.user_id] || 0) + cigarette.count
  }

  let cigaretteChampionId = ""
  let maxCigarettes = 0

  for (const [userId, count] of Object.entries(cigaretteTotals)) {
    if (count > maxCigarettes) {
      cigaretteChampionId = userId
      maxCigarettes = count
    }
  }

  if (cigaretteChampionId && maxCigarettes > 0) {
    champions.Cigarette = cigaretteChampionId
  }

  return champions
}

export function buildLeaderboard(
  users: ReadonlyArray<LeaderboardUserRecord>,
  allDrinks: ReadonlyArray<DrinkRecord>,
  cigaretteCounts: ReadonlyArray<CigaretteRecord>,
  filter: LeaderboardFilter,
): LeaderboardUser[] {
  const champions = calculateChampions(allDrinks, cigaretteCounts)

  const leaderboardUsers = users.map<LeaderboardUser>((user) => {
    let totalPoints = 0

    if (filter === "all") {
      totalPoints = allDrinks
        .filter((drink) => drink.user_id === user.id)
        .reduce((sum, drink) => sum + drink.points, 0)
    } else if (filter === "cigarettes") {
      totalPoints = cigaretteCounts
        .filter((cigarette) => cigarette.user_id === user.id)
        .reduce((sum, cigarette) => sum + cigarette.count, 0)
    } else {
      totalPoints = allDrinks
        .filter((drink) => drink.user_id === user.id && drink.drink_type === filter)
        .reduce((sum, drink) => sum + drink.points, 0)
    }

    const cigaretteCount = cigaretteCounts
      .filter((cigarette) => cigarette.user_id === user.id)
      .reduce((sum, cigarette) => sum + cigarette.count, 0)

    const userChampions = Object.entries(champions)
      .filter(([, championId]) => championId === user.id)
      .map(([type]) => type)

    return {
      id: user.id,
      username: user.username,
      image_url: user.profile_image_url,
      total_points: totalPoints,
      cigarette_count: cigaretteCount,
      rank: 0,
      champions: userChampions,
    }
  })

  const activeUsers = leaderboardUsers
    .filter((user) => user.total_points > 0)
    .sort((left, right) => right.total_points - left.total_points)

  activeUsers.forEach((user, index) => {
    user.rank = index + 1
  })

  return activeUsers
}
