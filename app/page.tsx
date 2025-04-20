"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Beer, Martini, Wine } from "lucide-react"
import { motion } from "framer-motion"

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
