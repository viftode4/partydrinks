import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const code = request.nextUrl.searchParams.get("code")
        const error = request.nextUrl.searchParams.get("error")

        if (error) {
            return NextResponse.redirect(
                new URL(`/music-bingo-public?error=${error}`, request.url)
            )
        }

        if (!code) {
            return NextResponse.redirect(
                new URL("/music-bingo?error=no_code", request.url)
            )
        }

        // Exchange code for token
        const tokenResponse = await fetch(
            new URL("/api/spotify/token", request.url),
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            }
        )

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error("Token exchange failed:", errorData)
            return NextResponse.redirect(
                new URL(`/music-bingo?error=token_exchange_failed`, request.url)
            )
        }

        const tokenData = await tokenResponse.json()
        if (!tokenData.access_token) {
            console.error("No access token in response:", tokenData)
            return NextResponse.redirect(
                new URL(`/music-bingo?error=no_access_token`, request.url)
            )
        }

        // Redirect back to music bingo with the token
        const redirectUrl = new URL("/music-bingo", request.url)
        redirectUrl.searchParams.set("access_token", tokenData.access_token)
        if (tokenData.refresh_token) {
            redirectUrl.searchParams.set("refresh_token", tokenData.refresh_token)
        }

        return NextResponse.redirect(redirectUrl)
    } catch (error) {
        console.error("Callback error:", error)
        return NextResponse.redirect(
            new URL("/music-bingo?error=callback_error", request.url)
        )
    }
}
