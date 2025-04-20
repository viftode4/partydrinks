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
import { Suspense } from 'react'
import LeaderboardClient from './LeaderboardClient'

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="container max-w-md mx-auto p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="w-full h-20 rounded-md bg-muted animate-pulse" />
      ))}
    </div>}>
      <LeaderboardClient />
    </Suspense>
  )
}
