export interface User {
  id: string
  username: string
  profile_image_url: string
  email?: string
}

export interface Drink {
  id: string
  user_id: string
  drink_type: "Cocktail" | "Beer" | "Wine" | "Shot"
  points: number
  created_at: string
}

export interface Tweet {
  id: string
  content: string
  image_url: string | null
  created_at: string
  user_id: string
}

export interface TweetWithUser extends Tweet {
  user: User
  total_points: number
  win_count: number
}

export interface win {
  id: string
  user_id: string
  count: number
  created_at: string
}

export interface LeaderboardUser {
  id: string
  username: string
  image_url: string
  total_points: number
  win_count: number
  rank: number
  previousRank?: number
}

export interface DrinkPoints {
  drink_type: "Cocktail" | "Beer" | "Wine" | "Shot"
  points: number
}

export interface TweetLike {
  id: string
  user_id: string
  tweet_id: string
  created_at: string
}
