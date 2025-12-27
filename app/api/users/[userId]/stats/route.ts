import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { getSupabaseServerClient } from "@/lib/supabase"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params

    // Only allow users to view their own stats
    if (userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const supabase = getSupabaseServerClient()

    // Get user's total points and win count from leaderboard
    const { data: leaderboardStats, error: leaderboardError } = await supabase
      .from("leaderboard")
      .select("total_points, win_count")
      .eq("user_id", userId)
      .single()

    if (leaderboardError) {
      console.error("Error fetching leaderboard stats:", leaderboardError)
      return NextResponse.json({ message: "Failed to fetch user stats" }, { status: 500 })
    }

    // Get drink types and counts
    const { data: drinks, error: drinksError } = await supabase
      .from("drinks")
      .select("drink_type")
      .eq("user_id", userId)

    if (drinksError) {
      console.error("Error fetching drinks:", drinksError)
      return NextResponse.json({ message: "Failed to fetch drinks" }, { status: 500 })
    }

    // Calculate drink types
    const drinkTypes = drinks.reduce((acc: { [key: string]: number }, drink) => {
      acc[drink.drink_type] = (acc[drink.drink_type] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      totalPoints: leaderboardStats?.total_points || 0,
      totalDrinks: drinks?.length || 0,
      winCount: leaderboardStats?.win_count || 0,
      drinkTypes
    })
  } catch (error) {
    console.error("Fetch user stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
