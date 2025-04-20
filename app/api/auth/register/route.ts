import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password, profile_image_url } = await request.json()

    // Validate inputs
    if (!username || !password || !profile_image_url) {
      return NextResponse.json({ message: "Username, password, and profile image are required" }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ message: "Username already exists" }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password_hash: hashedPassword,
          profile_image_url,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    // Return success without sensitive data
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          profile_image_url: newUser.profile_image_url,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
