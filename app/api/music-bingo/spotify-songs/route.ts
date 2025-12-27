import { NextRequest, NextResponse } from "next/server"

// Spotify playlist IDs
const PLAYLISTS = {
    playlist1: process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID || "37i9dQZF1DX4UtSsGT1Sbe",
    playlist2: process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID_2 || "37i9dQZF1DX4UtSsGT1Sbe",
    playlist3: process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID_3 || "37i9dQZF1DX4UtSsGT1Sbe",
}

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

        // Get playlist ID from query parameters, default to playlist1
        const { searchParams } = new URL(request.url)
        const playlistKey = (searchParams.get("playlist") || "playlist1") as keyof typeof PLAYLISTS

        if (!(playlistKey in PLAYLISTS)) {
            return NextResponse.json(
                { error: "Invalid playlist specified" },
                { status: 400 }
            )
        }

        const playlistId = PLAYLISTS[playlistKey]

        // Fetch playlist tracks from Spotify API
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
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
                    { error: `Playlist not found for ${playlistKey}. Check your environment variables.` },
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
            .sort((a, b) => a.id.localeCompare(b.id))

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
            playlistId: playlistId,
            playlistKey: playlistKey,
        })
    } catch (error) {
        console.error("Error fetching playlist songs:", error)
        return NextResponse.json(
            { error: "Failed to fetch songs from Spotify" },
            { status: 500 }
        )
    }
}
