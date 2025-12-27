import { getSupabaseServerClient } from './supabase'
import { Database } from '@/types/supabase'
import bcrypt from 'bcryptjs'

// User operations
export async function createUser(username: string, password: string, profileImageUrl: string) {
  const supabase = getSupabaseServerClient()
  const passwordHash = await bcrypt.hash(password, 10)
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      password_hash: passwordHash,
      profile_image_url: profileImageUrl
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function getUserByUsername(username: string) {
  const supabase = getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('username', username)
    .single()
    
  if (error && error.code !== 'PGRST116') return null // PGRST116 is "no rows returned"
  return data
}

// Drink operations
export async function addDrink(userId: string, drinkType: Database['public']['Tables']['drinks']['Row']['drink_type']) {
  const supabase = getSupabaseServerClient()
  
  // First check if a drink of this type was added very recently (within 5 seconds)
  const { data: recentDrinks, error: recentError } = await supabase
    .from('drinks')
    .select('*')
    .eq('user_id', userId)
    .eq('drink_type', drinkType)
    .gte('created_at', new Date(Date.now() - 5000).toISOString()) // Check last 5 seconds
    .limit(1)
    
  if (recentError) throw recentError
  
  // If a drink was added very recently, don't add another one
  if (recentDrinks && recentDrinks.length > 0) {
    throw new Error('A drink of this type was added very recently. Please wait a moment before adding another one.')
  }
  
  // Get the points for this drink type
  const { data: pointsData, error: pointsError } = await supabase
    .from('drink_points')
    .select('points')
    .eq('drink_type', drinkType)
    .single()
    
  if (pointsError) throw pointsError
  
  // Then add the drink with points
  const { data, error } = await supabase
    .from('drinks')
    .insert({
      user_id: userId,
      drink_type: drinkType,
      points: pointsData.points
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

// win operations
export async function addwin(userId: string, count: number = 1) {
  const supabase = getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('wins')
    .insert({
      user_id: userId,
      count
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

// Tweet operations
export async function createTweet(userId: string, content: string, imageUrl?: string) {
  const supabase = getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('tweets')
    .insert({
      user_id: userId,
      content,
      image_url: imageUrl || null
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}

// Leaderboard operations
export async function getLeaderboard(filterwins?: boolean) {
  const supabase = getSupabaseServerClient()
  
  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('total_points', { ascending: false })
  
  if (filterwins) {
    query = query.gt('win_count', 0)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

// Get tweets with user details
export async function getTweets() {
  const supabase = getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('tweets')
    .select(`
      id,
      content,
      image_url,
      created_at,
      users (
        id,
        username,
        profile_image_url
      )
    `)
    .order('created_at', { ascending: false })
    
  if (error) throw error
  return data
}

// Get drink types and their point values
export async function getDrinkTypes() {
  const supabase = getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('drink_points')
    .select('*')
    
  if (error) throw error
  return data
} 