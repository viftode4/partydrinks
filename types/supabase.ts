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
      wins: {
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
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          username: string
          profile_image_url: string
          total_points: number
          win_count: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 