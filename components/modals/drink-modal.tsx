"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useDrinkModal } from "@/hooks/use-drink-modal"
import { Beer, Cigarette, Martini, Wine } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const DRINK_TYPES = [
  { type: "Beer", icon: Beer, color: "bg-gradient-to-br from-gold-500 to-gold-600", hoverColor: "hover:from-gold-400 hover:to-gold-500", textColor: "text-midnight", emoji: "🍺" },
  { type: "Cocktail", icon: Martini, color: "bg-gradient-to-br from-pink-500 to-pink-600", hoverColor: "hover:from-pink-400 hover:to-pink-500", textColor: "text-white", emoji: "🍸" },
  { type: "Wine", icon: Wine, color: "bg-gradient-to-br from-red-600 to-red-700", hoverColor: "hover:from-red-500 hover:to-red-600", textColor: "text-white", emoji: "🍷" },
  { type: "Shot", icon: Martini, color: "bg-gradient-to-br from-amber-500 to-amber-600", hoverColor: "hover:from-amber-400 hover:to-amber-500", textColor: "text-midnight", emoji: "🥃" },
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

  const addCigarette = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to add a cigarette.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/cigarettes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to add cigarette")
      }

      toast({
        title: "Cigarette Added!",
        description: "Your cigarette has been counted.",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add cigarette. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-midnight to-midnight-100 border-gold-500/20">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gold-400">
            🎉 Add to your score 🎉
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-2">
          <div className="grid grid-cols-2 gap-4">
            {DRINK_TYPES.map((drink) => {
              const isDisabled = isSubmitting || (Date.now() - (lastDrinkTime[drink.type] || 0) < 5000)
              return (
                <motion.button
                  key={drink.type}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-5 transition-all shadow-lg",
                    drink.color,
                    drink.hoverColor,
                    drink.textColor,
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => addDrink(drink.type)}
                  disabled={isDisabled}
                >
                  <span className="text-3xl mb-2">{drink.emoji}</span>
                  <drink.icon className="mb-1 h-6 w-6" />
                  <span className="font-semibold">{drink.type}</span>
                </motion.button>
              )
            })}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center justify-center gap-3 rounded-lg bg-midnight-50 border border-gold-500/20 px-6 py-4 text-champagne-200 hover:bg-midnight hover:border-gold-500/40 transition-all",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
            onClick={addCigarette}
            disabled={isSubmitting}
          >
            <Cigarette className="h-5 w-5" />
            <span className="font-medium">Add Cigarette</span>
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
