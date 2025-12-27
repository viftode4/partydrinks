"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Beer, Martini, Wine, Music } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/leaderboard")
    } else if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Show loading animation while determining auth status
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-6">
            <motion.div
              initial={{ rotate: -10, y: 10 }}
              animate={{ rotate: 10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1 }}
            >
              <Beer className="h-12 w-12 text-yellow-400" />
            </motion.div>
            <motion.div
              initial={{ rotate: 10, y: 10 }}
              animate={{ rotate: -10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1.3 }}
            >
              <Martini className="h-12 w-12 text-pink-400" />
            </motion.div>
            <motion.div
              initial={{ rotate: -10, y: 10 }}
              animate={{ rotate: 10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 0.8 }}
            >
              <Wine className="h-12 w-12 text-red-500" />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Party Drinks</h1>
          <p className="text-white/80 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  // Show game hub for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-12">
          <div className="flex justify-center gap-3 mb-6">
            <motion.div
              initial={{ rotate: -10, y: 10 }}
              animate={{ rotate: 10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1 }}
            >
              <Beer className="h-12 w-12 text-yellow-400" />
            </motion.div>
            <motion.div
              initial={{ rotate: 10, y: 10 }}
              animate={{ rotate: -10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1.3 }}
            >
              <Martini className="h-12 w-12 text-pink-400" />
            </motion.div>
            <motion.div
              initial={{ rotate: -10, y: 10 }}
              animate={{ rotate: 10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 0.8 }}
            >
              <Wine className="h-12 w-12 text-red-500" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Party Drinks</h1>
          <p className="text-lg opacity-90">Welcome, {session?.user?.name}!</p>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Existing Games */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg p-6 shadow-lg cursor-pointer"
          >
            <Link href="/leaderboard" className="block space-y-4">
              <div className="flex gap-3 items-start">
                <Beer className="h-8 w-8 text-yellow-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
                  <p className="text-gray-600">View rankings and stats</p>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                View Leaderboard
              </Button>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg p-6 shadow-lg cursor-pointer"
          >
            <Link href="/tweets" className="block space-y-4">
              <div className="flex gap-3 items-start">
                <Wine className="h-8 w-8 text-red-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tweets</h2>
                  <p className="text-gray-600">Share your party moments</p>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white">
                View Tweets
              </Button>
            </Link>
          </motion.div>

          {/* New Music Bingo Game */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg p-6 shadow-lg cursor-pointer md:col-span-2"
          >
            <Link href="/music-bingo" className="block space-y-4">
              <div className="flex gap-3 items-start">
                <Music className="h-8 w-8 text-purple-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">🎵 Music Bingo</h2>
                  <p className="text-gray-600">
                    Play the ultimate music guessing game! Listen to songs and remember their IDs to win.
                  </p>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Play Music Bingo
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
