"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { LeaderboardUserCard } from "@/components/leaderboard-user-card"
import { LeaderboardFilter } from "@/components/leaderboard-filter"
import type { LeaderboardUser } from "@/lib/types"

export default function LeaderboardContent() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [drinkType, setDrinkType] = useState("all")
  const usersRef = useRef<LeaderboardUser[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/leaderboard?drinkType=${drinkType}`)
        if (response.ok) {
          const data = await response.json()

          // Store previous ranks before updating
          const updatedData = data.map((user: LeaderboardUser) => {
            const existingUser = usersRef.current.find((u) => u.id === user.id)
            return {
              ...user,
              previousRank: existingUser?.rank || user.rank,
            }
          })

          usersRef.current = updatedData
          setUsers(updatedData)
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchLeaderboard, 10000) // Poll every 10 seconds

    return () => clearInterval(intervalId)
  }, [drinkType])

  const handleFilterChange = (type: string) => {
    setDrinkType(type)
  }

  return (
    <div className="container max-w-full sm:max-w-xl mx-auto px-3 sm:px-4 py-4">
      <div className="mb-6 text-center">
        <div className="flex justify-center items-center gap-3 mb-2">
          <span className="text-3xl animate-float">🏆</span>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gold-400 to-champagne-200 bg-clip-text text-transparent">
            New Year&apos;s Leaderboard
          </h1>
          <span className="text-3xl animate-float" style={{ animationDelay: "0.5s" }}>🎊</span>
        </div>
        <p className="text-champagne-300 text-sm">Who&apos;s celebrating the hardest? 🥂</p>
      </div>

      <LeaderboardFilter onChange={handleFilterChange} />

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-full h-20 rounded-md bg-muted animate-pulse" />
          ))
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data to display</p>
          </div>
        ) : (
          users.map((user) => (
            <LeaderboardUserCard key={user.id} user={user} isCurrentUser={user.id === session?.user?.id} />
          ))
        )}
      </div>

    </div>
  )
}
