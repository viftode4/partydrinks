"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

let spotifyScriptLoading = false

interface SpotifyPlayerProps {
  accessToken: string
  trackUri: string // e.g., "spotify:track:4cOdK2wGLETKBW3PvgPWqT"
}

export default function SpotifyPlayer({ accessToken, trackUri }: SpotifyPlayerProps) {
  const playerRef = useRef<Spotify.Player | null>(null)
  const deviceIdRef = useRef<string | null>(null)

  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedTrack, setQueuedTrack] = useState<string | null>(null)

  /* ------------------ Load Spotify SDK ------------------ */
  useEffect(() => {
    if (window.Spotify || spotifyScriptLoading) {
      console.log("ℹ️ Spotify SDK already loaded or loading")
      return
    }

    spotifyScriptLoading = true
    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true

    script.onload = () => console.log("✅ Spotify SDK script loaded")
    script.onerror = (err) => {
      console.error("❌ Failed to load Spotify SDK script", err)
      setError("Failed to load Spotify SDK")
    }

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("🚀 Spotify SDK Ready callback triggered")
      createPlayer()
    }
  }, [])

  /* ------------------ Create Player ------------------ */
  const createPlayer = () => {
    if (!window.Spotify) return
    if (!accessToken) {
      console.warn("⚠️ Missing access token")
      return
    }

    if (playerRef.current) {
      console.log("ℹ️ Player already exists")
      return
    }

    const player = new window.Spotify.Player({
      name: "Simple Web Player",
      getOAuthToken: (cb) => cb(accessToken),
      volume: 0.5,
    })

    playerRef.current = player

    player.addListener("ready", async ({ device_id }) => {
      console.log("🎧 Player ready with device_id:", device_id)
      deviceIdRef.current = device_id
      setReady(true)

      // Transfer playback to this device (paused)
      try {
        const res = await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        })
        console.log("🔁 Transfer playback response:", res.status)
      } catch (err) {
        console.error("❌ Transfer playback failed", err)
      }

      // Play queued track if there is one
      if (queuedTrack) {
        playTrack(queuedTrack)
        setQueuedTrack(null)
      }
    })

    player.addListener("player_state_changed", (state) => {
      if (!state) return
      setIsPlaying(!state.paused)
      console.log("📊 Player state changed:", state)
    })

    player.addListener("initialization_error", ({ message }) => setError(message))
    player.addListener("authentication_error", ({ message }) => setError(message))
    player.addListener("account_error", ({ message }) => setError(message))

    player.connect().then((success) => {
      console.log("🔌 Player connect success?", success)
    }).catch((err) => console.error("❌ Player connect failed:", err))
  }

  /* ------------------ Play Track ------------------ */
  const playTrack = async (uri: string) => {
    if (!deviceIdRef.current || !ready) {
      console.log("ℹ️ Device not ready yet, queuing track:", uri)
      setQueuedTrack(uri)
      return
    }

    try {
      console.log("▶️ Playing track:", uri)
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [uri] }),
        }
      )
      console.log("📥 /play response:", res.status)
    } catch (err) {
      console.error("❌ /play request failed", err)
    }
  }

  /* ------------------ Auto-play on trackUri change ------------------ */
  useEffect(() => {
    if (!trackUri) return
    playTrack(trackUri)
  }, [trackUri, ready])

  /* ------------------ Controls ------------------ */
  const handlePlay = () => {
    if (!trackUri) return
    playTrack(trackUri)
  }

  const handlePause = async () => {
    if (!deviceIdRef.current || !ready) {
      console.log("⚠️ Cannot pause, device not ready")
      return
    }
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceIdRef.current}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      console.log("⏸ /pause response:", res.status)
    } catch (err) {
      console.error("❌ /pause request failed", err)
    }
  }

  /* ------------------ UI ------------------ */
  return (
    <Card className="p-6 space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Spotify Web Player</h2>

      {!ready && <p className="text-sm">Connecting to Spotify…</p>}
      {error && <p className="text-sm text-red-500">⚠️ {error}</p>}

      <div className="flex gap-4">
        <Button onClick={handlePlay} disabled={!ready}>
          ▶️ Play
        </Button>
        <Button onClick={handlePause} disabled={!ready}>
          ⏸ Pause
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Status: {isPlaying ? "Playing" : "Paused"}
      </p>
    </Card>
  )
}
