"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface MusicBingoCodeInputProps {
    onValidate: (isValid: boolean) => void
    onRetry: () => void
    playedSongIds: string[]
}

export function MusicBingoCodeInput({
    onValidate,
    onRetry,
    playedSongIds,
}: MusicBingoCodeInputProps) {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        isValid: boolean
        message: string
    } | null>(null)

    const handleSubmit = async () => {
        if (!code.trim()) return

        setLoading(true)
        try {
            const response = await fetch("/api/music-bingo/validate-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    playedSongIds,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setResult({
                    isValid: data.isValid,
                    message: data.message,
                })
                onValidate(data.isValid)
            } else {
                setResult({
                    isValid: false,
                    message: data.error || "Error validating code",
                })
            }
        } catch (error) {
            setResult({
                isValid: false,
                message: "Error validating code",
            })
        } finally {
            setLoading(false)
        }
    }

    if (result) {
        return (
            <Card className={`w-full p-8 text-center border-0 ${result.isValid ? "bg-gradient-to-br from-green-500 to-emerald-500" : "bg-gradient-to-br from-orange-500 to-red-500"} text-white`}>
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold">{result.isValid ? "🎉 Winner!" : "Try Again"}</h2>
                    <p className="text-lg">{result.message}</p>
                    <div className="text-sm opacity-80">
                        <p>Played songs: {playedSongIds.length}</p>
                        <p className="mt-1">Song IDs: {playedSongIds.slice(0, 3).join(", ")}...</p>
                    </div>
                    <Button
                        onClick={onRetry}
                        variant="secondary"
                        size="lg"
                        className="w-full"
                    >
                        {result.isValid ? "Play Again" : "Retry"}
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="w-full p-8 bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-0 space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Enter Your Code</h2>
                <p className="text-sm text-white/80">
                    Input the 9 Spotify song IDs (from each round) separated by commas
                </p>
            </div>

            <div className="space-y-4">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste the song IDs from your 9 rounds, separated by commas"
                    className="w-full p-4 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:border-white/60 resize-none font-mono text-sm"
                    rows={4}
                />

                <div className="bg-white/10 rounded p-3 text-sm text-white/80">
                    <p className="font-semibold mb-1">📍 Your played songs:</p>
                    <div className="flex flex-wrap gap-2">
                        {playedSongIds.map((id) => (
                            <span
                                key={id}
                                className="bg-white/20 px-2 py-1 rounded text-xs font-mono"
                            >
                                {id.substring(0, 8)}...
                            </span>
                        ))}
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size="lg"
                            className="w-full bg-white text-indigo-600 hover:bg-white/90"
                            disabled={!code.trim() || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Validating...
                                </>
                            ) : (
                                "Submit Code"
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Your Code</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure about this code? Double-check before submitting!
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 break-all max-h-24 overflow-y-auto">
                            {code}
                        </div>
                        <div className="flex gap-3">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmit}>
                                Submit
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    )
}
