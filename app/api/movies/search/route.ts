import { type NextRequest, NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const language = searchParams.get("language") || "en-US"
    const originalLanguage = searchParams.get("originalLanguage") || undefined

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const movies = await searchMovies(query, page, language, originalLanguage)
    return NextResponse.json(movies)
  } catch (error) {
    console.error("Failed to search movies:", error)
    return NextResponse.json({ error: "Failed to search movies" }, { status: 500 })
  }
}
