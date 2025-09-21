"use server"

// TMDB API configuration and types (server-side only)
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

if (!TMDB_API_KEY) {
  throw new Error("NEXT_PUBLIC_TMDB_API_KEY environment variable is required")
}

// Re-export all types from the client file
export type {
  Movie,
  MovieDetails,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
  CastMember,
  CrewMember,
  Credits,
  Video,
  VideosResponse,
  TMDBResponse,
  Genre,
  MovieReview,
  MovieKeyword,
  MovieImage,
  MovieImages,
  WatchProvider,
  CountryWatchProviders,
  MovieWatchProviders,
  ReleaseDate,
  CountryReleaseDate,
  MovieReleaseDates,
  ExternalIds,
  MovieCollection,
  Language,
} from "./tmdb"

async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`

  const response = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getPopularMovies(page = 1, language = "en-US", originalLanguage?: string) {
  let endpoint = `/movie/popular?page=${page}&language=${language}`
  if (originalLanguage && originalLanguage !== "all") {
    const langCode = originalLanguage.split("-")[0]
    endpoint += `&with_original_language=${langCode}`
  }
  return fetchFromTMDB(endpoint)
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "week") {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`)
}

export async function searchMovies(query: string, page = 1, language = "en-US", originalLanguage?: string) {
  const encodedQuery = encodeURIComponent(query)
  const endpoint = `/search/movie?query=${encodedQuery}&page=${page}&language=${language}`
  return fetchFromTMDB(endpoint)
}

export async function discoverMovies(
  options: {
    genre?: number
    language?: string
    originalLanguage?: string
    minRating?: number
    sortBy?: string
    page?: number
  } = {},
) {
  const { genre, language = "en-US", originalLanguage, minRating, sortBy = "popularity.desc", page = 1 } = options

  let endpoint = `/discover/movie?page=${page}&language=${language}&sort_by=${sortBy}`

  if (originalLanguage && originalLanguage !== "all") {
    const langCode = originalLanguage.split("-")[0]
    endpoint += `&with_original_language=${langCode}`
  }

  if (genre) {
    endpoint += `&with_genres=${genre}`
  }

  if (minRating) {
    endpoint += `&vote_average.gte=${minRating}`
  }

  return fetchFromTMDB(endpoint)
}

export async function getTopRatedMovies(page = 1, language = "en-US", originalLanguage?: string) {
  let endpoint = `/movie/top_rated?page=${page}&language=${language}`
  if (originalLanguage && originalLanguage !== "all") {
    const langCode = originalLanguage.split("-")[0]
    endpoint += `&with_original_language=${langCode}`
  }
  return fetchFromTMDB(endpoint)
}

export async function getLanguages() {
  return fetchFromTMDB("/configuration/languages")
}

export async function getMovieDetails(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}`)
}

export async function getMovieCredits(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/credits`)
}

export async function getMovieVideos(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/videos`)
}

export async function getSimilarMovies(movieId: number, page = 1) {
  return fetchFromTMDB(`/movie/${movieId}/similar?page=${page}`)
}

export async function getRecommendedMovies(movieId: number, page = 1) {
  return fetchFromTMDB(`/movie/${movieId}/recommendations?page=${page}`)
}

export async function getNowPlayingMovies(page = 1) {
  return fetchFromTMDB(`/movie/now_playing?page=${page}`)
}

export async function getUpcomingMovies(page = 1) {
  return fetchFromTMDB(`/movie/upcoming?page=${page}`)
}

export async function getGenres() {
  return fetchFromTMDB("/genre/movie/list")
}

export async function getMovieReviews(movieId: number, page = 1) {
  return fetchFromTMDB(`/movie/${movieId}/reviews?page=${page}`)
}

export async function getMovieKeywords(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/keywords`)
}

export async function getMovieImages(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/images`)
}

export async function getMovieWatchProviders(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/watch/providers`)
}

export async function getMovieReleaseDates(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/release_dates`)
}

export async function getMovieExternalIds(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}/external_ids`)
}

export async function getCollection(collectionId: number) {
  return fetchFromTMDB(`/collection/${collectionId}`)
}
