"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MessageSquare, Film } from "lucide-react"

interface HistoryFeedProps {
    userId: string
}

export function HistoryFeed({ userId }: HistoryFeedProps) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchHistory = async () => {
            // Fetch mood sessions
            const { data: moodSessions, error } = await supabase
                .from("user_mood_sessions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(10)

            if (error) {
                console.error("Error fetching history:", error)
            } else {
                setHistory(moodSessions || [])
            }
            setLoading(false)
        }

        fetchHistory()
    }, [userId, supabase])

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No recent activity found. Start exploring to build your history!
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {history.map((item) => (
                <Card key={item.id}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Mood Search
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm italic mb-2">"{item.mood_query}"</p>
                        <div className="bg-muted/50 p-3 rounded-md text-sm">
                            {item.ai_explanation}
                        </div>
                        {item.recommended_movies && item.recommended_movies.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                {item.recommended_movies.map((movie: any) => (
                                    <div key={movie.id} className="flex-shrink-0 w-16">
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-full rounded-md shadow-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
