"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

let spotifyScriptLoading = false

interface Song {
    id: string
    uri: string
    title: string
    artist: string
    duration: number
    image?: string
}

interface SpotifyPlayerProps {
    accessToken: string
    songs: Song[]
    hideInfo?: boolean
    playlistId?: string
}

// Randomizing the song list will break the checkBingo logic,
// so we iterate "randomly" over all lists using a math trick
function isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function randomPrimeAbove(minValue: number): number {
    let num = Math.floor(Math.random() * 1000000) + minValue + 1;
    while (!isPrime(num)) {
        num++;
    }
    return num;
}

export default function SpotifyPlayer({ accessToken, songs, hideInfo, playlistId }: SpotifyPlayerProps) {
    const playerRef = useRef<Spotify.Player | null>(null)
    const deviceIdRef = useRef<string | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)
    const randomNumberRef = useRef<number>(randomPrimeAbove(50))

    const [ready, setReady] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [queuedTrack, setQueuedTrack] = useState<Song | null>(null)
    const [songFinished, setSongFinished] = useState(false)
    const [timeLeft, setTimeLeft] = useState<number>(0)

    // New: track played songs
    const [playedSongs, setPlayedSongs] = useState<string[]>([])

    // New: admin input for username and bingo result
    const [username, setUsername] = useState("")
    const [bingoResult, setBingoResult] = useState<string | null>(null)
    const randomNumber = randomNumberRef.current

    /* ------------------ Load Spotify SDK ------------------ */
    useEffect(() => {
        if (window.Spotify || spotifyScriptLoading) return

        spotifyScriptLoading = true
        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        script.async = true

        script.onload = () => console.log("✅ Spotify SDK script loaded")
        script.onerror = (err) => {
            console.error("❌ Failed to load Spotify SDK", err)
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
        if (!window.Spotify || !accessToken || playerRef.current) return

        const player = new window.Spotify.Player({
            name: "Timed Web Player",
            getOAuthToken: (cb) => cb(accessToken),
            volume: 0.5,
        })

        playerRef.current = player

        player.addListener("ready", async ({ device_id }) => {
            deviceIdRef.current = device_id
            setReady(true)

            try {
                await fetch("https://api.spotify.com/v1/me/player", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ device_ids: [device_id], play: false }),
                })
            } catch (err) {
                console.error("❌ Transfer playback failed", err)
            }

            if (queuedTrack) {
                playTrack(queuedTrack)
                setQueuedTrack(null)
            }
        })

        player.addListener("player_state_changed", (state) => {
            if (!state) return
            setIsPlaying(!state.paused)
        })

        player.addListener("initialization_error", ({ message }) => setError(message))
        player.addListener("authentication_error", ({ message }) => setError(message))
        player.addListener("account_error", ({ message }) => setError(message))

        player.connect().then((success) => console.log("🔌 Player connect success?", success))
    }

    /* ------------------ Play Track with Timer ------------------ */
    const playTrack = async (song: Song) => {
        if (!deviceIdRef.current || !ready) {
            setQueuedTrack(song)
            return
        }

        clearTimeout(timerRef.current)
        clearInterval(countdownRef.current)
        setSongFinished(false)

        try {
            await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ uris: [song.uri] }),
                }
            )
            setIsPlaying(true)

            // Track played songs
            setPlayedSongs((prev) => [...prev, song.id])
            console.log(playedSongs)

            // Random duration 45–60 seconds
            const duration = Math.floor(Math.random() * 16 + 45)
            setTimeLeft(duration)

            // Countdown every second
            countdownRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current!)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            // Stop playback after duration
            timerRef.current = setTimeout(async () => {
                await fetch(
                    `https://api.spotify.com/v1/me/player/pause?device_id=${deviceIdRef.current}`,
                    { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` } }
                )
                setIsPlaying(false)
                setSongFinished(true)
            }, duration * 1000)
        } catch (err) {
            console.error("❌ /play request failed", err)
        }
    }

    /* ------------------ Auto-play current song ------------------ */
    useEffect(() => {
        if (!ready || !songs?.length) return
        const currentSong = songs[currentIndex]
        if (!currentSong) return
        playTrack(currentSong)
    }, [currentIndex, ready, songs])

    /* ------------------ Controls ------------------ */
    const handlePlay = () => {
        const currentSong = songs?.[currentIndex]
        if (!currentSong) return
        playTrack(currentSong)
    }

    const handlePause = async () => {
        if (!deviceIdRef.current || !ready) return
        clearTimeout(timerRef.current)
        clearInterval(countdownRef.current)
        try {
            await fetch(
                `https://api.spotify.com/v1/me/player/pause?device_id=${deviceIdRef.current}`,
                { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` } }
            )
            setIsPlaying(false)
        } catch (err) {
            console.error("❌ /pause failed", err)
        }
    }

    const handleNext = () => {
        if (!songs?.length) return
        clearTimeout(timerRef.current)
        clearInterval(countdownRef.current)
        setCurrentIndex((prev) => (prev - songs.length + randomNumber) % songs.length)
    }

    const handlePrev = () => {
        if (!songs?.length) return
        clearTimeout(timerRef.current)
        clearInterval(countdownRef.current)
        setCurrentIndex((prev) => (prev - randomNumber) % songs.length + songs.length)
    }

    /* ------------------ Admin Bingo Check ------------------ */
    const checkBingo = () => {
        if (!username) return
        const seed = username + playlistId
        const selected = selectDeterministicSongs(songs, seed)
        const ids = selected.map((s) => s.id)

        const marked = ids.map((id) => playedSongs.includes(id) ? 1 : 0)

        const rows = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
        ]
        const cols = [
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
        ]
        const diags = [
            [0, 4, 8],
            [2, 4, 6],
        ]

        const isFullBingo = marked.every((v) => v === 1)
        const hasLine = [...rows, ...cols, ...diags].some((line) =>
            line.every((i) => marked[i] === 1)
        )

        console.log(marked)

        if (isFullBingo) setBingoResult("🎉 FULL BINGO!")
        else if (hasLine) setBingoResult("✅ Line achieved!")
        else setBingoResult("❌ No line yet")
    }

    const selectDeterministicSongs = (allSongs: Song[], seed: string): Song[] => {
        let hash = 0
        console.log(seed)
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash
        }
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

    /* ------------------ UI ------------------ */
    const currentSong = songs?.[currentIndex]

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-6">
            <Card className="p-12 space-y-6 w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-center">Spotify Web Player</h2>

                {!ready && <p className="text-lg text-center">Connecting to Spotify…</p>}
                {error && <p className="text-lg text-red-500 text-center">⚠️ {error}</p>}

                {currentSong && !hideInfo && (
                    <div className="space-y-2 text-center">
                        {currentSong.image && (
                            <img
                                src={currentSong.image}
                                alt={currentSong.title}
                                className="w-64 h-64 mx-auto rounded-lg shadow-lg object-cover"
                            />
                        )}
                        <p className="text-2xl font-bold">{currentSong.title}</p>
                        <p className="text-lg text-gray-600">{currentSong.artist}</p>
                    </div>
                )}

                <div className="flex gap-4 flex-wrap justify-center">
                    <Button onClick={handlePrev} disabled={!ready || !songs?.length} size="lg" className="text-lg px-6 py-6">
                        ⏮️ Prev
                    </Button>
                    <Button onClick={handlePlay} disabled={!ready || !currentSong} size="lg" className="text-lg px-6 py-6">
                        ▶️ Play
                    </Button>
                    <Button onClick={handlePause} disabled={!ready} size="lg" className="text-lg px-6 py-6">
                        ⏸ Pause
                    </Button>
                    <Button onClick={handleNext} disabled={!ready || !songs?.length} size="lg" className="text-lg px-6 py-6">
                        ⏭️ Next
                    </Button>
                </div>

                {songFinished && <p className="text-2xl font-bold text-green-500 text-center">✅ Song finished playing</p>}
                {isPlaying && <p className="text-4xl font-bold text-blue-500 text-center">⏱ {timeLeft}s left</p>}

                <p className="text-lg text-muted-foreground text-center">
                    Status: {isPlaying ? "Playing" : "Paused"}
                </p>

                {/* Admin input for bingo */}
                <div className="mt-6 space-y-2 text-center">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username to check bingo"
                        className="border rounded px-2 py-1 w-full max-w-xs"
                    />
                    <Button onClick={checkBingo} disabled={!username} className="w-full max-w-xs">
                        Check Bingo
                    </Button>
                    {bingoResult && <p className="mt-2 font-bold text-lg">{bingoResult}</p>}
                </div>
            </Card>
        </div>
    )
}
