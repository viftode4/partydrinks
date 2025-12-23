"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Beer, LogOut } from "lucide-react"

interface UserStats {
  totalPoints: number
  totalDrinks: number
  winCount: number
  drinkTypes: {
    [key: string]: number
  }
}

export default function ProfileContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    totalDrinks: 0,
    winCount: 0,
    drinkTypes: {},
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/users/${session.user.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStats()
  }, [session?.user?.id])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
            <Image
              src={session.user.image || "/placeholder-user.jpg"}
              alt={session.user.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-xl">{session.user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Party Member</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <h3 className="text-sm font-medium text-muted-foreground">Total Points</h3>
                {isLoading ? (
                  <div className="h-6 w-12 animate-pulse bg-muted-foreground/20 rounded mx-auto mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats.totalPoints}</p>
                )}
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <h3 className="text-sm font-medium text-muted-foreground">wins</h3>
                {isLoading ? (
                  <div className="h-6 w-12 animate-pulse bg-muted-foreground/20 rounded mx-auto mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats.winCount}</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-medium">Drink Breakdown</h3>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-8 w-full animate-pulse bg-muted-foreground/20 rounded mb-2" />
                ))
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.drinkTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Beer className="mr-2 h-4 w-4 text-yellow-400" />
                        <span>{type}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.drinkTypes).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No drinks recorded yet</p>
                  )}
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
