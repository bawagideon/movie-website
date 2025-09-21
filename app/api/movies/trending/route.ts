import { type NextRequest, NextResponse } from "next/server"
import { getTrendingMovies } from "@/lib/tmdb-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeWindow = (searchParams.get("timeWindow") as "day" | "week") || "week"

    const movies = await getTrendingMovies(timeWindow)
    return NextResponse.json(movies)
  } catch (error) {
    console.error("Failed to fetch trending movies:", error)
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}
