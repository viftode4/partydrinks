"use client"

import { Crown, Flame, Swords, TimerReset } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { DuelRow } from "@/lib/duels"
import type { PartyFeatureFlags } from "@/lib/feature-flags"
import {
  findClosestProjectorBattle,
  findProjectorHotStreak,
} from "@/lib/projector"
import type { LeaderboardUser } from "@/lib/types"

interface ProjectorPartyCalloutsProps {
  countdown: number
  duels: DuelRow[]
  flags: PartyFeatureFlags
  isUpdating: boolean
  users: LeaderboardUser[]
}

const openStatuses = new Set<DuelRow["status"]>(["pending", "active"])

export function ProjectorPartyCallouts({
  countdown,
  duels,
  flags,
  isUpdating,
  users,
}: ProjectorPartyCalloutsProps) {
  const leader = users[0] ?? null
  const closestBattle = findClosestProjectorBattle(users)
  const hotStreak = findProjectorHotStreak(users)
  const liveDuel = duels.find((duel) => openStatuses.has(duel.status)) ?? null

  const resolveUserName = (userId: string) => {
    if (!leader && users.length === 0) {
      return "Party guest"
    }

    return users.find((user) => user.id === userId)?.username ?? "Party guest"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border-amber-400/30 bg-white/10 backdrop-blur">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-400/20 text-amber-100">Crown cam</Badge>
            <Crown className="h-5 w-5 text-amber-300" />
          </div>
          {leader ? (
            <>
              <p className="text-2xl font-semibold text-white">{leader.username}</p>
              <p className="text-sm text-white/75">
                Sitting on {leader.total_points} pts and soaking up the spotlight.
              </p>
            </>
          ) : (
            <p className="text-sm text-white/75">Waiting for the first toast to hit the board.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-fuchsia-400/30 bg-white/10 backdrop-blur">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Badge className="bg-fuchsia-400/20 text-fuchsia-100">Rivalry radar</Badge>
            <Swords className="h-5 w-5 text-fuchsia-200" />
          </div>
          {flags.rivalryCallouts && closestBattle ? (
            <>
              <p className="text-lg font-semibold text-white">
                {closestBattle.leader.username} vs {closestBattle.challenger.username}
              </p>
              <p className="text-sm text-white/75">
                {closestBattle.gap === 0
                  ? "Dead heat. Somebody blinked and the board tied."
                  : `${closestBattle.gap} pts apart with the next order ready to flip the script.`}
              </p>
            </>
          ) : (
            <p className="text-sm text-white/75">Rivalry callouts are cooling on the bench for now.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-rose-400/30 bg-white/10 backdrop-blur">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Badge className="bg-rose-400/20 text-rose-100">Hot streak</Badge>
            <Flame className="h-5 w-5 text-rose-200" />
          </div>
          {hotStreak ? (
            <>
              <p className="text-lg font-semibold text-white">{hotStreak.user.username}</p>
              <p className="text-sm text-white/75">
                Up {hotStreak.placesGained} place{hotStreak.placesGained === 1 ? "" : "s"} since the last refresh.
              </p>
            </>
          ) : (
            <p className="text-sm text-white/75">No one is climbing yet. The next drink can light the fuse.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-cyan-400/30 bg-white/10 backdrop-blur">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Badge className="bg-cyan-400/20 text-cyan-100">
              {flags.duels ? "Duel desk" : "Refresh room"}
            </Badge>
            <TimerReset className="h-5 w-5 text-cyan-200" />
          </div>
          {flags.duels && liveDuel ? (
            <>
              <p className="text-lg font-semibold text-white">
                {resolveUserName(liveDuel.challenger_id)} vs {resolveUserName(liveDuel.opponent_id)}
              </p>
              <p className="text-sm text-white/75">
                {liveDuel.status === "active"
                  ? `Live duel for ${liveDuel.wager_points} pts. The projector crowd is officially feral.`
                  : `Pending ${liveDuel.wager_points}-point duel. Somebody still has to accept the chaos.`}
              </p>
            </>
          ) : flags.duels ? (
            <p className="text-sm text-white/75">Duels are armed. The next glove slap starts from the player view.</p>
          ) : (
            <p className="text-sm text-white/75">
              {isUpdating ? "Refreshing the room pulse right now." : `Next board sweep in ${countdown}s.`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
