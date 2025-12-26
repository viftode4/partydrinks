"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SongCard {
    id: string
    number: number
}

interface MusicBingoCardsProps {
    songs: SongCard[]
}

export function MusicBingoCards({ songs }: MusicBingoCardsProps) {
    return (
        <div className="grid grid-cols-3 gap-4 w-full">
            {Array.from({ length: 9 }).map((_, index) => {
                const song = songs[index]
                return (
                    <Card
                        key={index}
                        className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 hover:shadow-lg transition-shadow"
                    >
                        <div className="text-center space-y-2">
                            <div className="text-sm font-semibold opacity-80">Round {index + 1}</div>
                            {song ? (
                                <Badge variant="secondary" className="text-lg px-3 py-1 font-mono">
                                    {song.id.substring(0, 8)}...
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                    ?
                                </Badge>
                            )}
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
