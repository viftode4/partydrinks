"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const error = searchParams.get("error")

    if (error === "CredentialsSignin") {
      setErrorMessage("That username/password combo did not match the guest list. Try again.")
    } else if (error === "SessionRequired") {
      setErrorMessage("That page needs a signed-in party guest before it can open.")
    } else if (error) {
      setErrorMessage(`Authentication hiccup: ${error}`)
    } else {
      setErrorMessage("An unknown sign-in issue popped up.")
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Couldn&apos;t get you into the party</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Try the sign-in flow again, or create a fresh badge if you were supposed to join for the first time.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Link href="/auth/signin">Return to Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/signup">Create Account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
