"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Movie } from "@/lib/tmdb"
import { getImageUrl } from "@/lib/tmdb"

interface MoodSession {
    id: string
    mood_query: string
    ai_explanation: string
    recommended_movies: Movie[]
    created_at: string
}

export function MoodVault() {
    const [sessions, setSessions] = useState<MoodSession[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("user_mood_sessions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (error) throw error
            setSessions(data || [])
        } catch (error) {
            console.error("Error fetching mood sessions:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("user_mood_sessions")
                .delete()
                .eq("id", id)

            if (error) throw error

            setSessions(sessions.filter(s => s.id !== id))
            toast({
                title: "Session deleted",
                description: "Mood session removed from your vault.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete session.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return <div className="text-center py-10">Loading your mood history...</div>
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-muted/10">
                <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Mood Sessions Yet</h3>
                <p className="text-muted-foreground">
                    Go to the dashboard and ask the AI for a recommendation!
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
                <Card key={session.id} className="group relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-medium line-clamp-1">
                                "{session.mood_query}"
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(session.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(session.created_at).toLocaleDateString()}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                            {session.ai_explanation}
                        </p>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {session.recommended_movies.map((movie) => (
                                <div key={movie.id} className="flex-shrink-0 w-16 space-y-1">
                                    <img
                                        src={getImageUrl(movie.poster_path, "w200") || "/placeholder.svg"}
                                        alt={movie.title}
                                        className="w-full aspect-[2/3] object-cover rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
