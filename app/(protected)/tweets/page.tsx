"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { TweetCard } from "@/components/tweet-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
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
    <div className="container max-w-md mx-auto p-4">
      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <Info className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-500">
          This is a view-only demonstration. No tweets can be added.
        </AlertDescription>
      </Alert>

      <h2 className="text-lg font-bold mb-4">Party Tweets</h2>

      <div>
        {isLoading && tweets.length === 0 ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-full h-40 rounded-md bg-muted animate-pulse mb-4" />
          ))
        ) : tweets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tweets available in view-only mode.</p>
          </div>
        ) : (
          tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)
        )}
      </div>
    </div>
  )
}
