import { type NextRequest, NextResponse } from "next/server"
import { getPopularMovies } from "@/lib/tmdb-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const language = searchParams.get("language") || "en-US"
    const originalLanguage = searchParams.get("originalLanguage") || undefined

    const movies = await getPopularMovies(page, language, originalLanguage)
    return NextResponse.json(movies)
  } catch (error) {
    console.error("Failed to fetch popular movies:", error)
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}
