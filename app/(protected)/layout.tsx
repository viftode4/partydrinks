import type React from "react"
import { MobileNav } from "@/components/mobile-nav"
import { DrinkModal } from "@/components/modals/drink-modal"
import { ConfettiBackground } from "@/components/confetti-background"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="relative flex min-h-screen flex-col pb-16 md:pb-0">
      <ConfettiBackground />
      <div className="relative z-10">
        {children}
      </div>
      <MobileNav />
      <DrinkModal />
    </div>
  )
}
