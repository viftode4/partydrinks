"use client"

import { useEffect, useState } from "react"
import { LeaderboardUserCard } from "@/components/leaderboard-user-card"
import { TweetCard } from "@/components/tweet-card"
import type { LeaderboardUser } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Beer, Martini, Wine, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExtendedTweet {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  user: {
    id: string
    username: string
    image_url: string
    profile_image_url: string
  }
  total_points: number
  win_count: number
}

export default function ProjectorPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [tweets, setTweets] = useState<ExtendedTweet[]>([])
  const [countdown, setCountdown] = useState(5)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsUpdating(true)
        setError(null)
        
        // Fetch leaderboard
        const leaderboardResponse = await fetch("/api/leaderboard?includewins=true")
        if (!leaderboardResponse.ok) {
          throw new Error(`Failed to fetch leaderboard: ${leaderboardResponse.statusText}`)
        }
        
        const leaderboardData = await leaderboardResponse.json()
        console.log("Raw leaderboard data:", JSON.stringify(leaderboardData, null, 2))

        if (!Array.isArray(leaderboardData)) {
          console.error("Leaderboard data is not an array:", leaderboardData)
          throw new Error("Invalid leaderboard data format")
        }

        if (leaderboardData.length === 0) {
          console.log("Leaderboard data is empty array")
        }

        // Store previous ranks before updating
        const updatedData = leaderboardData.map((user: any) => {
          console.log("Processing user:", user)
          const existingUser = users.find((u) => u.id === user.id)
          const mappedUser = {
            ...user,
            image_url: user.profile_image_url || user.image_url,
            previousRank: existingUser?.rank || user.rank,
          }
          console.log("Mapped user result:", mappedUser)
          return mappedUser
        })

        console.log("Final leaderboard data:", JSON.stringify(updatedData, null, 2))
        setUsers(updatedData)

        // Fetch tweets
        const tweetsResponse = await fetch("/api/tweets")
        if (!tweetsResponse.ok) {
          throw new Error(`Failed to fetch tweets: ${tweetsResponse.statusText}`)
        }
        
        const tweetsData = await tweetsResponse.json()
        setTweets(tweetsData.slice(0, 10)) // Show only the 10 most recent tweets
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch data")
      } finally {
        setIsUpdating(false)
        setCountdown(5)
      }
    }

    fetchData()

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchData, 5000) // Poll every 5 seconds

    // Set up countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 5))
    }, 1000)

    return () => {
      clearInterval(intervalId)
      clearInterval(countdownInterval)
    }
  }, []) // Remove users dependency

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <header className="mb-8 text-center">
        <motion.div
          className="flex justify-center gap-8 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ rotate: -10, y: 10 }}
            animate={{ rotate: 10, y: 0 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1 }}
          >
            <Beer className="h-20 w-20 text-yellow-400 drop-shadow-lg" />
          </motion.div>
          <motion.div
            initial={{ rotate: 10, y: 10 }}
            animate={{ rotate: -10, y: 0 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1.3 }}
          >
            <Martini className="h-20 w-20 text-pink-400 drop-shadow-lg" />
          </motion.div>
          <motion.div
            initial={{ rotate: -10, y: 10 }}
            animate={{ rotate: 10, y: 0 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 0.8 }}
          >
            <Wine className="h-20 w-20 text-red-500 drop-shadow-lg" />
          </motion.div>
        </motion.div>
        <motion.h1
          className="text-5xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Party Leaderboard
        </motion.h1>
        <motion.div
          className="flex items-center justify-center gap-2 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Clock className="h-5 w-5" />
          <span>Next update in {countdown}s</span>
        </motion.div>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-full mx-auto">
        {/* Tweets Column */}
        <div className="relative">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Latest Tweets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {tweets.map((tweet) => (
                  <motion.div
                    key={tweet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TweetCard tweet={tweet} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Spanning 2 Columns */}
        <div className="lg:col-span-2 relative">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Top Drinkers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative min-h-[200px]">
              {isUpdating && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                    <p className="text-yellow-500 text-sm">Updating...</p>
                  </div>
                </div>
              )}
              <motion.div layout className="space-y-4">
                {users.length === 0 ? (
                  <motion.div
                    layout
                    className="text-center py-8 text-gray-400"
                  >
                    <p>No drinkers yet. Time to grab a drink! 🍻</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {users.map((user) => (
                        <LeaderboardUserCard 
                          key={user.id} 
                          user={user} 
                          isCurrentUser={false} 
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
