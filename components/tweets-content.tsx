"use client"

import { useEffect, useMemo, useState } from "react"
import { TweetForm } from "@/components/tweet-form"
import { TweetCard } from "@/components/tweet-card"
import { Badge } from "@/components/ui/badge"
import type { Tweet, User } from "@/lib/types"

interface ExtendedTweet extends Tweet {
  user: User
  total_points: number
  cigarette_count: number
}

export default function TweetsContent() {
  const [tweets, setTweets] = useState<ExtendedTweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchTweets = async () => {
    try {
      if (tweets.length === 0) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const response = await fetch("/api/tweets")
      if (response.ok) {
        const data = await response.json()
        setTweets(data)
      }
    } catch (error) {
      console.error("Failed to fetch tweets:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTweets()
    const intervalId = setInterval(fetchTweets, 12000)

    return () => clearInterval(intervalId)
  }, [])

  const latestTweet = useMemo(() => tweets[0] ?? null, [tweets])

  return (
    <div className="mx-auto w-full max-w-4xl px-2 py-4 sm:px-4">
      <section className="mb-6 overflow-hidden rounded-[28px] border border-gold-500/20 bg-gradient-to-br from-[#211025] via-[#17131f] to-[#101321] p-5 shadow-[0_20px_70px_rgba(15,10,30,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100">Party feed</Badge>
              {isRefreshing && <Badge className="border-sky-400/30 bg-sky-500/10 text-sky-100">Fresh gossip incoming</Badge>}
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Birthday bulletin board</h2>
              <p className="mt-2 max-w-2xl text-sm text-champagne-200/80 sm:text-base">
                Post the evidence, roast the leaderboard, and keep the room laughing without making the host regret Wi-Fi.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne-300/60">Latest headline</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {latestTweet ? `${latestTweet.user.username} has the mic.` : "Mic check pending"}
              </p>
              <p className="text-sm text-champagne-200/70">
                {latestTweet ? latestTweet.content.slice(0, 72) : "The first spicy post of the night wins the room."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne-300/60">Noise level</p>
              <p className="mt-1 text-2xl font-bold text-white">{tweets.length}</p>
              <p className="text-sm text-champagne-200/70">
                {tweets.length > 0 ? "posts keeping the room entertained." : "posts so far — suspiciously calm."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <TweetForm onTweetPosted={fetchTweets} />

      <div className="space-y-4">
        {isLoading && tweets.length === 0 ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mb-4 h-40 w-full animate-pulse rounded-3xl bg-muted" />
          ))
        ) : tweets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gold-500/20 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white">No party posts yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the brave soul who starts the feed and instantly becomes part of the lore.
            </p>
          </div>
        ) : (
          tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)
        )}
      </div>
    </div>
  )
}
