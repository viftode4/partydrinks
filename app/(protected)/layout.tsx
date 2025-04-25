import type React from "react"
import { MobileNav } from "@/components/mobile-nav"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      {children}
      <MobileNav />
    </div>
  )
}
