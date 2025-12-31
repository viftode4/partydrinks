import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"
import type { LeaderboardUser } from "@/lib/types"

const DRINK_TYPES = ["Beer", "Wine", "Cocktail", "Shot"] as const

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const drinkType = searchParams.get("drinkType") || "all"

    const supabase = getSupabaseServerClient()

    // Get all users
    const { data: users, error } = await supabase.from("users").select(`
        id,
        username,
        profile_image_url
      `)

    if (error) {
      console.error("Failed to fetch users:", error)
      return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
    }

    // Get all drinks with their types
    const { data: allDrinks, error: drinkError } = await supabase.from("drinks").select(`
        user_id,
        points,
        drink_type
      `)

    if (drinkError) {
      console.error("Failed to fetch drinks:", drinkError)
      return NextResponse.json({ message: "Failed to fetch drinks" }, { status: 500 })
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

    // Calculate champions for each drink type (who has most points in each category)
    const champions: Record<string, string> = {}
    for (const type of DRINK_TYPES) {
      const pointsByUser: Record<string, number> = {}
      allDrinks
        .filter((d) => d.drink_type === type)
        .forEach((d) => {
          pointsByUser[d.user_id] = (pointsByUser[d.user_id] || 0) + d.points
        })

      let maxPoints = 0
      let championId = ""
      for (const [userId, points] of Object.entries(pointsByUser)) {
        if (points > maxPoints) {
          maxPoints = points
          championId = userId
        }
      }
      if (championId && maxPoints > 0) {
        champions[type] = championId
      }
    }

    // Also find cigarette champion
    const cigByUser: Record<string, number> = {}
    cigaretteCounts.forEach((c) => {
      cigByUser[c.user_id] = (cigByUser[c.user_id] || 0) + c.count
    })
    let maxCigs = 0
    let cigChampion = ""
    for (const [userId, count] of Object.entries(cigByUser)) {
      if (count > maxCigs) {
        maxCigs = count
        cigChampion = userId
      }
    }
    if (cigChampion && maxCigs > 0) {
      champions["Cigarette"] = cigChampion
    }

    // Calculate points based on drinkType filter
    const leaderboardUsers: LeaderboardUser[] = users.map((user) => {
      let totalPoints = 0

      if (drinkType === "all") {
        // Sum all drink points
        const userDrinks = allDrinks.filter((d) => d.user_id === user.id)
        totalPoints = userDrinks.reduce((sum, d) => sum + d.points, 0)
      } else if (drinkType === "cigarettes") {
        // Use cigarette count as points for cigarette leaderboard
        const userCigs = cigaretteCounts.filter((c) => c.user_id === user.id)
        totalPoints = userCigs.reduce((sum, c) => sum + c.count, 0)
      } else {
        // Filter by specific drink type
        const userDrinks = allDrinks.filter((d) => d.user_id === user.id && d.drink_type === drinkType)
        totalPoints = userDrinks.reduce((sum, d) => sum + d.points, 0)
      }

      // Calculate cigarette count for display
      const userCigarettes = cigaretteCounts.filter((c) => c.user_id === user.id)
      const cigaretteCount = userCigarettes.reduce((sum, c) => sum + c.count, 0)

      // Get champion badges for this user
      const userChampions: string[] = []
      for (const [type, champId] of Object.entries(champions)) {
        if (champId === user.id) {
          userChampions.push(type)
        }
      }

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

    // Filter out users with 0 points for the selected category
    const activeUsers = leaderboardUsers.filter((u) => u.total_points > 0)

    // Sort by total points (descending)
    activeUsers.sort((a, b) => b.total_points - a.total_points)

    // Assign ranks
    activeUsers.forEach((user, index) => {
      user.rank = index + 1
    })

    return NextResponse.json(activeUsers)
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
