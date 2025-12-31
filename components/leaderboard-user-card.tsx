"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Beer, Cigarette } from "lucide-react"
import { motion } from "framer-motion"
import type { LeaderboardUser } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeaderboardUserCardProps {
  user: LeaderboardUser
  isCurrentUser: boolean
}

const getMedalEmoji = (rank: number) => {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return null
}

export function LeaderboardUserCard({ user, isCurrentUser }: LeaderboardUserCardProps) {
  const medal = getMedalEmoji(user.rank)

  return (
    <motion.div
      layout
      layoutId={user.id}
      transition={{
        layout: { duration: 0.3 },
        opacity: { duration: 0.2 }
      }}
      className="w-full relative z-10"
    >
      <Card className={cn(
        "flex items-center p-4 shadow-lg transition-all duration-300",
        "bg-gradient-to-r from-midnight-100 to-midnight-50 hover:from-midnight-50 hover:to-midnight",
        user.rank === 1 && "border-2 border-gold-500/50 shadow-gold-500/20",
        user.rank === 2 && "border border-gray-400/40",
        user.rank === 3 && "border border-amber-600/40",
        user.rank > 3 && "border border-gold-500/10",
        isCurrentUser && "ring-2 ring-gold-500 ring-offset-2 ring-offset-midnight"
      )}>
        <motion.div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full font-bold",
            user.rank <= 3 ? "h-16 w-16 text-2xl" : "h-12 w-12 text-lg",
            user.rank === 1 && "bg-gradient-to-br from-gold-400 to-gold-600 text-midnight shadow-lg shadow-gold-500/30",
            user.rank === 2 && "bg-gradient-to-br from-gray-300 to-gray-400 text-midnight shadow-lg shadow-gray-400/30",
            user.rank === 3 && "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30",
            user.rank > 3 && "bg-midnight-50 text-gold-500 border border-gold-500/20"
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          {medal || `#${user.rank}`}
        </motion.div>
        <div className="mx-4 aspect-square w-14">
          <div className={cn(
            "relative h-full w-full overflow-hidden rounded-full bg-midnight-50",
            user.rank === 1 && "ring-2 ring-gold-500/50",
            user.rank === 2 && "ring-2 ring-gray-400/50",
            user.rank === 3 && "ring-2 ring-amber-600/50"
          )}>
            {user.image_url ? (
              <Image
                src={user.image_url}
                alt={user.username}
                fill
                className="object-cover"
                sizes="56px"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-user.jpg";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gold-500/20">
                <span className="text-gold-400 text-sm font-bold">{user.username.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow min-w-0">
          <p className={cn(
            "truncate font-bold mb-1",
            user.rank <= 3 ? "text-xl" : "text-lg",
            user.rank === 1 && "text-gold-400",
            user.rank === 2 && "text-gray-300",
            user.rank === 3 && "text-amber-500",
            user.rank > 3 && "text-champagne-100"
          )}>{user.username}</p>
          <div className="flex items-center gap-6">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Beer className="h-6 w-6 text-gold-500" />
              <span className={cn(
                "font-bold text-gold-400",
                user.rank <= 3 ? "text-2xl" : "text-xl"
              )}>{user.total_points}</span>
              <span className="text-champagne-300 text-sm">pts</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Cigarette className="h-5 w-5 text-champagne-400" />
              <span className="text-lg font-semibold text-champagne-300">{user.cigarette_count}</span>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
