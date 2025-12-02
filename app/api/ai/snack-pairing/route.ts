import { NextRequest, NextResponse } from "next/server"
import { generateSnackPairing } from "@/lib/ai/engine"

export async function POST(req: NextRequest) {
    try {
        const { movieTitle, movieGenre } = await req.json()

        if (!movieTitle) {
            return NextResponse.json({ error: "Movie title is required" }, { status: 400 })
        }

        const pairing = await generateSnackPairing(movieTitle, movieGenre || "General")

        return NextResponse.json(pairing)
    } catch (error) {
        console.error("Snack pairing failed:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
