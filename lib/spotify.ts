// Spotify Web API configuration
// Use NEXT_PUBLIC_SPOTIFY_CLIENT_ID for client-side code (exposed at build time)
const SPOTIFY_CLIENT_ID = (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    : process.env.SPOTIFY_CLIENT_ID) || ""
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "" // server-only secret
// Use NEXT_PUBLIC_SPOTIFY_REDIRECT_URI if set, otherwise construct from window.location.origin
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${typeof window !== "undefined" ? window.location.origin : ""}/api/spotify/callback`

let accessToken: string | null = null

export async function getSpotifyAccessToken(): Promise<string> {
    if (accessToken) {
        return accessToken
    }

    // For server-side token exchange
    const response = await fetch("/api/spotify/token", {
        method: "POST",
    })

    if (!response.ok) {
        throw new Error("Failed to get Spotify access token")
    }

    const data = await response.json()
    if (data.access_token != null) {
        return data.access_token
    }

    throw new Error("No access token in response")
}

export function getSpotifyAuthUrl(): string {
    const scope = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
    ].join("%20")

    if (!SPOTIFY_CLIENT_ID) {
        throw new Error(
            "Missing Spotify client id. Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID for client-side auth or SPOTIFY_CLIENT_ID for server-side."
        )
    }

    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope,
    })

    return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export function setAccessToken(token: string) {
    accessToken = token
}

export function getClientId(): string {
    return SPOTIFY_CLIENT_ID
}
