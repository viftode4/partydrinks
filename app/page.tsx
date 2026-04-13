"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Beer, Camera, Martini, Trophy, Wine } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const partyHighlights = [
  {
    title: "Live leaderboard energy",
    description: "Jump straight into the birthday standings and see who is on a heater.",
    icon: Trophy,
  },
  {
    title: "Party-post in seconds",
    description: "Drop tweets, reactions, and inside jokes without leaving the action.",
    icon: Martini,
  },
  {
    title: "Projector-ready profile",
    description: "Pick a photo so the big screen knows exactly who stole the spotlight.",
    icon: Camera,
  },
]

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/leaderboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 px-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center gap-3">
            <Beer className="h-10 w-10 animate-bounce text-yellow-300" />
            <Martini className="h-10 w-10 animate-bounce text-pink-200 [animation-delay:150ms]" />
            <Wine className="h-10 w-10 animate-bounce text-rose-200 [animation-delay:300ms]" />
          </div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/70">Birthday mode</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Setting the party floor</h1>
          <p className="mt-2 text-white/80">Checking your session and warming up the leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-10">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Birthday party HQ</p>
            <div className="mb-6 mt-4 flex justify-center gap-3 lg:justify-start">
              <motion.div
                initial={{ rotate: -10, y: 10 }}
                animate={{ rotate: 10, y: 0 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1 }}
              >
                <Beer className="h-12 w-12 text-yellow-300" />
              </motion.div>
              <motion.div
                initial={{ rotate: 10, y: 10 }}
                animate={{ rotate: -10, y: 0 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1.3 }}
              >
                <Martini className="h-12 w-12 text-pink-200" />
              </motion.div>
              <motion.div
                initial={{ rotate: -10, y: 10 }}
                animate={{ rotate: 10, y: 0 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 0.8 }}
              >
                <Wine className="h-12 w-12 text-rose-200" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Keep the birthday chaos fun, fast, and impossible to miss.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Sign in to post party updates, flex on the leaderboard, and make sure your face is ready for projector
              callouts when the room gets loud.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-purple-700 hover:bg-white/90 sm:w-auto"
              >
                <Link href="/auth/signup">Claim your party badge</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto"
              >
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">What you unlock</p>
              <div className="mt-5 space-y-4">
                {partyHighlights.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-white/10 p-2">
                        <Icon className="h-5 w-5 text-yellow-200" />
                      </div>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-white/75">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
