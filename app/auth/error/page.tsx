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
      setErrorMessage("Invalid username or password. Please try again.")
    } else if (error === "SessionRequired") {
      setErrorMessage("You need to be signed in to access this page.")
    } else if (error) {
      setErrorMessage(`Authentication error: ${error}`)
    } else {
      setErrorMessage("An unknown authentication error occurred.")
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Please try signing in again or contact support if the problem persists.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Link href="/auth/signin">Return to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
