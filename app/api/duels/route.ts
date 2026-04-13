import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { getDuelPairFilter, validateDuelChallenge } from "@/lib/duels"
import { loadPartyFeatureFlags } from "@/lib/feature-flags"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from("duels")
      .select("*")
      .or(`challenger_id.eq.${session.user.id},opponent_id.eq.${session.user.id}`)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("List duels error:", error)
      return NextResponse.json({ message: "Failed to load duels" }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error("Duels GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseServerClient()
    const flags = await loadPartyFeatureFlags(async () => {
      const { data, error } = await supabase.from("party_feature_flags").select("key, enabled")
      if (error) {
        throw error
      }

      return data ?? []
    })

    if (!flags.duels) {
      return NextResponse.json({ message: "Duels are currently disabled by the host." }, { status: 409 })
    }

    const { opponentId, wagerPoints = 5, note = null } = await request.json()
    const validationError = validateDuelChallenge({
      challengerId: session.user.id,
      opponentId,
      wagerPoints,
    })

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 })
    }

    const { data: opponent, error: opponentError } = await supabase
      .from("users")
      .select("id")
      .eq("id", opponentId)
      .maybeSingle()

    if (opponentError) {
      console.error("Opponent lookup error:", opponentError)
      return NextResponse.json({ message: "Failed to validate the challenged player" }, { status: 500 })
    }

    if (!opponent) {
      return NextResponse.json({ message: "Opponent not found" }, { status: 404 })
    }

    const { data: existingDuels, error: existingDuelsError } = await supabase
      .from("duels")
      .select("id")
      .or(getDuelPairFilter(session.user.id, opponentId))
      .in("status", ["pending", "active"])
      .limit(1)

    if (existingDuelsError) {
      console.error("Existing duel lookup error:", existingDuelsError)
      return NextResponse.json({ message: "Failed to validate duel availability" }, { status: 500 })
    }

    if ((existingDuels ?? []).length > 0) {
      return NextResponse.json({ message: "There is already an open duel between these players." }, { status: 409 })
    }

    const { data: duel, error: createError } = await supabase
      .from("duels")
      .insert({
        challenger_id: session.user.id,
        opponent_id: opponentId,
        wager_points: wagerPoints,
        metadata: note ? { note } : {},
      })
      .select()
      .single()

    if (createError) {
      console.error("Create duel error:", createError)
      return NextResponse.json({ message: "Failed to create duel" }, { status: 500 })
    }

    return NextResponse.json({ duel }, { status: 201 })
  } catch (error) {
    console.error("Duels POST error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
