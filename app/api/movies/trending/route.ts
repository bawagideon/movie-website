import { type NextRequest, NextResponse } from "next/server"
import { getTrendingMovies } from "@/lib/tmdb-server"
import { createErrorResponse, logError } from "@/lib/errors"
import { generateRequestId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const { searchParams } = new URL(request.url)
    const timeWindow = (searchParams.get("timeWindow") as "day" | "week") || "week"

    // Validate timeWindow parameter
    if (!["day", "week"].includes(timeWindow)) {
      return NextResponse.json(
        createErrorResponse(
          400,
          "INVALID_TIME_WINDOW",
          "timeWindow must be either 'day' or 'week'",
          requestId
        ),
        { status: 400 }
      )
    }

    const movies = await getTrendingMovies(timeWindow)
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
      endpoint: "/api/movies/trending",
      method: "GET",
    })

    const response = createErrorResponse(
      500,
      "FETCH_TRENDING_MOVIES_ERROR",
      "Failed to fetch trending movies",
      requestId
    )

    return NextResponse.json(response, { status: 500 })
  }
}
