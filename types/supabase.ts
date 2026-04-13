export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password_hash: string
          profile_image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          profile_image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          profile_image_url?: string
          created_at?: string
        }
      }
      drinks: {
        Row: {
          id: string
          user_id: string
          drink_type: 'Beer' | 'Wine' | 'Cocktail' | 'Shot'
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          drink_type: 'Beer' | 'Wine' | 'Cocktail' | 'Shot'
          points: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          drink_type?: 'Beer' | 'Wine' | 'Cocktail' | 'Shot'
          points?: number
          created_at?: string
        }
      }
      cigarettes: {
        Row: {
          id: string
          user_id: string
          count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          count: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          count?: number
          created_at?: string
        }
      }
      tweets: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
        }
      }
      drink_points: {
        Row: {
          drink_type: 'Beer' | 'Wine' | 'Cocktail' | 'Shot'
          points: number
        }
        Insert: {
          drink_type: 'Beer' | 'Wine' | 'Cocktail' | 'Shot'
          points: number
        }
        Update: {
          drink_type?: 'Beer' | 'Wine' | 'Cocktail' | 'Shot'
          points?: number
        }
      }
      party_feature_flags: {
        Row: {
          key: string
          enabled: boolean
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          enabled?: boolean
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          enabled?: boolean
          description?: string | null
          updated_at?: string
        }
      }
      score_events: {
        Row: {
          id: string
          user_id: string
          source_type: 'drink' | 'duel'
          source_id: string
          delta: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_type: 'drink' | 'duel'
          source_id: string
          delta: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_type?: 'drink' | 'duel'
          source_id?: string
          delta?: number
          metadata?: Json
          created_at?: string
        }
      }
      duels: {
        Row: {
          id: string
          challenger_id: string
          opponent_id: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          wager_points: number
          winner_id: string | null
          loser_id: string | null
          accepted_at: string | null
          resolved_at: string | null
          cancelled_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          challenger_id: string
          opponent_id: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          wager_points?: number
          winner_id?: string | null
          loser_id?: string | null
          accepted_at?: string | null
          resolved_at?: string | null
          cancelled_at?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          challenger_id?: string
          opponent_id?: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          wager_points?: number
          winner_id?: string | null
          loser_id?: string | null
          accepted_at?: string | null
          resolved_at?: string | null
          cancelled_at?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          username: string
          profile_image_url: string
          total_points: number
          cigarette_count: number
        }
      }
      authoritative_rankings: {
        Row: {
          user_id: string
          username: string
          profile_image_url: string
          total_points: number
        }
      }
    }
    Functions: {
      resolve_duel: {
        Args: {
          p_duel_id: string
          p_winner_id: string
          p_resolved_by?: string | null
          p_note?: string | null
        }
        Returns: Database['public']['Tables']['duels']['Row']
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
