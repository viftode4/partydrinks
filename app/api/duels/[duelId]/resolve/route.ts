import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { validateDuelResolution } from "@/lib/duels"
import { loadPartyFeatureFlags } from "@/lib/feature-flags"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(
  request: NextRequest,
  { params }: { params: { duelId: string } },
) {
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

    const { duelId } = params
    const { winnerUserId, note = null } = await request.json()

    const { data: duel, error: duelError } = await supabase
      .from("duels")
      .select("*")
      .eq("id", duelId)
      .maybeSingle()

    if (duelError) {
      console.error("Resolve duel lookup error:", duelError)
      return NextResponse.json({ message: "Failed to load duel" }, { status: 500 })
    }

    if (!duel) {
      return NextResponse.json({ message: "Duel not found" }, { status: 404 })
    }

    const validation = validateDuelResolution({
      duel,
      actorUserId: session.user.id,
      winnerUserId,
    })

    if (!validation.ok) {
      return NextResponse.json({ message: validation.error }, { status: 409 })
    }

    const { data, error } = await supabase.rpc("resolve_duel", {
      p_duel_id: duelId,
      p_winner_id: winnerUserId,
      p_resolved_by: session.user.id,
      p_note: note,
    })

    if (error) {
      console.error("Resolve duel rpc error:", error)
      return NextResponse.json({ message: "Failed to resolve duel" }, { status: 500 })
    }

    return NextResponse.json({ duel: data })
  } catch (error) {
    console.error("Resolve duel error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
