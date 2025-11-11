import { type NextRequest, NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb-server"
import { validateMovieSearch } from "@/lib/validation"
import { createErrorResponse, logError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const page = searchParams.get("page") || "1"
    const language = searchParams.get("language") || "en-US"
    const originalLanguage = searchParams.get("originalLanguage") || undefined

    // Validate input
    const validation = validateMovieSearch(query, page)
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(400, "VALIDATION_ERROR", validation.error!, requestId),
        { status: 400 }
      )
    }

    const movies = await searchMovies(validation.data!.query, validation.data!.page, language, originalLanguage)
    return NextResponse.json({ success: true, data: movies }, { status: 200 })
  } catch (error) {
    logError(error, {
      endpoint: "/api/movies/search",
      method: "GET",
      requestId,
    })

    if (error instanceof Error && error.message.includes("rate")) {
      return NextResponse.json(
        createErrorResponse(429, "RATE_LIMITED", "Too many requests to TMDB API. Please try again later.", requestId),
        { status: 429 }
      )
    }

    return NextResponse.json(
      createErrorResponse(500, "SEARCH_FAILED", "Failed to search movies. Please try again.", requestId),
      { status: 500 }
    )
  }
}
