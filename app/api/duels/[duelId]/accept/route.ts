import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { loadPartyFeatureFlags } from "@/lib/feature-flags"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ duelId: string }> },
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

    const { duelId } = await params
    const { data: duel, error: duelError } = await supabase
      .from("duels")
      .select("*")
      .eq("id", duelId)
      .maybeSingle()

    if (duelError) {
      console.error("Accept duel lookup error:", duelError)
      return NextResponse.json({ message: "Failed to load duel" }, { status: 500 })
    }

    if (!duel) {
      return NextResponse.json({ message: "Duel not found" }, { status: 404 })
    }

    if (duel.status !== "pending") {
      return NextResponse.json({ message: "Only pending duels can be accepted." }, { status: 409 })
    }

    if (duel.opponent_id !== session.user.id) {
      return NextResponse.json({ message: "Only the challenged player can accept this duel." }, { status: 403 })
    }

    const { data: acceptedDuel, error: acceptError } = await supabase
      .from("duels")
      .update({
        status: "active",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", duelId)
      .eq("status", "pending")
      .select()
      .single()

    if (acceptError) {
      console.error("Accept duel update error:", acceptError)
      return NextResponse.json({ message: "Failed to accept duel" }, { status: 500 })
    }

    return NextResponse.json({ duel: acceptedDuel })
  } catch (error) {
    console.error("Accept duel error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
