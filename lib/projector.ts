import type { LeaderboardUser } from "./types"

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
