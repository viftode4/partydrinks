"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { LeaderboardUserCard } from "@/components/leaderboard-user-card"
import { LeaderboardFilter } from "@/components/leaderboard-filter"
import type { LeaderboardUser } from "@/lib/types"
import { useDrinkModal } from "@/hooks/use-drink-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"

export default function LeaderboardContent() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [includeCigarettes, setIncludeCigarettes] = useState(true)
  const { onOpen } = useDrinkModal()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/leaderboard?includeCigarettes=${includeCigarettes}`)
        if (response.ok) {
          const data = await response.json()

          // Store previous ranks before updating
          const updatedData = data.map((user: LeaderboardUser) => {
            const existingUser = users.find((u) => u.id === user.id)
            return {
              ...user,
              previousRank: existingUser?.rank || user.rank,
            }
          })

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
  }, [includeCigarettes, users])

  const handleFilterChange = (includeSmoke: boolean) => {
    setIncludeCigarettes(includeSmoke)
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

      <motion.div
        className="fixed bottom-24 right-6 md:bottom-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button size="lg" className="h-14 w-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-midnight shadow-xl shadow-gold-500/30 hover:shadow-gold-500/50 transition-all" onClick={onOpen}>
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Drink</span>
        </Button>
      </motion.div>
    </div>
  )
}
