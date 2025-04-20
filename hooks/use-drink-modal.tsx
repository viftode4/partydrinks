import { create } from "zustand"

interface DrinkModalStore {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useDrinkModal = create<DrinkModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
