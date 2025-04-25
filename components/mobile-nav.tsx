"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDrinkModal } from "@/hooks/use-drink-modal"

export function MobileNav() {
  const pathname = usePathname()
  const { onOpen } = useDrinkModal()

  // Don't render navigation on auth pages or projector view
  if (pathname.startsWith("/auth") || pathname === "/projector" || pathname === "/") {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t bg-background md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-4">
        <Link href="/leaderboard" className="group inline-flex flex-col items-center justify-center px-5">
          <Button
            variant="ghost"
            className={cn("h-10 w-10 rounded-full p-0", pathname === "/leaderboard" && "bg-primary/10 text-primary")}
          >
            <Home className="h-5 w-5" />
            <span className="sr-only">Leaderboard</span>
          </Button>
          <span className={cn("text-xs", pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground")}>
            Leaderboard
          </span>
        </Link>

        <Link href="/tweets" className="group inline-flex flex-col items-center justify-center px-5">
          <Button
            variant="ghost"
            className={cn("h-10 w-10 rounded-full p-0", pathname === "/tweets" && "bg-primary/10 text-primary")}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Tweets</span>
          </Button>
          <span className={cn("text-xs", pathname === "/tweets" ? "text-primary" : "text-muted-foreground")}>
            Tweets
          </span>
        </Link>

        <button onClick={onOpen} className="group inline-flex flex-col items-center justify-center px-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 text-white">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Drink</span>
          </div>
        </button>

        <Link href="/profile" className="group inline-flex flex-col items-center justify-center px-5">
          <Button
            variant="ghost"
            className={cn("h-10 w-10 rounded-full p-0", pathname === "/profile" && "bg-primary/10 text-primary")}
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
          <span className={cn("text-xs", pathname === "/profile" ? "text-primary" : "text-muted-foreground")}>
            Profile
          </span>
        </Link>
      </div>
    </div>
  )
}
