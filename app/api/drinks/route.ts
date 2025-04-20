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

    const { drink_type } = await request.json()

    if (!drink_type || !["Cocktail", "Beer", "Wine", "Shot"].includes(drink_type)) {
      return NextResponse.json({ message: "Invalid drink type" }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // Get the point value for this drink type
    const { data: drinkPoints, error: pointsError } = await supabase
      .from("drink_points")
      .select("points")
      .eq("drink_type", drink_type)
      .single()

    if (pointsError || !drinkPoints) {
      return NextResponse.json({ message: "Failed to get drink points" }, { status: 500 })
    }

    // Add the drink to the drinks table
    const { data: drink, error: drinkError } = await supabase
      .from("drinks")
      .insert([
        {
          user_id: session.user.id,
          drink_type,
          points: drinkPoints.points,
        },
      ])
      .select()
      .single()

    if (drinkError) {
      // Check if the error is due to a duplicate drink
      if (drinkError.message.includes('very recently')) {
        return NextResponse.json({ 
          message: "Please wait a moment before adding another drink of the same type" 
        }, { status: 429 })
      }
      return NextResponse.json({ message: "Failed to add drink" }, { status: 500 })
    }

    return NextResponse.json({ message: "Drink added successfully", drink }, { status: 201 })
  } catch (error) {
    console.error("Add drink error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
