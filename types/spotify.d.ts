export {}

declare global {
  interface Window {
    Spotify: SpotifyNamespace
    onSpotifyWebPlaybackSDKReady: () => void
  }

  interface SpotifyNamespace {
    Player: new (options: Spotify.PlayerInit) => Spotify.Player
  }

  namespace Spotify {
    interface PlayerInit {
      name: string
      getOAuthToken: (cb: (token: string) => void) => void
      volume?: number
    }

    interface Player {
      connect(): Promise<boolean>
      disconnect(): void
      addListener(
        event: "ready" | "not_ready",
        cb: (data: { device_id: string }) => void
      ): boolean
      addListener(
        event:
          | "player_state_changed"
          | "initialization_error"
          | "authentication_error"
          | "account_error",
        cb: (data: any) => void
      ): boolean
      removeListener(event: string): boolean
      getCurrentState(): Promise<any>
      pause(): Promise<void>
      resume(): Promise<void>
      togglePlay(): Promise<void>
    }
  }
}
