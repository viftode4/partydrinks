"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import SpotifyPlayer from "@/components/SpotifyPlayer"
import { Loader2, Music } from "lucide-react"
import { getSpotifyAuthUrl } from "@/lib/spotify"

/* ---------------- Types ---------------- */

interface Song {
  id: string
  uri: string
  title: string
  artist: string
  duration: number
  image?: string
}

type GameState = "auth" | "loading" | "playing" | "round-menu"

/* ---------------- Page ---------------- */

export default function MusicBingoPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [accessToken, setAccessToken] = useState<string>("")
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [round, setRound] = useState(1)
  const [gameState, setGameState] = useState<GameState>("auth")
  const [error, setError] = useState<string | null>(null)

  /* ---------------- Auth Guard ---------------- */

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  /* ---------------- Read Token from URL ---------------- */

  useEffect(() => {
    const token = searchParams.get("access_token")
    if (!token) return

    setAccessToken(token)
    window.history.replaceState({}, document.title, "/music-bingo")
    fetchSongs(token)
  }, [searchParams])

  /* ---------------- Fetch Songs ---------------- */

  const fetchSongs = async (token: string) => {
    try {
      setGameState("loading")

      const res = await fetch("/api/music-bingo/spotify-songs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch songs")
      }

      const data = await res.json()
      setSongs(data.songs)

      startNewRound(data.songs)
    } catch (err) {
      setError("Failed to load songs")
      setGameState("auth")
    }
  }

  /* ---------------- Game Logic ---------------- */

  const startNewRound = (songList: Song[]) => {
    const randomSong =
      songList[Math.floor(Math.random() * songList.length)]

    setCurrentSong(randomSong)
    setGameState("playing")
  }

  const handleTimeUp = () => {
    setGameState("round-menu")
  }

  const handleNextRound = () => {
    setRound((r) => r + 1)
    startNewRound(songs)
  }

  const handleSpotifyLogin = () => {
    window.location.href = getSpotifyAuthUrl()
  }

  /* ---------------- Render ---------------- */

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold">🎵 Music Bingo</h1>
          <p className="opacity-90">
            {gameState === "auth" && "Connect with Spotify to play"}
            {gameState === "loading" && "Loading songs…"}
            {gameState === "playing" && `Round ${round}`}
            {gameState === "round-menu" && "Time’s up!"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <Card className="p-4 bg-red-500 text-white">
            {error}
          </Card>
        )}

        {/* Auth */}
        {gameState === "auth" && (
          <Card className="p-8 text-center space-y-4">
            <Music className="mx-auto h-12 w-12 text-green-500" />
            <Button
              onClick={handleSpotifyLogin}
              className="bg-green-500 text-white w-full"
            >
              Login with Spotify
            </Button>
          </Card>
        )}

        {/* Loading */}
        {gameState === "loading" && (
          <Card className="p-8 text-center">
            <Loader2 className="animate-spin mx-auto" />
          </Card>
        )}

        {/* Player (ALWAYS mounted once token exists) */}
        {accessToken && (
          <SpotifyPlayer
            accessToken={accessToken}
            trackUri={currentSong?.uri ?? ""}
          />
        )}

        {/* Round Menu */}
        {gameState === "round-menu" && (
          <Card className="p-6 space-y-4 text-center">
            <p className="text-lg font-semibold">
              Round complete
            </p>
            <Button onClick={handleNextRound}>
              Next Round
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
