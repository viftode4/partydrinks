"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { MusicBingoSimple } from "@/components/music-bingo-simple"
import { MobileNav } from "@/components/mobile-nav"
import { Loader2, Home } from "lucide-react"

interface Song {
    id: string
    uri: string
    title: string
    artist: string
    image?: string
}

const PLAYLISTS = {
    playlist1: process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID || "", // Replace with actual ID
    playlist2: process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID_2 || "", // Replace with actual ID
    playlist3: process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID_3 || "", // Replace with actual ID
}

export default function MusicBingoPublicPage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [songs, setSongs] = useState<Song[]>([])
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
    const [accessToken, setAccessToken] = useState<string>("")
    const [error, setError] = useState<string | null>(null)

    // Get a persistent access token for playlist fetching
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch("/api/spotify/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                })

                const data = await response.json()
                if (data.access_token) {
                    setAccessToken(data.access_token)
                }
            } catch (err) {
                console.error("Failed to get access token:", err)
                setError("Failed to initialize. Try refreshing.")
            }
        }

        fetchToken()
    }, [])

    const selectDeterministicSongs = (allSongs: Song[], seed: string): Song[] => {
        // Use username/date as seed for deterministic shuffle
        console.log(seed)
        let hash = 0
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32bit integer
        }

        // Pseudo-random shuffle using seeded generator
        const shuffled = [...allSongs]
        let random = Math.abs(hash) % 1000000

        for (let i = shuffled.length - 1; i > 0; i--) {
            random = (random * 9301 + 49297) % 233280
            const j = Math.floor((random / 233280) * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        const shuf = shuffled.slice(0, 9)
        console.log(shuf)
        return shuf
    }

    const loadPlaylist = async (playlistKey: keyof typeof PLAYLISTS) => {
        setLoading(true)
        setError(null)

        try {
            if (!accessToken) {
                setError("Access token not ready. Try refreshing.")
                setLoading(false)
                return
            }

            const playlistId = PLAYLISTS[playlistKey]

            if (playlistId.includes("PLAYLIST_ID")) {
                setError(`Configure ${playlistKey} playlist ID in the page code.`)
                setLoading(false)
                return
            }

            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.statusText}`)
            }

            const data = await response.json()

            const allSongs: Song[] = data.items
                .map((item: any) => ({
                    id: item.track.id,
                    uri: item.track.uri,
                    title: item.track.name,
                    artist: item.track.artists.map((a: any) => a.name).join(", "),
                    image: item.track.album.images[0]?.url,
                }))
                .filter((song: Song) => song.id)
                .sort((a, b) => a.id.localeCompare(b.id))

            // Select 9 songs deterministically based on user
            // the + playlistKey makes the hash different for each playlist
            const seed = (session?.user?.name || session?.user?.email || new Date().toDateString()) + playlistKey
            const selected = selectDeterministicSongs(allSongs, seed)

            setSongs(selected)
            setSelectedPlaylist(playlistKey)
        } catch (err) {
            console.error("Error loading playlist:", err)
            setError("Failed to load playlist. Check console.")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p>Loading playlist...</p>
                </div>
            </div>
        )
    }

    if (songs.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
                <div className="max-w-2xl mx-auto space-y-8 pt-20">
                    <div className="text-center text-white space-y-2">
                        <h1 className="text-4xl font-bold">Music Bingo</h1>
                        <p className="text-lg">Select a playlist to start</p>
                    </div>

                    {error && (
                        <Card className="p-4 bg-red-100 border-red-300">
                            <p className="text-red-700 text-sm">{error}</p>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button
                            onClick={() => loadPlaylist("playlist1")}
                            size="lg"
                            className="h-32 text-lg bg-blue-600 hover:bg-blue-700"
                            disabled={!accessToken}
                        >
                            🎵 Oldies
                        </Button>
                        <Button
                            onClick={() => loadPlaylist("playlist2")}
                            size="lg"
                            className="h-32 text-lg bg-red-600 hover:bg-red-700"
                            disabled={!accessToken}
                        >
                            🇷🇴 Romanian
                        </Button>
                        <Button
                            onClick={() => loadPlaylist("playlist3")}
                            size="lg"
                            className="h-32 text-lg bg-yellow-600 hover:bg-yellow-700"
                            disabled={!accessToken}
                        >
                            🎁 BONUS!?!?
                        </Button>
                    </div>

                    {!accessToken && (
                        <Card className="p-4 bg-yellow-100 border-yellow-300">
                            <p className="text-yellow-700 text-sm">Loading... please wait a moment</p>
                        </Card>
                    )}
                </div>
                <MobileNav />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="sticky top-0 bg-white shadow p-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Music Bingo - {selectedPlaylist?.toUpperCase()}</h1>
                        <p className="text-sm text-gray-600">{songs.length} songs loaded</p>
                    </div>
                    <Button onClick={() => setSongs([])}>Back to Playlist Selection</Button>
                </div>

                {accessToken && <MusicBingoSimple songs={songs} accessToken={accessToken} />}
            </div>
            <MobileNav />
        </div>
    )
}
