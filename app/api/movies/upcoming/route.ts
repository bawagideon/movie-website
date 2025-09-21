import { type NextRequest, NextResponse } from "next/server"
import { getUpcomingMovies } from "@/lib/tmdb-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")

    const movies = await getUpcomingMovies(page)
    return NextResponse.json(movies)
  } catch (error) {
    console.error("Failed to fetch upcoming movies:", error)
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}
