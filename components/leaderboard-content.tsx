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
  const [includewins, setIncludewins] = useState(true)
  const { onOpen } = useDrinkModal()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/leaderboard?includewins=${includewins}`)
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
  }, [includewins, users])

  const handleFilterChange = (includeChamp: boolean) => {
    setIncludewins(includeChamp)
  }

  return (
    <div className="container max-w-md mx-auto p-4">
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
        <Button size="lg" className="h-14 w-14 rounded-full bg-pink-600 hover:bg-pink-700 shadow-lg" onClick={onOpen}>
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Drink</span>
        </Button>
      </motion.div>
    </div>
  )
}
