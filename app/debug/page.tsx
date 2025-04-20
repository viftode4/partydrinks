import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function DebugPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Data</h2>
        <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <p>
          {session ? (
            <span className="text-green-500">✓ Authenticated as {session.user.name}</span>
          ) : (
            <span className="text-red-500">✗ Not authenticated</span>
          )}
        </p>
      </div>
    </div>
  )
}
