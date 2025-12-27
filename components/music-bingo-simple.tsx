"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Song {
    id: string
    uri: string
    title: string
    artist: string
    image?: string
}

interface MusicBingoSimpleProps {
    songs: Song[]
    accessToken: string
}

export function MusicBingoSimple({ songs, accessToken }: MusicBingoSimpleProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const toggleSelection = (songId: string) => {
        const newSelected = new Set(selected)
        if (newSelected.has(songId)) {
            newSelected.delete(songId)
        } else {
            newSelected.add(songId)
        }
        setSelected(newSelected)
    }

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {songs.map((song) => (
                    <Card
                        key={song.id}
                        className={`p-2 sm:p-4 cursor-pointer transition-all border-2 ${selected.has(song.id)
                            ? "bg-green-500 text-white border-green-700"
                            : "bg-white border-gray-200 hover:border-gray-400"
                            }`}
                        onClick={() => toggleSelection(song.id)}
                    >
                        <div className="flex flex-col gap-2 sm:gap-3">
                            {song.image && (
                                <img
                                    src={song.image}
                                    alt={song.title}
                                    className="w-full h-20 sm:h-32 object-cover rounded"
                                />
                            )}
                            <div className="flex-1">
                                <h3
                                    className={`font-semibold text-xs sm:text-sm truncate ${selected.has(song.id) ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    {song.title}
                                </h3>
                                <p
                                    className={`text-xs sm:text-xs truncate ${selected.has(song.id) ? "text-gray-100" : "text-gray-600"
                                        }`}
                                >
                                    {song.artist}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-100 rounded">
                <p className="text-xs sm:text-sm">Selected: {selected.size} songs</p>
            </div>
        </div>
    )
}
