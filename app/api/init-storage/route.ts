import { type NextRequest, NextResponse } from "next/server"
import { ensureStorageBuckets } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    await ensureStorageBuckets()
    return NextResponse.json({ message: "Storage buckets initialized successfully" })
  } catch (error) {
    console.error("Error initializing storage buckets:", error)
    return NextResponse.json({ message: "Failed to initialize storage buckets" }, { status: 500 })
  }
} 