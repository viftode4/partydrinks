"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface LeaderboardFilterProps {
  onChange: (includewins: boolean) => void
}

export function LeaderboardFilter({ onChange }: LeaderboardFilterProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("all")

  const options = [
    { value: "all", label: "All Users" },
    { value: "nonChamps", label: "Non-Champs" },
    { value: "champs", label: "Champs Only" },
  ]

  const handleSelect = (currentValue: string) => {
    setValue(currentValue)
    setOpen(false)

    if (currentValue === "champs") {
      onChange(true)
    } else if (currentValue === "nonChamps") {
      onChange(false)
    } else {
      onChange(true) // Default to showing all
    }
  }

  return (
    <div className="flex items-center justify-between pb-4">
      <h2 className="text-lg font-bold">Leaderboard</h2>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-48 justify-between">
            {value ? options.find((option) => option.value === value)?.label : "Filter"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <Command>
            <CommandInput placeholder="Search filter..." />
            <CommandList>
              <CommandEmpty>No filter found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    <div className="flex items-center">
                      {option.value === "champs" && <Dices className="mr-2 h-4 w-4" />}
                      {option.label}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
