"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Beer, Camera, Martini, Upload, Wine } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { uploadProfileImage } from "@/lib/storage"

export default function SignUp() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { status } = useSession()
  
  // Redirect to leaderboard if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/leaderboard")
    }
  }, [status, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (!image) {
      toast({
        title: "Image Required",
        description: "Please upload a profile picture.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Try to initialize buckets first
      try {
        await fetch("/api/init-storage", { method: "GET" });
      } catch (error) {
        console.error("Failed to initialize storage buckets:", error);
        // Continue anyway, as buckets might already exist
      }

      let profileImageUrl = "";
      
      // Upload image using the helper function
      try {
        profileImageUrl = await uploadProfileImage(image);
      } catch (uploadError: any) {
        console.error("Image upload error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          profile_image_url: profileImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Automatically sign in the user after successful registration
      const signInResult = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // If sign-in fails, still redirect to sign-in page
        toast({
          title: "Registration Successful",
          description: "Your account has been created. Please sign in.",
        });
        router.push("/auth/signin");
      } else {
        // If sign-in succeeds, redirect to leaderboard
        toast({
          title: "Registration Successful",
          description: "Welcome to the party!",
        });
        router.push("/leaderboard");
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If still loading the session, show a loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 p-4">
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-4 animate-pulse">
            <Beer className="h-8 w-8 text-yellow-400" />
            <Martini className="h-8 w-8 text-pink-400" />
            <Wine className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 p-4">
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
          <CardTitle className="text-2xl font-bold">Join the Party!</CardTitle>
          <CardDescription>Create an account to join the leaderboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Choose a username"
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Profile Picture (Required)</Label>
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative h-24 w-24">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Profile preview"
                      fill
                      className="rounded-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="absolute -right-2 -top-2 h-8 w-8 rounded-full border-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-24 w-24 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="mb-1 h-6 w-6" />
                      <span className="text-xs">Upload</span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <p className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-purple-500 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
