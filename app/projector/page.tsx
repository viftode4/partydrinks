"use client"

import { useEffect, useRef, useState } from "react"
import { ProjectorPartyCallouts } from "@/components/projector-party-callouts"
import { LeaderboardUserCard } from "@/components/leaderboard-user-card"
import { TweetCard } from "@/components/tweet-card"
import type { DuelRow } from "@/lib/duels"
import { getDefaultPartyFeatureFlags, type PartyFeatureFlags } from "@/lib/feature-flags"
import type { LeaderboardUser } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Beer, Martini, Wine, Clock, Sparkles } from "lucide-react"
import { limitProjectorTweets, mergeProjectorLeaderboardUsers } from "@/lib/projector"

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
  cigarette_count: number
}

export default function ProjectorPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [tweets, setTweets] = useState<ExtendedTweet[]>([])
  const [duels, setDuels] = useState<DuelRow[]>([])
  const [flags, setFlags] = useState<PartyFeatureFlags>(getDefaultPartyFeatureFlags())
  const [countdown, setCountdown] = useState(5)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const usersRef = useRef<LeaderboardUser[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsUpdating(true)
        setError(null)
        
        // Fetch leaderboard
        const leaderboardResponse = await fetch("/api/leaderboard?includeCigarettes=true")
        if (!leaderboardResponse.ok) {
          throw new Error(`Failed to fetch leaderboard: ${leaderboardResponse.statusText}`)
        }
        
        const leaderboardData = await leaderboardResponse.json()

        if (!Array.isArray(leaderboardData)) {
          throw new Error("Invalid leaderboard data format")
        }

        const updatedData = mergeProjectorLeaderboardUsers(leaderboardData, usersRef.current)
        usersRef.current = updatedData
        setUsers(updatedData)

        // Fetch tweets
        const tweetsResponse = await fetch("/api/tweets")
        if (!tweetsResponse.ok) {
          throw new Error(`Failed to fetch tweets: ${tweetsResponse.statusText}`)
        }
        
        const tweetsData = await tweetsResponse.json()
        setTweets(limitProjectorTweets(tweetsData))

        const featureFlagResponse = await fetch("/api/feature-flags")
        let nextFlags = getDefaultPartyFeatureFlags()

        if (featureFlagResponse.ok) {
          nextFlags = await featureFlagResponse.json()
        }

        setFlags(nextFlags)

        if (nextFlags.duels) {
          const duelsResponse = await fetch("/api/duels")

          if (duelsResponse.ok) {
            const duelData = await duelsResponse.json()
            setDuels(Array.isArray(duelData) ? duelData : [])
          } else if (duelsResponse.status === 401) {
            setDuels([])
          }
        } else {
          setDuels([])
        }
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.35),_transparent_30%),linear-gradient(135deg,_#111827,_#020617_55%,_#0f172a)] p-6 lg:p-8">
      <header className="mb-8 space-y-6 text-center">
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
          Birthday Battle Board
        </motion.h1>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Clock className="h-5 w-5" />
          <span>Next update in {countdown}s</span>
          <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-block" />
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Projector-friendly party pulse, rivalries, and live crowd energy.
          </span>
        </motion.div>

        <ProjectorPartyCallouts
          countdown={countdown}
          duels={duels}
          flags={flags}
          isUpdating={isUpdating}
          users={users}
        />
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-full mx-auto">
        {/* Tweets Column */}
        <div className="relative">
          <Card className="border-white/10 bg-slate-950/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Crowd Camera</CardTitle>
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
          <Card className="border-white/10 bg-slate-950/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Main Stage Standings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative min-h-[200px]">
              {isUpdating && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1">
                    <p className="text-sm text-yellow-300">Refreshing stage lights…</p>
                  </div>
                </div>
              )}
              <motion.div layout className="space-y-4">
                {users.length === 0 ? (
                  <motion.div
                    layout
                    className="py-8 text-center text-white/60"
                  >
                    <p>No birthday legends on the board yet. First sip gets the roar. 🍻</p>
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
