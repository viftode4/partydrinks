"use client"

import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Beer, Cigarette, Flame, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import type { Tweet, User } from "@/lib/types"

interface TweetCardProps {
  tweet: Tweet & {
    user: User
    total_points: number
    cigarette_count: number
  }
}

function getTweetEnergy(tweet: TweetCardProps["tweet"]) {
  if (tweet.total_points >= 30) {
    return {
      label: "Main-character energy",
      icon: Sparkles,
      className: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100",
    }
  }

  if (tweet.cigarette_count >= 3) {
    return {
      label: "Smoke machine",
      icon: Flame,
      className: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    }
  }

  return {
    label: "Party dispatch",
    icon: Sparkles,
    className: "border-sky-400/30 bg-sky-500/10 text-sky-100",
  }
}

export function TweetCard({ tweet }: TweetCardProps) {
  const energy = getTweetEnergy(tweet)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="mb-3 overflow-hidden rounded-[24px] border-gold-500/10 bg-gradient-to-br from-midnight-100 via-midnight-50 to-[#1d1525] transition-colors hover:border-gold-500/20">
        <CardHeader className="flex flex-row items-center gap-3 p-4 pb-0">
          <Avatar className="ring-2 ring-gold-500/30">
            <AvatarImage src={tweet.user.profile_image_url || "/placeholder.svg"} alt={tweet.user.username} />
            <AvatarFallback className="bg-gold-500/20 text-gold-400">
              {tweet.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <div className="truncate font-bold text-champagne-100">{tweet.user.username}</div>
            <div className="flex items-center gap-2 text-sm text-champagne-300/60">
              <div className="flex items-center">
                <Beer className="mr-1 h-3 w-3 text-gold-500" />
                <span>{tweet.total_points} pts</span>
              </div>
              <div className="flex items-center">
                <Cigarette className="mr-1 h-3 w-3 text-champagne-400" />
                <span>{tweet.cigarette_count}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <Badge className={energy.className}>
              <energy.icon className="mr-1 h-3.5 w-3.5" />
              {energy.label}
            </Badge>
            <div className="text-xs text-champagne-300/50">
              {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <p className="whitespace-pre-wrap break-words text-base leading-7 text-champagne-100">{tweet.content}</p>
          {tweet.image_url && (
            <div className="mt-3 overflow-hidden rounded-lg border border-gold-500/10 bg-black/20 transition-colors hover:border-gold-500/30">
              <img src={tweet.image_url} alt="Tweet image" className="h-auto max-h-[70vh] w-full object-contain" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-xs text-champagne-300/70">
          <span>Broadcast from the birthday floor</span>
          <span>{tweet.total_points} pts in pocket</span>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
