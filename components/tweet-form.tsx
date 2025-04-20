"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Camera, X, Send } from "lucide-react"
import Image from "next/image"
import { uploadTweetImage } from "@/lib/storage"

const MAX_CHARS = 300

export function TweetForm({ onTweetPosted }: { onTweetPosted: () => void }) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setContent(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to post.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some text for your post.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Initialize storage buckets first
      try {
        await fetch("/api/init-storage", { method: "GET" });
      } catch (error) {
        console.error("Failed to initialize storage buckets:", error);
        // Continue anyway, as buckets might already exist
      }
      
      let imageUrl = null

      // Upload image if there is one
      if (image) {
        try {
          // Use the helper function from lib/storage
          imageUrl = await uploadTweetImage(image);
        } catch (uploadError: any) {
          console.error("Image upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
      }

      // Submit tweet
      const response = await fetch("/api/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post tweet")
      }

      // Reset form
      setContent("")
      setImage(null)
      setImagePreview(null)

      toast({
        title: "Success!",
        description: "Your post has been published.",
      })

      // Refresh tweets
      onTweetPosted()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="rounded-lg border bg-background">
            <Textarea
              placeholder="What's happening at the party? (300 characters max)"
              value={content}
              onChange={handleContentChange}
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-3"
            />
            <div className="flex justify-between items-center px-3 py-2 border-t">
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Photo
                </Button>
              </div>
              <div className={`text-xs ${content.length > MAX_CHARS * 0.9 ? "text-amber-500" : "text-muted-foreground"}`}>
                {content.length}/{MAX_CHARS}
              </div>
            </div>
          </div>
          
          {imagePreview && (
            <div className="relative mt-3 rounded-lg overflow-hidden border">
              <div className="aspect-video relative">
                <Image
                  src={imagePreview}
                  alt="Tweet image"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="px-4 pb-4 pt-0 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || content.length === 0}
            className="bg-pink-500 hover:bg-pink-600"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Posting...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Post
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
