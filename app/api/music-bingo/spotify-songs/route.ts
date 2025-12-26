import { NextRequest, NextResponse } from "next/server"

// Hardcoded Spotify playlist ID - replace with your desired playlist
// TODO: Add your playlist ID from environment variables
const PLAYLIST_ID = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID || "37i9dQZF1DX4UtSsGT1Sbe" // Default to a public playlist for testing

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Missing or invalid authorization header" },
                { status: 401 }
            )
        }

        const accessToken = authHeader.substring(7)

        // Fetch playlist tracks from Spotify API
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=50`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json(
                    { error: "Invalid or expired access token" },
                    { status: 401 }
                )
            }
            if (response.status === 404) {
                return NextResponse.json(
                    { error: "Playlist not found. Check your NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID" },
                    { status: 404 }
                )
            }
            throw new Error(`Spotify API error: ${response.statusText}`)
        }

        const data = await response.json()

        // Transform Spotify tracks to our format
        const songs = data.items
            .map(
                (item: any) => ({
                    id: item.track.id,
                    uri: item.track.uri,
                    title: item.track.name,
                    artist: item.track.artists.map((a: any) => a.name).join(", "),
                    duration: item.track.duration_ms,
                    image: item.track.album.images[0]?.url,
                })
            )
            .filter((song: any) => song.id) // Filter out any tracks without IDs

        if (songs.length === 0) {
            return NextResponse.json(
                { error: "No songs found in the playlist" },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            songs,
            total: data.total,
            playlistId: PLAYLIST_ID,
        })
    } catch (error) {
        console.error("Error fetching playlist songs:", error)
        return NextResponse.json(
            { error: "Failed to fetch songs from Spotify" },
            { status: 500 }
        )
    }
}
