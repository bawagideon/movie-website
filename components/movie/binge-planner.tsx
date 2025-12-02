"use client"

import { useState } from "react"
import { Calendar, Clock, Film, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Movie, MovieCollection } from "@/lib/tmdb"

interface BingePlannerProps {
    movie: Movie
    collection: MovieCollection | null
    similarMovies: Movie[]
}

export function BingePlanner({ movie, collection, similarMovies }: BingePlannerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [availableTime, setAvailableTime] = useState(240) // 4 hours default
    const [plan, setPlan] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handlePlan = async () => {
        setLoading(true)
        try {
            // Determine candidate movies
            let candidates: string[] = []

            if (collection) {
                candidates = collection.parts.map(p => p.title)
            } else {
                // Double feature: Current movie + top 3 similar
                candidates = [movie.title, ...similarMovies.slice(0, 3).map(m => m.title)]
            }

            const res = await fetch("/api/ai/binge-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    movies: candidates,
                    availableTime
                }),
            })

            const data = await res.json()
            setPlan(data.plan)
        } catch (error) {
            console.error("Failed to plan binge:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {collection ? "Plan Collection Binge" : "Plan Double Feature"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {collection ? `Binge ${collection.name}` : "Plan a Movie Night"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Available Time</span>
                            <span className="font-bold text-primary">
                                {Math.floor(availableTime / 60)}h {availableTime % 60}m
                            </span>
                        </div>
                        <Slider
                            value={[availableTime]}
                            onValueChange={(vals) => setAvailableTime(vals[0])}
                            min={120}
                            max={720}
                            step={30}
                            className="py-4"
                        />
                        <p className="text-xs text-muted-foreground">
                            How much time do you have? We'll fit the best movies into your schedule.
                        </p>
                    </div>

                    {!plan && (
                        <Button onClick={handlePlan} disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Calculating Schedule...
                                </>
                            ) : (
                                <>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Generate Schedule
                                </>
                            )}
                        </Button>
                    )}

                    {plan && (
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Film className="h-4 w-4 text-primary" />
                                Your Binge Plan
                            </h3>
                            <div className="space-y-4">
                                {plan.schedule?.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className="min-w-[60px] font-mono text-muted-foreground">
                                            {item.time}
                                        </div>
                                        <div>
                                            <div className="font-medium">{item.activity}</div>
                                            {item.duration && (
                                                <div className="text-xs text-muted-foreground">{item.duration}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t text-xs text-muted-foreground">
                                Total Duration: {plan.totalDuration} minutes
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full mt-2"
                                onClick={() => {
                                    const now = new Date()
                                    const start = new Date(now.getTime() + 60 * 60 * 1000) // Start in 1 hour
                                    const end = new Date(start.getTime() + plan.totalDuration * 60 * 1000)

                                    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "")

                                    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cinema80//Binge Planner//EN
BEGIN:VEVENT
UID:${Date.now()}@cinema80.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:Movie Binge: ${movie.title} & Friends
DESCRIPTION:Your custom binge plan from Cinema80.\n\n${plan.schedule.map((i: any) => `${i.time}: ${i.activity}`).join('\\n')}
END:VEVENT
END:VCALENDAR`

                                    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
                                    const link = document.createElement("a")
                                    link.href = window.URL.createObjectURL(blob)
                                    link.download = "binge-plan.ics"
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                }}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Add to Calendar
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
