import { NextRequest, NextResponse } from "next/server"
import { generateAIInsight } from "@/lib/ai/engine"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { movieTitle, movieOverview } = await req.json()

        if (!movieTitle) {
            return NextResponse.json({ error: "Movie title is required" }, { status: 400 })
        }

        // Fetch user profile (mocked for now)
        const userProfile = {
            id: user.id,
            username: user.user_metadata.full_name || "User",
            preferences: {} // In a real app, fetch from public.profiles
        }

        const insight = await generateAIInsight(userProfile, movieTitle, movieOverview)

        return NextResponse.json({ insight })

    } catch (error) {
        console.error("AI Insight generation failed:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
