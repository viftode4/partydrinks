"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buildPartyInsights } from "@/lib/party-insights"
import type { PartyFeatureFlags } from "@/lib/feature-flags"
import type { Duel, LeaderboardUser } from "@/lib/types"
import { Beer, Flame, LogOut, Swords, Trophy } from "lucide-react"

interface UserStats {
  totalPoints: number
  totalDrinks: number
  cigaretteCount: number
  drinkTypes: {
    [key: string]: number
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    totalDrinks: 0,
    cigaretteCount: 0,
    drinkTypes: {},
  })
  const [isLoading, setIsLoading] = useState(true)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])
  const [duels, setDuels] = useState<Duel[]>([])
  const [featureFlags, setFeatureFlags] = useState<PartyFeatureFlags | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)
        const [statsResponse, leaderboardResponse, flagsResponse, duelsResponse] = await Promise.all([
          fetch(`/api/users/${session.user.id}/stats`),
          fetch("/api/leaderboard?drinkType=all"),
          fetch("/api/feature-flags"),
          fetch("/api/duels"),
        ])

        if (statsResponse.ok) {
          const data = await statsResponse.json()
          setStats({
            totalPoints: data.totalPoints || 0,
            totalDrinks: data.totalDrinks || 0,
            cigaretteCount: data.cigaretteCount || 0,
            drinkTypes: data.drinkTypes || {},
          })
        }

        if (leaderboardResponse.ok) {
          setLeaderboardUsers((await leaderboardResponse.json()) as LeaderboardUser[])
        }

        if (flagsResponse.ok) {
          setFeatureFlags((await flagsResponse.json()) as PartyFeatureFlags)
        }

        if (duelsResponse.ok) {
          setDuels((await duelsResponse.json()) as Duel[])
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [session?.user?.id])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/auth/signin")
  }

  if (!session?.user) {
    return null
  }

  const partyInsights = buildPartyInsights(leaderboardUsers)
  const currentLeaderboardEntry = leaderboardUsers.find((user) => user.id === session.user.id) ?? null
  const currentInsight = currentLeaderboardEntry ? partyInsights[currentLeaderboardEntry.id] : null
  const topDrink = useMemo(
    () => Object.entries(stats.drinkTypes).sort((left, right) => right[1] - left[1])[0] ?? null,
    [stats.drinkTypes],
  )
  const pendingDuelCount = duels.filter((duel) => duel.status === "pending").length
  const activeDuelCount = duels.filter((duel) => duel.status === "active").length
  const duelCopy = featureFlags?.duels
    ? activeDuelCount > 0
      ? `${activeDuelCount} live duel${activeDuelCount === 1 ? "" : "s"} waiting for glory.`
      : pendingDuelCount > 0
        ? `${pendingDuelCount} challenge${pendingDuelCount === 1 ? "" : "s"} waiting on a response.`
        : "No live duels right now — suspiciously peaceful."
    : "Host has duels disabled right now."

  return (
    <div className="mx-auto max-w-4xl p-4">
      <section className="mb-6 overflow-hidden rounded-[28px] border border-gold-500/20 bg-gradient-to-br from-[#24122d] via-[#18141f] to-[#10131c] p-5 shadow-[0_20px_70px_rgba(15,10,30,0.35)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
              <Image
                src={session.user.image || "/placeholder-user.jpg"}
                alt={session.user.name || "User"}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-gold-400/20 bg-gold-500/10 text-gold-100">Player card</Badge>
                {currentInsight?.primary && (
                  <Badge className="border-rose-400/20 bg-rose-500/10 text-rose-100">{currentInsight.primary.label}</Badge>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">{session.user.name}</h1>
                <p className="mt-1 text-sm text-champagne-200/75">
                  {currentInsight?.primary?.detail ?? "You are fully cleared for birthday nonsense."}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne-300/60">Current rank</p>
              <p className="mt-1 text-2xl font-bold text-white">{currentLeaderboardEntry ? `#${currentLeaderboardEntry.rank}` : "Unranked"}</p>
              <p className="text-sm text-champagne-200/70">
                {currentLeaderboardEntry ? `${currentLeaderboardEntry.total_points} points on the night.` : "Log a round to jump onto the board."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne-300/60">Rivalry radar</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {currentInsight?.rivalry ? currentInsight.rivalry.label : "Calm skies"}
              </p>
              <p className="text-sm text-champagne-200/70">
                {currentInsight?.rivalry?.detail ?? "Nobody is close enough to start a score feud yet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-gold-500/20 bg-card/90">
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
              <CardTitle className="text-xl text-white">Tonight&apos;s brag sheet</CardTitle>
              <p className="text-sm text-muted-foreground">A cleaner read of your scoreline before somebody checks the projector.</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-muted/40 p-3 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Points</h3>
                  {isLoading ? (
                    <div className="mx-auto mt-1 h-6 w-12 animate-pulse rounded bg-muted-foreground/20" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.totalPoints}</p>
                  )}
                </div>
                <div className="rounded-2xl bg-muted/40 p-3 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Drinks</h3>
                  {isLoading ? (
                    <div className="mx-auto mt-1 h-6 w-12 animate-pulse rounded bg-muted-foreground/20" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.totalDrinks}</p>
                  )}
                </div>
                <div className="rounded-2xl bg-muted/40 p-3 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Cigarettes</h3>
                  {isLoading ? (
                    <div className="mx-auto mt-1 h-6 w-12 animate-pulse rounded bg-muted-foreground/20" />
                  ) : (
                    <p className="text-2xl font-bold">{stats.cigaretteCount}</p>
                  )}
                </div>
                <div className="rounded-2xl bg-muted/40 p-3 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">Favorite Pour</h3>
                  {isLoading ? (
                    <div className="mx-auto mt-1 h-6 w-12 animate-pulse rounded bg-muted-foreground/20" />
                  ) : (
                    <p className="text-base font-bold">{topDrink ? topDrink[0] : "TBD"}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium text-white">Drink breakdown</h3>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="mb-2 h-8 w-full animate-pulse rounded bg-muted-foreground/20" />
                  ))
                ) : (
                  <div className="space-y-2">
                    {Object.entries(stats.drinkTypes || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between rounded-2xl bg-muted/30 px-3 py-2">
                        <div className="flex items-center">
                          <Beer className="mr-2 h-4 w-4 text-yellow-400" />
                          <span>{type}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                    {Object.keys(stats.drinkTypes || {}).length === 0 && (
                      <p className="py-2 text-center text-sm text-muted-foreground">No drinks recorded yet. A tragic lack of evidence.</p>
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

        <div className="space-y-6">
          <Card className="border-gold-500/20 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-gold-300" />
                Party momentum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{currentInsight?.primary?.label ?? "Steady pace"}</p>
                <p className="mt-1">{currentInsight?.primary?.detail ?? "Keep stacking points and the board will start yelling about it."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Flame className="h-4 w-4 text-orange-300" />
                  <p className="font-semibold">Best current flex</p>
                </div>
                <p className="mt-1">
                  {topDrink ? `${topDrink[0]} is doing the heavy lifting with ${topDrink[1]} logged.` : "No favorite pour yet — the field is wide open."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500/20 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Swords className="h-5 w-5 text-rose-300" />
                Duel status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{featureFlags?.duels ? "Duels are live" : "Duels are paused"}</p>
                <p className="mt-1">{duelCopy}</p>
              </div>
              <p>Need to accept or settle something? Head back to the leaderboard duel desk — that&apos;s where the birthday paperwork lives.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
