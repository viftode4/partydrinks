import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { getSupabaseServerClient } from "@/lib/supabase"
import { authOptions } from "@/lib/auth"
import { buildUserStatsMap, formatTweetsWithStats, type RawTweetRecord } from "@/lib/tweets"

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

export async function GET() {
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

    const tweetRows = tweets as RawTweetRecord[]

    // Get unique user IDs from tweets
    const userIds = [...new Set(tweetRows.map((tweet) => tweet.user_id))]

    // Get total points for each user
    const { data: pointsData, error: pointsError } = await supabase
      .from("leaderboard")
      .select("user_id, total_points, cigarette_count")
      .in("user_id", userIds)

    if (pointsError) {
      console.error("Error fetching points data:", pointsError)
      return NextResponse.json({ message: "Failed to fetch user stats" }, { status: 500 })
    }

    const userStats = buildUserStatsMap(pointsData ?? [])
    const tweetsWithStats = formatTweetsWithStats(tweetRows, userStats)

    return NextResponse.json(tweetsWithStats)
  } catch (error) {
    console.error("Fetch tweets error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
