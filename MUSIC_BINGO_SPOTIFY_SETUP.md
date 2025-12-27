# Music Bingo - Spotify Integration Setup Guide

## Overview
Music Bingo now uses the Spotify API and Web Playback SDK to stream real songs and track gameplay locally.

## Setup Instructions

### 1. Get Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app (if you haven't already)
3. Accept the terms and create the app
4. Copy your **Client ID** and **Client Secret**
5. In app settings, add a Redirect URI: `http://localhost:3000/api/spotify/callback` (for development)

### 2. Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Required: Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# Optional: Hardcoded Spotify Playlist ID (change your playlist)
NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID=37i9dQZF1DX4UtSsGT1Sbe
```

**How to get a Playlist ID:**
1. Open a Spotify playlist in your browser
2. Right-click and select "Share" > "Copy Spotify URI"
3. The ID is the last part after `spotify:playlist:`
   - Example: `spotify:playlist:37i9dQZF1DX4UtSsGT1Sbe` → ID is `37i9dQZF1DX4UtSsGT1Sbe`

### 3. File Structure

New files created for Spotify integration:

```
├── lib/
│   └── spotify.ts                          # Spotify auth utilities
├── app/api/spotify/
│   ├── token/route.ts                      # Token exchange endpoint
│   └── callback/route.ts                   # OAuth callback handler
├── app/api/music-bingo/
│   ├── spotify-songs/route.ts              # Fetch playlist songs
│   └── validate-code/route.ts              # Validate game code
├── app/(protected)/music-bingo/page.tsx    # Main game page
├── components/
│   ├── music-bingo-player.tsx              # Spotify song player
│   ├── music-bingo-cards.tsx               # Card display
│   └── music-bingo-code-input.tsx          # Code submission
└── types/spotify.d.ts                      # Spotify SDK types
```

## How It Works

### Authentication Flow
1. User clicks "Login with Spotify" on `/music-bingo`
2. User is redirected to Spotify's OAuth page
3. Spotify redirects back to `/api/spotify/callback` with auth code
4. We exchange the code for an access token
5. User is redirected back to game with token in URL

### Gameplay Flow
1. **Fetch Songs**: Playlist songs are fetched from Spotify API using access token
2. **Play Song**: Spotify Web Playback SDK plays each song
3. **Track Played**: When round ends, song ID is saved to sessionStorage
4. **Validate Code**: Player enters 9 song IDs → we verify they were all played
5. **Win Condition**: All 9 entered IDs must match the played songs

### Local Storage
- **sessionStorage** is used to track played song IDs during current session
- Clears when user closes the browser or navigates away
- Prevents cheating by storing actual Spotify track IDs

## Important Notes

⚠️ **Spotify Premium Required**
- The Web Playback SDK requires Spotify Premium to play tracks
- Free accounts will see an error when trying to play

🎵 **Playlist Requirements**
- Playlist must have at least 9 songs for a full game
- Public or private playlists work the same way
- You can change `NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID` to use different playlists

🔐 **Security**
- Client Secret should NEVER be exposed in client-side code
- It's only used server-side in `/api/spotify/token`
- Access tokens are short-lived and stored in sessionStorage

## Testing

1. Start the app: `npm run dev`
2. Navigate to `/music-bingo`
3. Click "Login with Spotify"
4. Authorize the app
5. Select songs and play the game

## Troubleshooting

**"Invalid or expired access token"**
- Token may have expired. Reload the page and re-authenticate

**"Playlist not found"**
- Check that `NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID` is correct
- Verify the playlist is public or you have access to it

**"Web Playback SDK not ready"**
- The Spotify SDK takes a moment to initialize
- Make sure you have an active Spotify Premium account

**Playlist has fewer than 9 songs**
- Change to a larger playlist or add more songs

## API Endpoints

### POST `/api/spotify/token`
Exchange authorization code for access token
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 3600
}
```

### GET `/api/spotify/callback`
OAuth callback handler (automatic)

### GET `/api/music-bingo/spotify-songs`
Fetch songs from hardcoded playlist
```json
{
  "success": true,
  "songs": [
    {
      "id": "spotify_track_id",
      "uri": "spotify:track:...",
      "title": "Song Name",
      "artist": "Artist Name",
      "duration": 240000,
      "image": "url"
    }
  ],
  "total": 50
}
```

### POST `/api/music-bingo/validate-code`
Validate the 9-song code
```json
{
  "code": "id1,id2,id3,...",
  "playedSongIds": ["id1", "id2", ...]
}
```

## Next Steps

1. Add more playlists (currently hardcoded to one)
2. Store game history in database
3. Add Spotify playback progress tracking
4. Implement leaderboard integration
5. Add multiplayer/party mode
