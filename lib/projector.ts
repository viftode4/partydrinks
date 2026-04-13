import type { LeaderboardUser } from "./types"

export interface ProjectorBattleCallout {
  leader: LeaderboardUser
  challenger: LeaderboardUser
  gap: number
}

export interface ProjectorMomentumCallout {
  user: LeaderboardUser
  placesGained: number
}

export function mergeProjectorLeaderboardUsers(
  nextUsers: ReadonlyArray<Partial<LeaderboardUser> & { id: string; rank: number; image_url?: string; profile_image_url?: string }>,
  previousUsers: ReadonlyArray<LeaderboardUser>,
): LeaderboardUser[] {
  return nextUsers.map((user) => {
    const previousUser = previousUsers.find((existingUser) => existingUser.id === user.id)

    return {
      id: user.id,
      username: user.username || "",
      image_url: user.profile_image_url || user.image_url || "",
      total_points: user.total_points || 0,
      cigarette_count: user.cigarette_count || 0,
      rank: user.rank,
      previousRank: previousUser?.rank || user.rank,
      champions: user.champions || [],
    }
  })
}

export function limitProjectorTweets<T>(tweets: ReadonlyArray<T>, limit = 10): T[] {
  return tweets.slice(0, limit)
}

export function findClosestProjectorBattle(
  users: ReadonlyArray<LeaderboardUser>,
): ProjectorBattleCallout | null {
  if (users.length < 2) {
    return null
  }

  let bestBattle: ProjectorBattleCallout | null = null

  for (let index = 0; index < users.length - 1; index += 1) {
    const leader = users[index]
    const challenger = users[index + 1]
    const gap = Math.max(leader.total_points - challenger.total_points, 0)

    if (
      !bestBattle ||
      gap < bestBattle.gap ||
      (gap === bestBattle.gap && leader.rank < bestBattle.leader.rank)
    ) {
      bestBattle = { leader, challenger, gap }
    }
  }

  return bestBattle
}

export function findProjectorHotStreak(
  users: ReadonlyArray<LeaderboardUser>,
): ProjectorMomentumCallout | null {
  let bestRun: ProjectorMomentumCallout | null = null

  for (const user of users) {
    const previousRank = user.previousRank ?? user.rank
    const placesGained = Math.max(previousRank - user.rank, 0)

    if (placesGained === 0) {
      continue
    }

    if (
      !bestRun ||
      placesGained > bestRun.placesGained ||
      (placesGained === bestRun.placesGained && user.rank < bestRun.user.rank)
    ) {
      bestRun = { user, placesGained }
    }
  }

  return bestRun
}
