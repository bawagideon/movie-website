import { NextResponse, type NextRequest } from "next/server"
import { getGenres } from "@/lib/tmdb-server"
import { createErrorResponse, logError } from "@/lib/errors"
import { generateRequestId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const genres = await getGenres()
    
    return NextResponse.json(
      {
        success: true,
        data: genres,
        requestId,
      },
      { status: 200 }
    )
  } catch (error) {
    logError(error, {
      requestId,
      endpoint: "/api/genres",
      method: "GET",
    })

    const response = createErrorResponse(
      500,
      "FETCH_GENRES_ERROR",
      "Failed to fetch genres",
      requestId
    )

    return NextResponse.json(response, { status: 500 })
  }
}
