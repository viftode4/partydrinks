"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Beer, Dices } from "lucide-react"
import { motion } from "framer-motion"
import type { LeaderboardUser } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeaderboardUserCardProps {
  user: LeaderboardUser
  isCurrentUser: boolean
}

export function LeaderboardUserCard({ user, isCurrentUser }: LeaderboardUserCardProps) {
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
        "flex items-center p-4 shadow border border-gray-700",
        "bg-gray-800 hover:bg-gray-700/80 transition-colors h-full",
        isCurrentUser && "border-2 border-primary"
      )}>
        <motion.div 
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
            user.rank <= 3 ? "h-14 w-14 text-xl" : "h-12 w-12 text-lg",
            user.rank === 1 && "bg-yellow-500/20 text-yellow-400",
            user.rank === 2 && "bg-gray-300/20 text-gray-300",
            user.rank === 3 && "bg-amber-600/20 text-amber-600",
            user.rank > 3 && "bg-gray-700"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          #{user.rank}
        </motion.div>
        <div className="mx-4 aspect-square w-14">
          <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-700">
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
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-white text-sm">{user.username.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow min-w-0">
          <p className={cn(
            "truncate font-bold mb-1",
            user.rank <= 3 ? "text-xl" : "text-lg",
            user.rank === 1 && "text-yellow-400",
            user.rank === 2 && "text-gray-300",
            user.rank === 3 && "text-amber-600",
            user.rank > 3 && "text-white"
          )}>{user.username}</p>
          <div className="flex items-center gap-6">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Beer className="h-6 w-6 text-yellow-400" />
              <span className={cn(
                "font-bold",
                user.rank <= 3 ? "text-2xl" : "text-xl",
                "text-yellow-400"
              )}>{user.total_points}</span>
              <span className="text-gray-400 text-sm">pts</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Dices className="h-5 w-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-300">{user.win_count}</span>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
