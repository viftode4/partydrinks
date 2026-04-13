"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Beer, Martini, Wine } from "lucide-react"
import { motion } from "framer-motion"

export default function SignInForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/leaderboard"
  const { status } = useSession()
  const returningToProtectedPage = callbackUrl !== "/leaderboard"
  
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl)
    }
  }, [callbackUrl, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Authentication Error",
          description: "That username/password combo did not make the guest list. Try again.",
          variant: "destructive",
        })
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "The front door jammed for a second. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 p-4">
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-4 animate-pulse">
            <Beer className="h-8 w-8 text-yellow-400" />
            <Martini className="h-8 w-8 text-pink-400" />
            <Wine className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-white">Getting the party door ready...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center gap-3 mb-4">
            <motion.div
              initial={{ rotate: -10, y: 10 }}
              animate={{ rotate: 10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1 }}
            >
              <Beer className="h-8 w-8 text-yellow-400" />
            </motion.div>
            <motion.div
              initial={{ rotate: 10, y: 10 }}
              animate={{ rotate: -10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1.3 }}
            >
              <Martini className="h-8 w-8 text-pink-400" />
            </motion.div>
            <motion.div
              initial={{ rotate: -10, y: 10 }}
              animate={{ rotate: 10, y: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 0.8 }}
            >
              <Wine className="h-8 w-8 text-red-500" />
            </motion.div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back to the birthday floor</CardTitle>
          <CardDescription>
            Sign in to jump into the leaderboard, party posts, and projector-ready chaos.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/60 p-3 text-left text-sm text-muted-foreground">
              {returningToProtectedPage
                ? "Sign in and we’ll send you straight back to the page that asked for you."
                : "Your profile photo, posts, and leaderboard standing will be waiting on the other side."}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Opening the velvet rope..." : "Let me in"}
            </Button>
            <p className="mt-4 text-center text-sm">
              Need a party badge?{" "}
              <Link href="/auth/signup" className="text-purple-500 hover:underline">
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
