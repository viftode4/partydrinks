import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { getSupabaseServerClient } from "@/lib/supabase"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { content, image_url } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ message: "Content is required" }, { status: 400 })
    }

    if (content.length > 300) {
      return NextResponse.json({ message: "Content is too long (300 characters max)" }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // Create new tweet
    const { data: tweet, error } = await supabase
      .from("tweets")
      .insert([
        {
          user_id: session.user.id,
          content,
          image_url,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating tweet:", error)
      return NextResponse.json({ message: "Failed to create tweet" }, { status: 500 })
    }

    return NextResponse.json({ message: "Tweet created successfully", tweet }, { status: 201 })
  } catch (error) {
    console.error("Create tweet error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

interface UserProfile {
  id: string;
  username: string;
  profile_image_url: string;
}

interface UserStats {
  [key: string]: {
    total_points: number;
    win_count: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()

    // Get all tweets with user data
    const { data: tweets, error } = await supabase
      .from("tweets")
      .select(`
        id,
        content,
        image_url,
        created_at,
        user_id,
        users:user_id (
          id,
          username,
          profile_image_url
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tweets:", error)
      return NextResponse.json({ message: "Failed to fetch tweets" }, { status: 500 })
    }

    if (!tweets || tweets.length === 0) {
      return NextResponse.json([])
    }

    // Format the tweets - handle the structure from Supabase
    const formattedTweets = tweets.map((tweet: any) => {
      // Supabase returns users as the first item in an array due to the join
      const userProfile = tweet.users as UserProfile
      
      return {
        id: tweet.id,
        content: tweet.content,
        image_url: tweet.image_url,
        created_at: tweet.created_at,
        user_id: tweet.user_id,
        user: userProfile,
        total_points: 0, // Will be updated below
        win_count: 0 // Will be updated below
      }
    })

    // Get unique user IDs from tweets
    const userIds = [...new Set(tweets.map((tweet: any) => tweet.user_id))]

    // Get total points for each user
    const { data: pointsData, error: pointsError } = await supabase
      .from("leaderboard")
      .select("user_id, total_points, win_count")
      .in("user_id", userIds)

    if (pointsError) {
      console.error("Error fetching points data:", pointsError)
      return NextResponse.json({ message: "Failed to fetch user stats" }, { status: 500 })
    }

    // Create a map of user stats
    const userStats: UserStats = {}
    pointsData?.forEach((item: any) => {
      if (item.user_id) {
        userStats[item.user_id] = {
          total_points: item.total_points || 0,
          win_count: item.win_count || 0
        }
      }
    })

    // Update each tweet with the user's stats
    const tweetsWithStats = formattedTweets.map(tweet => {
      const stats = userStats[tweet.user_id] || { total_points: 0, win_count: 0 }
      return {
        ...tweet,
        total_points: stats.total_points,
        win_count: stats.win_count
      }
    })

    return NextResponse.json(tweetsWithStats)
  } catch (error) {
    console.error("Fetch tweets error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
