import { NextRequest, NextResponse } from "next/server"
import { generatePersonalizedPicks } from "@/lib/ai/engine"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { mood } = await req.json()

        if (!mood) {
            return NextResponse.json({ error: "Mood is required" }, { status: 400 })
        }

        // Fetch user profile (mocked for now as we might not have preferences yet)
        const userProfile = {
            id: user.id,
            username: user.user_metadata.full_name || "User",
            preferences: {} // In a real app, fetch from public.profiles
        }

        const { searchParams, explanation } = await generatePersonalizedPicks(userProfile, mood)

        // Now call TMDB with these params
        const tmdbQuery = new URLSearchParams({
            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY!,
            include_adult: "false",
            language: "en-US",
            page: "1",
            ...searchParams
        })

        const tmdbRes = await fetch(`https://api.themoviedb.org/3/discover/movie?${tmdbQuery.toString()}`)
        const tmdbData = await tmdbRes.json()
        const movies = tmdbData.results || []

        // Save session to DB
        if (user) {
            await supabase.from("user_mood_sessions").insert({
                user_id: user.id,
                mood_query: mood,
                ai_explanation: explanation,
                recommended_movies: movies.slice(0, 5), // Store top 5 recommendations
            })
        }

        return NextResponse.json({
            movies: movies,
            explanation
        })

    } catch (error) {
        console.error("Personalized search failed:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
