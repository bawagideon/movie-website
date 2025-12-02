import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { discoverMovies, searchMovies, getPopularMovies, getTopRatedMovies } from "@/lib/tmdb-server"
import { validateAISearch } from "@/lib/validation"
import { createErrorResponse, logError } from "@/lib/errors"
import { generateRequestId } from "@/lib/utils"

function getLanguageContext(language: string): string {
  const contexts: Record<string, string> = {
    hi: `CRITICAL: User selected Hindi language. You MUST focus ONLY on Bollywood movies, Hindi cinema, and Indian films. Consider Indian cultural themes like monsoon romance, family dramas, festivals, and emotions significant in Indian cinema.`,
    ta: `CRITICAL: User selected Tamil language. You MUST focus ONLY on Kollywood movies, Tamil cinema, and South Indian films.`,
    te: `CRITICAL: User selected Telugu language. You MUST focus ONLY on Tollywood movies, Telugu cinema, and South Indian films.`,
    ml: `CRITICAL: User selected Malayalam language. You MUST focus ONLY on Malayalam cinema and South Indian films.`,
    kn: `CRITICAL: User selected Kannada language. You MUST focus ONLY on Kannada cinema and South Indian films.`,
    bn: `CRITICAL: User selected Bengali language. You MUST focus ONLY on Bengali cinema and films from Bengal.`,
    mr: `CRITICAL: User selected Marathi language. You MUST focus ONLY on Marathi cinema and films.`,
    gu: `CRITICAL: User selected Gujarati language. You MUST focus ONLY on Gujarati cinema and films.`,
    pa: `CRITICAL: User selected Punjabi language. You MUST focus ONLY on Punjabi cinema and films.`,
    ja: `CRITICAL: User selected Japanese language. You MUST focus ONLY on Japanese cinema, anime movies, and Japanese cultural themes.`,
    ko: `CRITICAL: User selected Korean language. You MUST focus ONLY on Korean cinema, K-movies, and Korean cultural themes.`,
    zh: `CRITICAL: User selected Chinese language. You MUST focus ONLY on Chinese cinema, Hong Kong movies, and Chinese cultural themes.`,
    es: `CRITICAL: User selected Spanish language. You MUST focus ONLY on Spanish and Latin American cinema.`,
    fr: `CRITICAL: User selected French language. You MUST focus ONLY on French cinema and Francophone films.`,
  }

  return (
    contexts[language.split("-")[0]] ||
    `User selected ${language} language. Prioritize movies in this language when possible.`
  )
}

function getCulturalContext(mood: string, description: string, language: string): string {
  const text = `${mood} ${description}`.toLowerCase()
  const langCode = language.split("-")[0]

  if (["hi", "ta", "te", "ml", "kn", "bn", "mr", "gu", "pa"].includes(langCode)) {
    if (text.includes("monsoon") || text.includes("rain") || text.includes("barish")) {
      return `THEMATIC FOCUS: For monsoon theme in Indian cinema, suggest movies with rain songs, romantic monsoon scenes, emotional rainy moments, or stories set during monsoon season. Focus on GENRES like Romance (10749), Drama (18), and Music (10402). DO NOT search for the word "monsoon" in titles - instead focus on thematic content.`
    }
    if (text.includes("festival") || text.includes("celebration")) {
      return `THEMATIC FOCUS: Focus on Indian movies celebrating festivals, family gatherings, and cultural celebrations. Use Family (10751) and Drama (18) genres.`
    }
    if (text.includes("family") || text.includes("emotion")) {
      return `THEMATIC FOCUS: Indian cinema excels in family dramas and emotional storytelling. Focus on Drama (18) and Family (10751) genres.`
    }
  }

  return ""
}

function getFallbackSuggestions(mood: string, description: string, language: string) {
  const text = `${mood} ${description}`.toLowerCase()
  const langCode = language.split("-")[0]

  if (["hi", "ta", "te", "ml", "kn", "bn", "mr", "gu", "pa"].includes(langCode)) {
    if (text.includes("monsoon") || text.includes("rain")) {
      return {
        searchTerms: [], // Remove keyword search terms for thematic searches
        genres: [10749, 18, 10402], // Romance, Drama, Music
        minRating: 6,
        explanation: "Indian movies capturing monsoon themes and romantic rain scenes",
        thematicSearch: true, // Flag for thematic search
      }
    }
    return {
      searchTerms: [],
      genres: [18, 35, 10751], // Drama, Comedy, Family
      minRating: 6,
      explanation: "Popular movies in your selected language",
      thematicSearch: true,
    }
  }

  return {
    searchTerms: [mood || description || "popular movies"].filter(Boolean),
    genres: [35, 18],
    minRating: 6,
    explanation: "Popular movies that might match your preferences",
    thematicSearch: false,
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    console.log(`[AI Search] Request ID: ${requestId} - Starting processing`)
    const body = await request.json()
    const { mood, description, language = "en-US" } = body

    // Validate input
    const validation = validateAISearch(body)
    if (!validation.valid) {
      console.error(`[AI Search] Validation failed: ${validation.error}`)
      return NextResponse.json(
        createErrorResponse(400, "VALIDATION_ERROR", validation.error || "Invalid AI search parameters", requestId),
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable")
      return NextResponse.json(
        createErrorResponse(500, "CONFIG_ERROR", "Server configuration error: Missing AI API key", requestId),
        { status: 500 }
      )
    }

    const languageContext = getLanguageContext(language)
    const culturalContext = getCulturalContext(mood, description, language)

    console.log(`[AI Search] Calling Gemini API...`)
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a movie recommendation expert with deep knowledge of international cinema and cultural contexts.

User's mood: ${mood || "Not specified"}
User's description: ${description || "Not specified"}
Selected language: ${language}

${languageContext}
${culturalContext}

IMPORTANT INSTRUCTIONS:
- For thematic searches (like "monsoon", "family", "romance"), focus on GENRES and THEMES, not keyword matching
- DO NOT include literal keywords in searchTerms for thematic searches
- For monsoon themes in Indian cinema, use Romance (10749), Drama (18), Music (10402) genres
- For family themes, use Family (10751), Drama (18) genres
- Only use searchTerms for specific movie references or director names

CRITICAL: You MUST respond with EXACTLY ONE valid JSON object. Do not provide multiple JSON objects or any additional text.

Return ONLY this JSON format:
{
  "searchTerms": [],
  "genres": [18, 10749],
  "yearRange": {"min": 1990, "max": 2024},
  "minRating": 6,
  "explanation": "Brief explanation here",
  "thematicSearch": true
}

Genre IDs: Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, Science Fiction=878, TV Movie=10770, Thriller=53, War=10752, Western=37

Rules:
- Return EXACTLY ONE JSON object, nothing else
- Use double quotes for all strings
- For thematic searches, leave searchTerms empty []
- Include 2-4 relevant genre IDs that match the theme
- Set minRating between 6-8 for quality results
- Keep explanation under 100 characters
- Set thematicSearch to true for mood/theme based searches

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR EXPLANATIONS.`,
    })

    console.log(`[AI Search] Gemini response received. Length: ${text.length}`)

    let aiResponse
    try {
      let cleanedText = text.trim()

      // Remove markdown code blocks
      cleanedText = cleanedText.replace(/```json\s*/, "").replace(/```\s*$/, "")

      // Find the first complete JSON object
      const firstBraceIndex = cleanedText.indexOf("{")
      if (firstBraceIndex === -1) {
        throw new Error("No JSON object found")
      }

      let braceCount = 0
      let endIndex = firstBraceIndex

      // Find the end of the first complete JSON object
      for (let i = firstBraceIndex; i < cleanedText.length; i++) {
        if (cleanedText[i] === "{") {
          braceCount++
        } else if (cleanedText[i] === "}") {
          braceCount--
          if (braceCount === 0) {
            endIndex = i
            break
          }
        }
      }

      // Extract only the first complete JSON object
      const firstJsonObject = cleanedText.substring(firstBraceIndex, endIndex + 1)

      aiResponse = JSON.parse(firstJsonObject)

      // Validate the parsed response has required fields
      if (!aiResponse.genres || !Array.isArray(aiResponse.genres)) {
        throw new Error("Invalid AI response structure")
      }
      console.log(`[AI Search] Parsed AI response successfully`)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", text)

      aiResponse = getFallbackSuggestions(mood, description, language)
      console.log(`[AI Search] Using fallback suggestions`)
    }

    const moviePromises = []

    if (
      aiResponse.thematicSearch &&
      aiResponse.genres &&
      Array.isArray(aiResponse.genres) &&
      aiResponse.genres.length > 0
    ) {
      // Use genre-based discovery as primary method for thematic searches
      for (const genreId of aiResponse.genres) {
        if (typeof genreId === "number") {
          moviePromises.push(
            discoverMovies({
              genre: genreId,
              language: "en-US", // For metadata language
              originalLanguage: language, // For filtering by original language
              minRating: aiResponse.minRating || 6,
              sortBy: "vote_average.desc",
            }),
          )
          moviePromises.push(
            discoverMovies({
              genre: genreId,
              language: "en-US",
              originalLanguage: language,
              minRating: aiResponse.minRating || 6,
              sortBy: "popularity.desc",
            }),
          )
        }
      }
    } else {
      // Use keyword search for specific movie/director searches
      for (const term of aiResponse.searchTerms || []) {
        if (term && typeof term === "string") {
          moviePromises.push(searchMovies(term, 1, "en-US", language))
        }
      }
    }

    if (language !== "en-US" && language !== "all") {
      moviePromises.push(getPopularMovies(1, "en-US", language))
      moviePromises.push(getTopRatedMovies(1, "en-US", language))
    }

    if (moviePromises.length === 0) {
      moviePromises.push(getPopularMovies(1, "en-US", language))
    }

    console.log(`[AI Search] Fetching ${moviePromises.length} movie sources from TMDB...`)
    const results = await Promise.all(moviePromises)
    console.log(`[AI Search] TMDB fetch complete`)

    const allMovies = results.flatMap((result) => result.results || [])
    const uniqueMovies = allMovies.filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id))

    let filteredMovies = uniqueMovies
    if (language !== "all" && language !== "en-US") {
      const langCode = language.split("-")[0]
      // STRICT filtering - only movies in the selected language
      filteredMovies = uniqueMovies.filter((movie) => movie.original_language === langCode)

      // If no movies found in selected language, show a message
      if (filteredMovies.length === 0) {
        console.log(`[AI Search] No movies found in language ${langCode}`)
        return NextResponse.json({
          suggestions: [],
          explanation: `No movies found in ${language.split("-")[0].toUpperCase()} language for your search. Try a different mood or description.`,
          searchParams: {
            searchTerms: aiResponse.searchTerms,
            genres: aiResponse.genres,
            yearRange: aiResponse.yearRange,
            minRating: aiResponse.minRating,
            thematicSearch: aiResponse.thematicSearch,
          },
        })
      }
    }

    // Sort by rating and popularity
    const sortedMovies = filteredMovies
      .filter((movie) => movie.vote_average >= (aiResponse.minRating || 6))
      .sort((a, b) => {
        // Sort by rating first, then popularity
        if (Math.abs(a.vote_average - b.vote_average) > 0.5) {
          return b.vote_average - a.vote_average
        }
        return b.popularity - a.popularity
      })
      .slice(0, 20)

    console.log(`[AI Search] Returning ${sortedMovies.length} movies`)

    return NextResponse.json({
      success: true,
      suggestions: sortedMovies,
      explanation: aiResponse.explanation || "Here are some movies that match your mood and preferences.",
      searchParams: {
        searchTerms: aiResponse.searchTerms,
        genres: aiResponse.genres,
        yearRange: aiResponse.yearRange,
        minRating: aiResponse.minRating,
        thematicSearch: aiResponse.thematicSearch,
      },
      requestId,
    })
  } catch (error) {
    console.error(`[AI Search] Critical error:`, error)
    logError(error, {
      requestId,
      endpoint: "/api/ai-search",
      method: "POST",
    })

    const response = createErrorResponse(
      500,
      "AI_SEARCH_FAILED",
      "Failed to process AI search request",
      requestId
    )

    return NextResponse.json(response, { status: 500 })
  }
}
