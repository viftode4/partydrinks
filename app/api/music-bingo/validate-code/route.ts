import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, playedSongIds } = body

        // Code is a concatenation of Spotify song IDs (separated by commas)
        const codeIds = code
            .trim()
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0)

        if (codeIds.length !== 9) {
            return NextResponse.json(
                { success: false, error: `Code must contain exactly 9 song IDs, got ${codeIds.length}` },
                { status: 400 }
            )
        }

        // Check if all songs in the code were played
        const allPlayed = codeIds.every((id: string) => playedSongIds.includes(id))

        // Get the songs that were played but not in the code
        const missedSongs = playedSongIds.filter((id: string) => !codeIds.includes(id))

        return NextResponse.json({
            success: true,
            isValid: allPlayed,
            message: allPlayed
                ? "🎉 Winner! All songs in your code were played!"
                : `Sorry, not all songs match. You missed: ${missedSongs.join(", ")}`,
        })
    } catch (error) {
        console.error("Error validating code:", error)
        return NextResponse.json(
            { success: false, error: "Failed to validate code" },
            { status: 500 }
        )
    }
}
