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

import type {
  Movie,
  MovieDetails,
  Credits,
  VideosResponse,
  TMDBResponse,
  Language,
  MovieReview,
  MovieKeyword,
  MovieImages,
  MovieWatchProviders,
  MovieReleaseDates,
  ExternalIds,
  MovieCollection,
  Genre,
} from "./tmdb"
import {
  validateMovieDetails,
  validateCredits,
  validateVideos,
  validateMovieList,
  validateMovieImages,
  validateMovieKeywords,
  validateMovieReviews,
  validateMovieWatchProviders,
  validateMovieReleaseDates,
  validateExternalIds,
  MovieSchema,
} from "./tmdb-validators"

async function fetchFromTMDB<T>(endpoint: string, validator?: (data: unknown) => any): Promise<T> {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`

  const response = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  const json = await response.json()

  if (validator) {
    return validator(json) as T
  }

  return json as T
}

export async function getPopularMovies(page = 1, language = "en-US", originalLanguage?: string) {
  let endpoint = `/movie/popular?page=${page}&language=${language}`
  if (originalLanguage && originalLanguage !== "all") {
    const langCode = originalLanguage.split("-")[0]
    endpoint += `&with_original_language=${langCode}`
  }
  return fetchFromTMDB<TMDBResponse<Movie>>(endpoint, validateMovieList(MovieSchema))
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "week") {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`, validateMovieList(MovieSchema))
}

export async function searchMovies(query: string, page = 1, language = "en-US", originalLanguage?: string) {
  const encodedQuery = encodeURIComponent(query)
  const endpoint = `/search/movie?query=${encodedQuery}&page=${page}&language=${language}`
  return fetchFromTMDB<TMDBResponse<Movie>>(endpoint, validateMovieList(MovieSchema))
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
  return fetchFromTMDB<TMDBResponse<Movie>>(endpoint, validateMovieList(MovieSchema))
}

export async function getLanguages() {
  return fetchFromTMDB<Language[]>("/configuration/languages")
}

export async function getMovieDetails(movieId: number) {
  return fetchFromTMDB<MovieDetails>(`/movie/${movieId}`, validateMovieDetails)
}

export async function getMovieCredits(movieId: number) {
  return fetchFromTMDB<Credits>(`/movie/${movieId}/credits`, validateCredits)
}

export async function getMovieVideos(movieId: number) {
  return fetchFromTMDB<VideosResponse>(`/movie/${movieId}/videos`, validateVideos)
}

export async function getSimilarMovies(movieId: number, page = 1) {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/${movieId}/similar?page=${page}`, validateMovieList(MovieSchema))
}

export async function getRecommendedMovies(movieId: number, page = 1) {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/${movieId}/recommendations?page=${page}`, validateMovieList(MovieSchema))
}

export async function getNowPlayingMovies(page = 1) {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/now_playing?page=${page}`, validateMovieList(MovieSchema))
}

export async function getUpcomingMovies(page = 1) {
  return fetchFromTMDB<TMDBResponse<Movie>>(`/movie/upcoming?page=${page}`, validateMovieList(MovieSchema))
}

export async function getGenres() {
  return fetchFromTMDB<{ genres: Genre[] }>("/genre/movie/list")
}

export async function getMovieReviews(movieId: number, page = 1) {
  return fetchFromTMDB<{ results: MovieReview[] }>(`/movie/${movieId}/reviews?page=${page}`, validateMovieReviews)
}

export async function getMovieKeywords(movieId: number) {
  return fetchFromTMDB<{ keywords: MovieKeyword[] }>(`/movie/${movieId}/keywords`, validateMovieKeywords)
}

export async function getMovieImages(movieId: number) {
  return fetchFromTMDB<MovieImages>(`/movie/${movieId}/images`, validateMovieImages)
}

export async function getMovieWatchProviders(movieId: number) {
  return fetchFromTMDB<MovieWatchProviders>(`/movie/${movieId}/watch/providers`, validateMovieWatchProviders)
}

export async function getMovieReleaseDates(movieId: number) {
  return fetchFromTMDB<MovieReleaseDates>(`/movie/${movieId}/release_dates`, validateMovieReleaseDates)
}

export async function getMovieExternalIds(movieId: number) {
  return fetchFromTMDB<ExternalIds>(`/movie/${movieId}/external_ids`, validateExternalIds)
}

export async function getCollection(collectionId: number) {
  return fetchFromTMDB<MovieCollection>(`/collection/${collectionId}`)
}
