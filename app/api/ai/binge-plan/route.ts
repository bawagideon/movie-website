import { NextRequest, NextResponse } from "next/server"
import { calculateBingePlan } from "@/lib/ai/engine"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { movies, availableTime } = await req.json()

        if (!movies || !availableTime) {
            return NextResponse.json({ error: "Movies and available time are required" }, { status: 400 })
        }

        const plan = await calculateBingePlan(movies, availableTime)

        return NextResponse.json({ plan })

    } catch (error) {
        console.error("Binge plan calculation failed:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
