import type { Database } from "@/types/supabase"

export type AuthoritativeRankingRow = Database["public"]["Views"]["authoritative_rankings"]["Row"]

export interface RankedAuthoritativeUser extends AuthoritativeRankingRow {
  rank: number
}

export function buildAuthoritativeRankings(rows: ReadonlyArray<AuthoritativeRankingRow>) {
  return rows
    .filter((row) => row.total_points > 0)
    .sort((left, right) => {
      if (right.total_points !== left.total_points) {
        return right.total_points - left.total_points
      }

      return left.username.localeCompare(right.username)
    })
    .map<RankedAuthoritativeUser>((row, index) => ({
      ...row,
      rank: index + 1,
    }))
}
