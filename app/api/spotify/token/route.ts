import { NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

// TODO: Add your Spotify credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ""
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ""

export async function POST(request: NextRequest) {
    try {
        if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
            return NextResponse.json(
                { error: "Spotify credentials not configured" },
                { status: 500 }
            )
        }

        // Get the authorization code from the request body or query
        const { code } = await request.json()

        if (!code) {
            // Return client credentials flow token for development
            const auth = Buffer.from(
                `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")

            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            })

            if (!response.ok) {
                throw new Error("Failed to get Spotify token")
            }

            const data = await response.json()
            return NextResponse.json({
                access_token: data.access_token,
                expires_in: data.expires_in,
            })
        }

        // Authorization code flow (for user authentication)
        const auth = Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")

        // Use the same redirect URI that was registered in Spotify Dashboard
        const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${request.nextUrl.origin}/api/spotify/callback`

        console.log("Token exchange attempt:", {
            redirectUri,
            code: code ? `${code.substring(0, 10)}...` : "missing",
        })

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        })

        const responseData = await response.json()

        if (!response.ok) {
            console.error("Spotify API error response:", {
                status: response.status,
                error: responseData.error,
                errorDescription: responseData.error_description,
            })
            throw new Error(`Spotify API error: ${responseData.error_description || responseData.error || "Unknown error"}`)
        }

        if (!responseData.access_token) {
            console.error("No access token in Spotify response:", responseData)
            throw new Error("No access token in Spotify response")
        }

        return NextResponse.json({
            access_token: responseData.access_token,
            refresh_token: responseData.refresh_token,
            expires_in: responseData.expires_in,
        })
    } catch (error) {
        console.error("Spotify token error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get Spotify token" },
            { status: 500 }
        )
    }
}
