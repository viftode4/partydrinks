"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Beer } from "lucide-react"
import { Wine } from "lucide-react" 
import { GlassWater } from "lucide-react" 
import { Dices } from "lucide-react"
import { Trophy } from "lucide-react"
import { Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

type LeaderboardEntry = {
  user_id: string
  username: string
  profile_image_url: string
  total_points: number
  win_count: number
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'champs'>('all')

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const supabase = getSupabaseBrowserClient()
        
        let query = supabase
          .from('leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
        
        if (filter === 'champs') {
          query = query.gt('win_count', 0)
        }
        
        const { data, error } = await query
        
        if (error) {
          console.error('Error fetching leaderboard:', error)
          return
        }
        
        setLeaderboard(data || [])
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLeaderboard()
  }, [filter])

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Party Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Who's drinking the most tonight?</p>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as 'all' | 'champs')}>
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Trophy size={16} />
              <span>All Participants</span>
            </TabsTrigger>
            <TabsTrigger value="champs" className="flex items-center gap-2">
              <Dices size={16} />
              <span>Champs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <LeaderboardTable entries={leaderboard} loading={loading} />
        </TabsContent>
        
        <TabsContent value="champs" className="mt-0">
          <LeaderboardTable entries={leaderboard} loading={loading} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={18} />
              Today's Drink Points
            </CardTitle>
            <CardDescription>Points awarded per drink type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center flex-wrap gap-4">
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 text-sm">
                <Beer className="text-yellow-500" size={18} />
                <span>Beer: 1 point</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 text-sm">
                <Wine className="text-red-500" size={18} />
                <span>Wine: 2 points</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 text-sm">
                <GlassWater className="text-pink-500" size={18} />
                <span>Cocktail: 3 points</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 text-sm">
                <div className="flex items-center justify-center w-[18px] h-[18px]">🥃</div>
                <span>Shot: 2 points</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LeaderboardTable({ entries, loading }: { entries: LeaderboardEntry[], loading: boolean }) {
  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-12 border-b px-4 py-3 font-medium text-sm">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-7">Participant</div>
        <div className="col-span-2 text-center">Points</div>
        <div className="col-span-2 text-center">Wins</div>
      </div>
      
      {loading ? (
        // Skeleton loader
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-12 items-center border-b px-4 py-3 last:border-0">
            <div className="col-span-1 text-center">
              <Skeleton className="h-6 w-6 rounded-full mx-auto" />
            </div>
            <div className="col-span-7 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="col-span-2 text-center">
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
            <div className="col-span-2 text-center">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          </div>
        ))
      ) : entries.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No participants yet. Be the first to grab a drink!
        </div>
      ) : (
        entries.map((entry, index) => (
          <div key={entry.user_id} className="grid grid-cols-12 items-center border-b px-4 py-3 last:border-0">
            <div className="col-span-1 text-center font-medium">
              {index === 0 ? (
                <Trophy className="mx-auto text-yellow-500" size={18} />
              ) : (
                index + 1
              )}
            </div>
            <div className="col-span-7 flex items-center gap-3">
              <Avatar>
                <AvatarImage src={entry.profile_image_url} alt={entry.username} />
                <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{entry.username}</span>
            </div>
            <div className="col-span-2 text-center font-bold">{entry.total_points}</div>
            <div className="col-span-2 text-center">
              {entry.win_count > 0 ? (
                <div className="flex items-center justify-center gap-1">
                  <Dices size={14} />
                  <span>{entry.win_count}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
