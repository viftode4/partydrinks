"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import SpotifyPlayer from "@/components/SpotifyPlayer"
import { Loader2, Music } from "lucide-react"
import { getSpotifyAuthUrl } from "@/lib/spotify"

interface Song {
    id: string
    uri: string
    title: string
    artist: string
    duration: number
    image?: string
}

const PLAYLISTS = {
    playlist1: { label: "🎵 Oldies", color: "bg-blue-600 hover:bg-blue-700" },
    playlist2: { label: "🇷🇴 Romanian", color: "bg-purple-600 hover:bg-purple-700" },
    playlist3: { label: "🎁 BONUS!?!?", color: "bg-pink-600 hover:bg-pink-700" },
}

export default function MusicBingoPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [accessToken, setAccessToken] = useState<string>("")
    const [songs, setSongs] = useState<Song[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
            return
        }

        const token = searchParams.get("access_token")
        if (token) {
            setAccessToken(token)
            window.history.replaceState({}, document.title, "/music-bingo")
        }
    }, [status, router, searchParams])

    const fetchSongs = async (token: string) => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch("/api/music-bingo/spotify-songs", {
                headers: { Authorization: `Bearer ${token}` },
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setError(data.error || "Failed to fetch songs")
                return
            }

            setSongs(data.songs)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch songs")
        } finally {
            setLoading(false)
        }
    }

    const loadPlaylist = async (playlistKey: keyof typeof PLAYLISTS) => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(`/api/music-bingo/spotify-songs?playlist=${playlistKey}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setError(data.error || "Failed to fetch songs")
                return
            }

            setSongs(data.songs)
            setSelectedPlaylist(playlistKey)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch songs")
        } finally {
            setLoading(false)
        }
    }

    const handleSpotifyLogin = () => {
        const authUrl = getSpotifyAuthUrl()
        window.location.href = authUrl
    }

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
                <p className="text-white mt-4">Loading...</p>
            </div>
        )
    }

    if (status === "unauthenticated") return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-6 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-white mb-6">🎵 Music Bingo</h1>

            {error && (
                <Card className="p-4 bg-red-500 text-white mb-6">
                    <p className="font-semibold">Error: {error}</p>
                </Card>
            )}

            {!accessToken ? (
                <Card className="p-12 bg-white text-center space-y-6 mb-6">
                    <Music className="h-16 w-16 mx-auto text-green-500" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Connect with Spotify
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Authenticate with Spotify to play Music Bingo.
                    </p>
                    <Button
                        onClick={handleSpotifyLogin}
                        size="lg"
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                        <Music className="h-5 w-5 mr-2" />
                        Login with Spotify
                    </Button>
                </Card>
            ) : songs.length === 0 ? (
                <div className="w-full max-w-2xl space-y-6">
                    {loading && (
                        <div className="text-center text-white">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p>Loading playlist...</p>
                        </div>
                    )}

                    {!loading && (
                        <>
                            <div className="text-center text-white space-y-2">
                                <p className="text-lg">Select a playlist to start</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {Object.entries(PLAYLISTS).map(([key, { label, color }]) => (
                                    <Button
                                        key={key}
                                        onClick={() => loadPlaylist(key as keyof typeof PLAYLISTS)}
                                        size="lg"
                                        className={`h-32 text-lg ${color}`}
                                        disabled={loading}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="w-full">
                    <div className="max-w-2xl mx-auto mb-6">
                        <Button
                            onClick={() => {
                                setSongs([])
                                setSelectedPlaylist(null)
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            ← Back to Playlist Selection
                        </Button>
                    </div>
                    <SpotifyPlayer
                        accessToken={accessToken}
                        songs={songs}
                        hideInfo={true}
                        playlistId={selectedPlaylist || undefined}
                    />
                </div>
            )}
        </div>
    )
}
