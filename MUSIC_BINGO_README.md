# Music Bingo Feature Documentation

## Overview
Music Bingo is a new party game feature that challenges players to identify songs by listening to them for exactly 1 minute each, then entering the song IDs they remember into a code to win.

## Feature Breakdown

### 1. Game Flow
- **Playlist Selection**: Player chooses from 3 different playlists (80s Hits, 90s Classics, 2000s Pop)
- **9 Rounds of Listening**: Each round plays a random song for 60 seconds
- **Song Tracking**: The short ID of each played song is recorded (e.g., s001, s102, s209)
- **Code Entry**: After 9 rounds, player enters all 9 song IDs separated by commas
- **Validation**: The system checks if all entered song IDs match songs that were actually played
- **Results**: Win or continue playing

### 2. Key Components

#### API Endpoints
- **GET `/api/music-bingo/playlists`**
  - Returns list of available playlists
  - Response: `{ success: true, playlists: [{ id, name }] }`

- **GET `/api/music-bingo/songs/[playlistId]`**
  - Returns all songs in a specific playlist
  - Response: `{ success: true, songs: [{ id, title, artist, duration }] }`

- **POST `/api/music-bingo/validate-code`**
  - Validates if entered song IDs were actually played
  - Payload: `{ code: string, playedSongIds: string[] }`
  - Response: `{ success: true, isValid: boolean, message: string }`

#### Components

**MusicBingoPlayer** (`components/music-bingo-player.tsx`)
- Displays the 60-second countdown timer
- Shows progress bar for song duration
- Provides Skip and Pause buttons
- Hides song title during playback
- Props:
  - `song`: Current song object
  - `isPlaying`: Boolean for play state
  - `onSkip()`: Called when skip is pressed
  - `onPause()`: Called when pause is pressed
  - `onTimeUp()`: Called when 60 seconds elapse

**MusicBingoCards** (`components/music-bingo-cards.tsx`)
- Displays a 3x3 grid of song ID cards
- Shows the played song IDs numbered by round
- Props:
  - `songs`: Array of `{ id: string, number: number }`

**MusicBingoCodeInput** (`components/music-bingo-code-input.tsx`)
- Allows player to enter song IDs (comma-separated)
- Shows confirmation dialog before submission
- Displays result (Win or Try Again)
- Props:
  - `onValidate(isValid)`: Called with validation result
  - `onRetry()`: Called to start over
  - `playedSongIds`: Array of song IDs that were played

#### Pages

**Music Bingo Game Page** (`app/(protected)/music-bingo/page.tsx`)
- Main game logic and state management
- Orchestrates the entire game flow
- Handles round progression
- Manages game state: `"playlist-select" | "playing" | "round-menu" | "code-input"`

**Updated Home Page** (`app/page.tsx`)
- Shows hub with links to all games
- New Music Bingo card with icon and description
- Links to existing games (Leaderboard, Tweets)

## Game Mechanics

### Song Selection
- Each round randomly selects a song from the chosen playlist
- No repeated songs within a single game
- Song title is never displayed during gameplay

### Timing
- Each song plays for exactly 60 seconds
- Timer counts down visually with progress bar
- Player can skip or pause before 60 seconds
- After 60 seconds OR skip, goes to "round-menu" state

### Code Format
- Song IDs are short: `s001`, `s102`, `s209` (example format)
- Code format for submission: `s001,s102,s103,s104,s105,s106,s107,s108,s109`
- Spaces are trimmed automatically
- Code is validated to ensure exactly 9 IDs and all were actually played

## Mock Data

The current implementation includes mock playlists and songs:

### Playlist 1: 80s Hits
- Song IDs: s001 through s009
- Examples: "Take on Me" (a-ha), "Billie Jean" (Michael Jackson), "Like a Virgin" (Madonna)

### Playlist 2: 90s Classics
- Song IDs: s101 through s109
- Examples: "Smells Like Teen Spirit" (Nirvana), "Creep" (Radiohead), "Wonderwall" (Oasis)

### Playlist 3: 2000s Pop
- Song IDs: s201 through s209
- Examples: "Crazy in Love" (Beyoncé), "Bad Romance" (Lady Gaga), "Poker Face" (Lady Gaga)

## Future Enhancements

1. **Spotify Integration**
   - Replace mock data with real Spotify API calls
   - Add Spotify authentication
   - Stream actual audio from Spotify

2. **Database Integration**
   - Store game history and scores
   - Track player performance across games
   - Add leaderboard integration

3. **Advanced Features**
   - Difficulty levels (easy/medium/hard)
   - Multiplayer support with simultaneous rounds
   - Custom playlists per user
   - Achievements and badges
   - Song preview with optional mute toggle

4. **UI/UX Improvements**
   - Animation during song transitions
   - Sound effects for round completions
   - Haptic feedback on mobile
   - Dark/light theme consistency

## Installation & Setup

No additional dependencies needed. The feature uses existing packages:
- `next` and `next-auth` for routing and auth
- `react` and `framer-motion` for UI
- UI components from `@radix-ui` and the existing component library

## Testing

To test the feature:
1. Navigate to the home page (logged in)
2. Click "Play Music Bingo"
3. Select a playlist
4. Listen to each song for up to 60 seconds
5. Note the song ID shown after each round
6. After 9 rounds, enter the 9 song IDs separated by commas
7. View the result (win or try again)

## File Structure
```
app/
├── api/
│   └── music-bingo/
│       ├── playlists/
│       │   └── route.ts
│       ├── songs/
│       │   └── [playlistId]/
│       │       └── route.ts
│       └── validate-code/
│           └── route.ts
├── (protected)/
│   └── music-bingo/
│       └── page.tsx
└── page.tsx (updated)

components/
├── music-bingo-player.tsx
├── music-bingo-cards.tsx
└── music-bingo-code-input.tsx
```
