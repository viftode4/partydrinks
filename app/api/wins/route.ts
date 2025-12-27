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

    const supabase = getSupabaseServerClient()

    // Add a win count
    const { data: win, error: winError } = await supabase
      .from("wins")
      .insert([
        {
          user_id: session.user.id,
          count: 1,
        },
      ])
      .select()
      .single()

    if (winError) {
      return NextResponse.json({ message: "Failed to add win" }, { status: 500 })
    }

    return NextResponse.json({ message: "Win added successfully", win }, { status: 201 })
  } catch (error) {
    console.error("Add win error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
