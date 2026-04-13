import { NextResponse } from "next/server"

import { loadPartyFeatureFlags } from "@/lib/feature-flags"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    const flags = await loadPartyFeatureFlags(async () => {
      const { data, error } = await supabase.from("party_feature_flags").select("key, enabled")

      if (error) {
        throw error
      }

      return data ?? []
    })

    return NextResponse.json(flags)
  } catch (error) {
    console.error("Feature flags error:", error)
    return NextResponse.json({ message: "Failed to load party feature flags" }, { status: 500 })
  }
}
