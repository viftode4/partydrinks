"use client"

import { useState } from "react"
import { Beer, Wine, Martini, Cigarette, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardFilterProps {
  onChange: (drinkType: string) => void
}

const TABS = [
  { value: "all", label: "All", icon: Trophy, emoji: "🏆" },
  { value: "Beer", label: "Beer", icon: Beer, emoji: "🍺" },
  { value: "Wine", label: "Wine", icon: Wine, emoji: "🍷" },
  { value: "Cocktail", label: "Cocktails", icon: Martini, emoji: "🍸" },
  { value: "Shot", label: "Shots", icon: Martini, emoji: "🥃" },
  { value: "cigarettes", label: "Cigs", icon: Cigarette, emoji: "🚬" },
]

export function LeaderboardFilter({ onChange }: LeaderboardFilterProps) {
  const [selected, setSelected] = useState("all")

  const handleSelect = (value: string) => {
    setSelected(value)
    onChange(value)
  }

  return (
    <div className="mb-4 -mx-2 px-2 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleSelect(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all",
              "border whitespace-nowrap",
              selected === tab.value
                ? "bg-gradient-to-r from-gold-500 to-gold-600 text-midnight border-gold-500 shadow-lg shadow-gold-500/20"
                : "bg-midnight-50 text-champagne-300 border-gold-500/20 hover:border-gold-500/40 hover:bg-midnight"
            )}
          >
            <span className="text-base">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
