import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"
import { buildLeaderboard } from "@/lib/leaderboard"

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

    const leaderboard = buildLeaderboard(users ?? [], allDrinks ?? [], cigaretteCounts ?? [], drinkType as Parameters<typeof buildLeaderboard>[3])

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
