import { NextResponse, type NextRequest } from "next/server"
import { getLanguages } from "@/lib/tmdb-server"
import { createErrorResponse, logError } from "@/lib/errors"
import { generateRequestId } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const languages = await getLanguages()
    return NextResponse.json(
      {
        success: true,
        data: languages,
        requestId,
      },
      { status: 200 }
    )
  } catch (error) {
    logError(error, {
      requestId,
      endpoint: "/api/languages",
      method: "GET",
    })

    const response = createErrorResponse(
      500,
      "FETCH_LANGUAGES_ERROR",
      "Failed to fetch languages",
      requestId
    )
    
    return NextResponse.json(response, { status: 500 })
  }
}
