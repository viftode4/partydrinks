"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { TweetForm } from "@/components/tweet-form"
import { TweetCard } from "@/components/tweet-card"
import type { Tweet, User } from "@/lib/types"

interface ExtendedTweet extends Tweet {
  user: User
  total_points: number
  cigarette_count: number
}

export default function TweetsPage() {
  const { data: session } = useSession()
  const [tweets, setTweets] = useState<ExtendedTweet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTweets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/tweets")
      if (response.ok) {
        const data = await response.json()
        setTweets(data)
      }
    } catch (error) {
      console.error("Failed to fetch tweets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()

    // Set up polling for real-time updates
    const intervalId = setInterval(fetchTweets, 10000) // Poll every 10 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="w-full px-2 sm:container sm:max-w-xl sm:mx-auto sm:px-4 py-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-2xl animate-float">🎊</span>
        <h2 className="text-xl font-bold bg-gradient-to-r from-gold-400 to-champagne-200 bg-clip-text text-transparent">Party Tweets</h2>
        <span className="text-2xl animate-float" style={{ animationDelay: "0.5s" }}>🎉</span>
      </div>

      <TweetForm onTweetPosted={fetchTweets} />

      <div>
        {isLoading && tweets.length === 0 ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-full h-40 rounded-md bg-muted animate-pulse mb-4" />
          ))
        ) : tweets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tweets yet. Be the first to post!</p>
          </div>
        ) : (
          tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)
        )}
      </div>
    </div>
  )
}
