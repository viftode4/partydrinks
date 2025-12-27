"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useDrinkModal } from "@/hooks/use-drink-modal"
import { Beer, Dices, Martini, Wine } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const DRINK_TYPES = [
  { type: "Beer", icon: Beer, color: "bg-yellow-500", hoverColor: "hover:bg-yellow-600" },
  { type: "Cocktail", icon: Martini, color: "bg-pink-500", hoverColor: "hover:bg-pink-600" },
  { type: "Wine", icon: Wine, color: "bg-red-500", hoverColor: "hover:bg-red-600" },
  { type: "Shot", icon: Martini, color: "bg-purple-500", hoverColor: "hover:bg-purple-600" },
]

export function DrinkModal() {
  const { data: session } = useSession()
  const { isOpen, onClose } = useDrinkModal()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastDrinkTime, setLastDrinkTime] = useState<{ [key: string]: number }>({})

  const addDrink = async (drinkType: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to add a drink.",
        variant: "destructive",
      })
      return
    }

    // Check if this drink type was added recently
    const now = Date.now()
    const lastDrink = lastDrinkTime[drinkType] || 0
    if (now - lastDrink < 5000) { // 5 second cooldown
      toast({
        title: "Too Fast!",
        description: "Please wait a moment before adding another drink.",
        variant: "default",
      })
      return
    }

    setIsSubmitting(true)
    setLastDrinkTime(prev => ({ ...prev, [drinkType]: now }))

    try {
      const response = await fetch("/api/drinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drink_type: drinkType,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 429) {
          toast({
            title: "Too Many Drinks",
            description: data.message,
            variant: "default",
          })
        } else {
          throw new Error(data.message || "Failed to add drink")
        }
        return
      }

      toast({
        title: "Drink Added!",
        description: `Your ${drinkType.toLowerCase()} has been added to your score.`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add drink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addwin = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to add a win.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/wins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to add win")
      }

      toast({
        title: "Win Added!",
        description: "Your victory has been counted.",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add win. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Add to your score</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            {DRINK_TYPES.map((drink) => {
              const isDisabled = isSubmitting || (Date.now() - (lastDrinkTime[drink.type] || 0) < 5000)
              return (
                <motion.button
                  key={drink.type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg p-4 text-white transition-colors",
                    drink.color,
                    drink.hoverColor,
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => addDrink(drink.type)}
                  disabled={isDisabled}
                >
                  <drink.icon className="mb-2 h-8 w-8" />
                  <span className="font-medium">{drink.type}</span>
                </motion.button>
              )
            })}
          </div>
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-3 text-white hover:bg-gray-700",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
              onClick={addwin}
              disabled={isSubmitting}
            >
              <Dices className="h-5 w-5" />
              <span className="font-medium">Add win</span>
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
