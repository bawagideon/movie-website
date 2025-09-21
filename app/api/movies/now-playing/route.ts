import { type NextRequest, NextResponse } from "next/server"
import { getNowPlayingMovies } from "@/lib/tmdb-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")

    const movies = await getNowPlayingMovies(page)
    return NextResponse.json(movies)
  } catch (error) {
    console.error("Failed to fetch now playing movies:", error)
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}
