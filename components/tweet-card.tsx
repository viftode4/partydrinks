"use client"

import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Beer, Dices } from "lucide-react"
import { motion } from "framer-motion"
import type { Tweet, User } from "@/lib/types"

interface TweetCardProps {
  tweet: Tweet & {
    user: User
    total_points: number
    win_count: number
  }
}

export function TweetCard({ tweet }: TweetCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center gap-3 p-4 pb-0">
          <Avatar>
            <AvatarImage src={tweet.user.profile_image_url || "/placeholder.svg"} alt={tweet.user.username} />
            <AvatarFallback>{tweet.user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-bold">{tweet.user.username}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Beer className="mr-1 h-3 w-3 text-yellow-400" />
                <span>{tweet.total_points} pts</span>
              </div>
              <div className="flex items-center">
                <Dices className="mr-1 h-3 w-3 text-gray-400" />
                <span>{tweet.win_count}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <p className="whitespace-pre-wrap break-words">{tweet.content}</p>
          {tweet.image_url && (
            <div className="mt-3 rounded-lg overflow-hidden border">
              <div className="aspect-video relative">
                <Image
                  src={tweet.image_url}
                  alt="Tweet image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
