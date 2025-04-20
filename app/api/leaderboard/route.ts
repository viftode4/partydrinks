import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"
import type { LeaderboardUser } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeCigarettes = searchParams.get("includeCigarettes") === "true"

    const supabase = getSupabaseServerClient()

    // Get all users with their total drink points
    const { data: users, error } = await supabase.from("users").select(`
        id,
        username,
        profile_image_url
      `)

    if (error) {
      console.error("Failed to fetch users:", error)
      return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
    }

    // Get drink points for each user
    const { data: drinkPoints, error: drinkError } = await supabase.from("drinks").select(`
        user_id,
        points
      `)

    if (drinkError) {
      console.error("Failed to fetch drink points:", drinkError)
      return NextResponse.json({ message: "Failed to fetch drink points" }, { status: 500 })
    }

    // Get cigarette counts for each user
    const { data: cigaretteCounts, error: cigaretteError } = await supabase.from("cigarettes").select(`
        user_id,
        count
      `)

    if (cigaretteError) {
      console.error("Failed to fetch cigarette counts:", cigaretteError)
      return NextResponse.json({ message: "Failed to fetch cigarette counts" }, { status: 500 })
    }

    // Calculate total points and cigarette counts for each user
    const leaderboardUsers: LeaderboardUser[] = users.map((user) => {
      const userDrinks = drinkPoints.filter((drink) => drink.user_id === user.id)
      const totalPoints = userDrinks.reduce((sum, drink) => sum + drink.points, 0)

      const userCigarettes = cigaretteCounts.filter((cig) => cig.user_id === user.id)
      const cigaretteCount = userCigarettes.reduce((sum, cig) => sum + cig.count, 0)

      return {
        id: user.id,
        username: user.username,
        image_url: user.profile_image_url,
        total_points: totalPoints,
        cigarette_count: cigaretteCount,
        rank: 0, // Will be set after sorting
      }
    })

    console.log("API - Users before filtering:", JSON.stringify(leaderboardUsers, null, 2))

    // Filter users based on cigarette counts if specified
    const filteredUsers = includeCigarettes
      ? leaderboardUsers
      : leaderboardUsers.filter((user) => user.cigarette_count === 0)

    console.log("API - Users after filtering:", JSON.stringify(filteredUsers, null, 2))

    // Sort by total points (descending)
    filteredUsers.sort((a, b) => b.total_points - a.total_points)

    // Assign ranks
    filteredUsers.forEach((user, index) => {
      user.rank = index + 1
    })

    console.log("API - Final response:", JSON.stringify(filteredUsers, null, 2))
    return NextResponse.json(filteredUsers)
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
