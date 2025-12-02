"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, History, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoodSession {
    id: string
    name: string
    mood: string
    color: string
    icon: string
}

// Mock data for initial UI
const MOCK_SESSIONS: MoodSession[] = [
    { id: "1", name: "Cozy Sunday", mood: "Warm, relaxing, low stakes", color: "from-orange-500 to-amber-500", icon: "☕" },
    { id: "2", name: "Cyberpunk Vibes", mood: "Neon, dystopian, high tech", color: "from-purple-500 to-pink-500", icon: "🌆" },
    { id: "3", name: "Brain Teasers", mood: "Complex plot, mystery, thriller", color: "from-blue-500 to-cyan-500", icon: "🧩" },
    { id: "4", name: "80s Nostalgia", mood: "Synthwave, retro, action", color: "from-fuchsia-500 to-purple-600", icon: "📼" },
    { id: "5", name: "Space Opera", mood: "Epic scale, space, adventure", color: "from-indigo-500 to-violet-500", icon: "🚀" },
]

export function MoodDeck() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false })

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <div className="w-full py-8 space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-bold tracking-tight">Your Mood Deck</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={scrollPrev} className="rounded-full h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={scrollNext} className="rounded-full h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4 p-1">
                    {MOCK_SESSIONS.map((session) => (
                        <div key={session.id} className="flex-[0_0_280px] min-w-0">
                            <Card className="group relative overflow-hidden border-0 bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer h-full">
                                <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br transition-opacity group-hover:opacity-20", session.color)} />
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <span className="text-4xl">{session.icon}</span>
                                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="h-4 w-4 fill-current" />
                                        </Button>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-none mb-2">{session.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{session.mood}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
