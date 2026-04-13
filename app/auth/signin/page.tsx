import { Suspense } from "react"
import { Beer, Martini, Wine } from "lucide-react"
import SignInForm from "./SignInForm"

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-4">
          <div className="text-center text-white">
            <div className="mb-4 flex justify-center gap-3">
              <Beer className="h-8 w-8 animate-bounce text-yellow-300" />
              <Martini className="h-8 w-8 animate-bounce text-pink-200 [animation-delay:150ms]" />
              <Wine className="h-8 w-8 animate-bounce text-rose-200 [animation-delay:300ms]" />
            </div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/70">Signing you in</p>
            <p className="mt-3 text-lg font-semibold">Loading the front door...</p>
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
