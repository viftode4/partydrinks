"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { LeaderboardUserCard } from "@/components/leaderboard-user-card"
import { LeaderboardFilter } from "@/components/leaderboard-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { buildPartyInsights } from "@/lib/party-insights"
import type { PartyFeatureFlags } from "@/lib/feature-flags"
import type { Duel, LeaderboardUser } from "@/lib/types"
import { Flame, Swords, TimerReset } from "lucide-react"

export default function LeaderboardContent() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [drinkType, setDrinkType] = useState("all")
  const [duels, setDuels] = useState<Duel[]>([])
  const [featureFlags, setFeatureFlags] = useState<PartyFeatureFlags | null>(null)
  const [duelTargetId, setDuelTargetId] = useState("")
  const [wagerPoints, setWagerPoints] = useState("5")
  const [isSubmittingDuel, setIsSubmittingDuel] = useState(false)
  const usersRef = useRef<LeaderboardUser[]>([])

  const fetchLeaderboard = useCallback(async () => {
    try {
      if (usersRef.current.length === 0) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const response = await fetch(`/api/leaderboard?drinkType=${drinkType}`)
      if (!response.ok) {
        throw new Error("Failed to refresh the birthday leaderboard.")
      }

      const data = (await response.json()) as LeaderboardUser[]
      const updatedData = data.map((user) => {
        const existingUser = usersRef.current.find((currentUser) => currentUser.id === user.id)
        return {
          ...user,
          previousRank: existingUser?.rank ?? user.rank,
        }
      })

      usersRef.current = updatedData
      setUsers(updatedData)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [drinkType])

  const refreshDuelDesk = useCallback(async () => {
    if (!session?.user?.id) {
      return
    }

    try {
      const [flagsResponse, duelsResponse] = await Promise.all([fetch("/api/feature-flags"), fetch("/api/duels")])

      if (flagsResponse.ok) {
        setFeatureFlags((await flagsResponse.json()) as PartyFeatureFlags)
      }

      if (duelsResponse.ok) {
        setDuels((await duelsResponse.json()) as Duel[])
      }
    } catch (error) {
      console.error("Failed to refresh duel desk:", error)
    }
  }, [session?.user?.id])

  useEffect(() => {
    void fetchLeaderboard()
    const intervalId = setInterval(() => {
      void fetchLeaderboard()
    }, 12000)

    return () => clearInterval(intervalId)
  }, [fetchLeaderboard])

  useEffect(() => {
    void refreshDuelDesk()
    const intervalId = setInterval(() => {
      void refreshDuelDesk()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [refreshDuelDesk])

  useEffect(() => {
    const challengeCandidates = users.filter((user) => user.id !== session?.user?.id)
    if (!duelTargetId && challengeCandidates.length > 0) {
      setDuelTargetId(challengeCandidates[0].id)
    }
  }, [duelTargetId, session?.user?.id, users])

  const handleFilterChange = (type: string) => {
    setDrinkType(type)
  }

  const partyInsights = useMemo(() => buildPartyInsights(users), [users])
  const currentUser = useMemo(() => users.find((user) => user.id === session?.user?.id) ?? null, [session?.user?.id, users])
  const challengeCandidates = useMemo(
    () => users.filter((user) => user.id !== session?.user?.id),
    [session?.user?.id, users],
  )

  const nameLookup = useMemo(() => {
    const entries = users.map((user) => [user.id, user.username] as const)
    if (session?.user?.id) {
      entries.push([session.user.id, session.user.name || "You"])
    }

    return new Map(entries)
  }, [session?.user?.id, session?.user?.name, users])

  const getUserLabel = (userId: string) => nameLookup.get(userId) ?? "Mystery menace"

  const handleCreateDuel = async () => {
    if (!duelTargetId) {
      return
    }

    const parsedWager = Number(wagerPoints)
    if (!Number.isFinite(parsedWager) || parsedWager < 1) {
      toast({
        title: "Pick a real wager",
        description: "The birthday host needs at least 1 point on the line.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmittingDuel(true)
      const response = await fetch("/api/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentId: duelTargetId,
          wagerPoints: parsedWager,
          note: "Birthday beef, respectfully filed.",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to launch the duel.")
      }

      toast({
        title: "Duel sent",
        description: `${getUserLabel(duelTargetId)} just got called into the spotlight.`,
      })
      await refreshDuelDesk()
    } catch (error) {
      toast({
        title: "Duel failed",
        description: error instanceof Error ? error.message : "Could not send the challenge.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingDuel(false)
    }
  }

  const handleAcceptDuel = async (duelId: string) => {
    try {
      const response = await fetch(`/api/duels/${duelId}/accept`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to accept duel.")
      }

      toast({
        title: "Duel accepted",
        description: "The crowd has been notified. No backing out now.",
      })
      await refreshDuelDesk()
    } catch (error) {
      toast({
        title: "Could not accept duel",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      })
    }
  }

  const handleResolveDuel = async (duelId: string, winnerUserId: string) => {
    try {
      const response = await fetch(`/api/duels/${duelId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerUserId,
          note: "Logged from the birthday leaderboard.",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to resolve duel.")
      }

      toast({
        title: "Duel settled",
        description: `${getUserLabel(winnerUserId)} gets the bragging rights.`,
      })
      await refreshDuelDesk()
      await fetchLeaderboard()
    } catch (error) {
      toast({
        title: "Could not settle duel",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      })
    }
  }

  const activeOrPendingDuels = duels.filter((duel) => duel.status === "pending" || duel.status === "active").slice(0, 3)

  return (
    <div className="container mx-auto max-w-5xl px-3 py-4 sm:px-4">
      <section className="mb-6 overflow-hidden rounded-[28px] border border-gold-500/20 bg-gradient-to-br from-[#24132f] via-[#17141f] to-[#0d0b14] p-5 shadow-[0_20px_70px_rgba(15,10,30,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-gold-400/20 bg-gold-500/10 text-gold-100">Birthday leaderboard</Badge>
              {isRefreshing && (
                <Badge className="border-sky-400/30 bg-sky-500/10 text-sky-100">
                  <TimerReset className="mr-1 h-3.5 w-3.5" />
                  Refreshing
                </Badge>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Birthday Bash Scoreboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-champagne-200/80 sm:text-base">
                Track the cake-table villains, the podium climbers, and whoever is about to start a perfectly petty duel.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne-300/60">Your standing</p>
              <p className="mt-1 text-2xl font-bold text-white">{currentUser ? `#${currentUser.rank}` : "Joining soon"}</p>
              <p className="text-sm text-champagne-200/70">
                {currentUser ? `${currentUser.total_points} points of birthday mischief.` : "Log a round to crash the party chart."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-champagne-300/60">Closest drama</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {currentUser && partyInsights[currentUser.id]?.rivalry ? partyInsights[currentUser.id]?.rivalry?.label : "Crowd is warming up"}
              </p>
              <p className="text-sm text-champagne-200/70">
                {currentUser && partyInsights[currentUser.id]?.rivalry
                  ? partyInsights[currentUser.id]?.rivalry?.detail
                  : "Once someone gets within five points, the rivalry radar lights up."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <LeaderboardFilter onChange={handleFilterChange} />

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-28 w-full animate-pulse rounded-3xl bg-muted" />
            ))
          ) : users.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gold-500/20 bg-card/60 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-white">No party stats yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Someone has to be brave enough to log the first round.</p>
            </div>
          ) : (
            users.map((user) => (
              <LeaderboardUserCard
                key={user.id}
                user={user}
                isCurrentUser={user.id === session?.user?.id}
                insight={partyInsights[user.id]}
              />
            ))
          )}
        </div>

        <Card className="border-gold-500/20 bg-card/80 shadow-lg shadow-black/20">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Swords className="h-5 w-5 text-rose-300" />
                  Duel desk
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quick 1v1 side quests for people who want their bragging rights signed in glitter.
                </p>
              </div>
              {featureFlags?.duels ? (
                <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100">Live</Badge>
              ) : (
                <Badge className="border-amber-400/30 bg-amber-500/10 text-amber-100">Host paused</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {featureFlags?.duels ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Call someone out</p>
                  <p className="mt-1 text-sm text-muted-foreground">Keep it playful. Keep it score-settling.</p>
                  <div className="mt-3 space-y-3">
                    <select
                      value={duelTargetId}
                      onChange={(event) => setDuelTargetId(event.target.value)}
                      className="w-full rounded-xl border border-gold-500/20 bg-background px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="">Pick your rival</option>
                      {challengeCandidates.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <Input
                        value={wagerPoints}
                        onChange={(event) => setWagerPoints(event.target.value)}
                        inputMode="numeric"
                        placeholder="Wager"
                        className="border-gold-500/20"
                      />
                      <Button
                        onClick={handleCreateDuel}
                        disabled={!duelTargetId || isSubmittingDuel}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-fuchsia-500 font-semibold text-white hover:from-rose-400 hover:to-fuchsia-400"
                      >
                        {isSubmittingDuel ? "Calling them out..." : "Start duel"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Open drama</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {activeOrPendingDuels.length} live
                    </p>
                  </div>
                  {activeOrPendingDuels.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gold-500/20 px-4 py-5 text-sm text-muted-foreground">
                      Quiet for now. That usually means somebody is plotting.
                    </div>
                  ) : (
                    activeOrPendingDuels.map((duel) => {
                      const challengerName = getUserLabel(duel.challenger_id)
                      const opponentName = getUserLabel(duel.opponent_id)
                      const isOpponent = duel.opponent_id === session?.user?.id
                      const isParticipant = duel.opponent_id === session?.user?.id || duel.challenger_id === session?.user?.id

                      return (
                        <div key={duel.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">
                                {challengerName} vs {opponentName}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {duel.status === "pending"
                                  ? `${challengerName} started the nonsense for ${duel.wager_points} points.`
                                  : `${duel.wager_points} points on the line. Somebody has to blink first.`}
                              </p>
                            </div>
                            <Badge className="border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100">
                              {duel.status}
                            </Badge>
                          </div>

                          {duel.status === "pending" && isOpponent && (
                            <Button
                              onClick={() => void handleAcceptDuel(duel.id)}
                              className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white hover:from-emerald-400 hover:to-teal-400"
                            >
                              Accept duel
                            </Button>
                          )}

                          {duel.status === "active" && isParticipant && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              <Button
                                variant="outline"
                                onClick={() => void handleResolveDuel(duel.id, duel.challenger_id)}
                                className="border-gold-500/30"
                              >
                                {challengerName} wins
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => void handleResolveDuel(duel.id, duel.opponent_id)}
                                className="border-gold-500/30"
                              >
                                {opponentName} wins
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gold-500/20 px-4 py-5 text-sm text-muted-foreground">
                The host has duels on ice right now. Keep farming points and the rivalry radar will keep feeding the drama.
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white">
                <Flame className="h-4 w-4 text-orange-300" />
                <p className="font-semibold">Birthday heat check</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {currentUser && partyInsights[currentUser.id]?.primary
                  ? partyInsights[currentUser.id]?.primary?.detail
                  : "Keep logging rounds — the board starts shouting once the podium gets tight."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
