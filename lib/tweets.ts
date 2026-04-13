export interface TweetUserRecord {
  id: string
  username: string
  profile_image_url: string
}

export interface RawTweetRecord {
  id: string
  content: string
  image_url: string | null
  created_at: string
  user_id: string
  users?: TweetUserRecord | TweetUserRecord[] | null
}

export interface UserStatsRecord {
  user_id: string | null
  total_points: number | null
  cigarette_count: number | null
}

export interface TweetStats {
  total_points: number
  cigarette_count: number
}

export interface FormattedTweet extends Omit<RawTweetRecord, "users"> {
  user: TweetUserRecord
  total_points: number
  cigarette_count: number
}

export function normalizeTweetUser(user: RawTweetRecord["users"], fallbackUserId: string): TweetUserRecord {
  if (Array.isArray(user)) {
    const firstUser = user[0]
    if (firstUser) {
      return firstUser
    }
  }

  if (user && !Array.isArray(user)) {
    return user
  }

  return {
    id: fallbackUserId,
    username: "Unknown",
    profile_image_url: "",
  }
}

export function buildUserStatsMap(pointsData: ReadonlyArray<UserStatsRecord>): Record<string, TweetStats> {
  return pointsData.reduce<Record<string, TweetStats>>((stats, item) => {
    if (item.user_id) {
      stats[item.user_id] = {
        total_points: item.total_points ?? 0,
        cigarette_count: item.cigarette_count ?? 0,
      }
    }

    return stats
  }, {})
}

export function formatTweetsWithStats(
  tweets: ReadonlyArray<RawTweetRecord>,
  userStats: Record<string, TweetStats>,
): FormattedTweet[] {
  return tweets.map((tweet) => {
    const stats = userStats[tweet.user_id] || { total_points: 0, cigarette_count: 0 }

    return {
      id: tweet.id,
      content: tweet.content,
      image_url: tweet.image_url,
      created_at: tweet.created_at,
      user_id: tweet.user_id,
      user: normalizeTweetUser(tweet.users, tweet.user_id),
      total_points: stats.total_points,
      cigarette_count: stats.cigarette_count,
    }
  })
}
