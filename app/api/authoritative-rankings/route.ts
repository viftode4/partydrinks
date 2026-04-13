import { NextResponse } from "next/server"

import { buildAuthoritativeRankings } from "@/lib/authoritative-rankings"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from("authoritative_rankings")
      .select("*")

    if (error) {
      console.error("Authoritative rankings error:", error)
      return NextResponse.json({ message: "Failed to load authoritative rankings" }, { status: 500 })
    }

    return NextResponse.json(buildAuthoritativeRankings(data ?? []))
  } catch (error) {
    console.error("Authoritative rankings route error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
