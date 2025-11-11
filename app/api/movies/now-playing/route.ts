import { type NextRequest, NextResponse } from "next/server"
import { getNowPlayingMovies } from "@/lib/tmdb-server"
import { validatePagination } from "@/lib/validation"
import { createErrorResponse, logError } from "@/lib/errors"
import { generateRequestId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")

    // Validate pagination parameters
    const validation = validatePagination(page, 1)
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(400, "INVALID_PAGINATION", validation.error || "Invalid pagination parameters", requestId),
        { status: 400 }
      )
    }

    const movies = await getNowPlayingMovies(page)
    return NextResponse.json(
      {
        success: true,
        data: movies,
        requestId,
      },
      { status: 200 }
    )
  } catch (error) {
    logError(error, {
      requestId,
      endpoint: "/api/movies/now-playing",
      method: "GET",
    })

    const response = createErrorResponse(
      500,
      "FETCH_NOW_PLAYING_MOVIES_ERROR",
      "Failed to fetch now playing movies",
      requestId
    )

    return NextResponse.json(response, { status: 500 })
  }
}
