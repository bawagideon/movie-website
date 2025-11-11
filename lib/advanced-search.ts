/**
 * Advanced Search and Filtering
 * Supports faceted search, filters, sorting, and recommendations
 */

// Movie interface matching TMDB API structure
export interface Movie {
  id: number
  title: string
  genre_ids: number[]
  vote_average: number
  release_date: string
  original_language: string
  popularity: number
  poster_path?: string
  overview?: string
}

export interface SearchFilters {
  genres?: number[]
  year?: { min: number; max: number }
  rating?: { min: number; max: number }
  language?: string
  sort?: 'popularity' | 'rating' | 'year'
}

export interface FacetedSearchResult {
  movies: Movie[]
  facets: {
    genres: GenreFacet[]
    years: YearFacet[]
    ratings: RatingFacet[]
    languages: LanguageFacet[]
  }
  totalCount: number
}

interface GenreFacet {
  id: number
  name: string
  count: number
}

interface YearFacet {
  year: number
  count: number
}

interface RatingFacet {
  range: string
  count: number
  min: number
  max: number
}

interface LanguageFacet {
  code: string
  name: string
  count: number
}

/**
 * Perform faceted search with filters
 */
export async function performFacetedSearch(
  movies: Movie[],
  filters: SearchFilters
): Promise<FacetedSearchResult> {
  try {
    let filtered = [...movies]

    // Apply genre filter
    if (filters.genres && filters.genres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genre_ids.some(g => filters.genres!.includes(g))
      )
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(
        movie => movie.vote_average >= filters.rating!.min && movie.vote_average <= filters.rating!.max
      )
    }

    // Apply language filter
    if (filters.language) {
      filtered = filtered.filter(movie => movie.original_language === filters.language)
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(movie => {
        const releaseYear = new Date(movie.release_date).getFullYear()
        return releaseYear >= filters.year!.min && releaseYear <= filters.year!.max
      })
    }

    // Apply sorting
    const sorted = sortMovies(filtered, filters.sort || 'popularity')

    // Build facets
    const facets = buildFacets(movies, filters)

    return {
      movies: sorted,
      facets,
      totalCount: sorted.length
    }
  } catch (error) {
    console.error('Advanced search error:', error)
    return {
      movies: [],
      facets: { genres: [], years: [], ratings: [], languages: [] },
      totalCount: 0
    }
  }
}

/**
 * Sort movies by various criteria
 */
function sortMovies(movies: Movie[], sortBy: 'popularity' | 'rating' | 'year'): Movie[] {
  const sorted = [...movies]

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.vote_average - a.vote_average)
    case 'year':
      return sorted.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    case 'popularity':
    default:
      return sorted.sort((a, b) => b.popularity - a.popularity)
  }
}

/**
 * Build facets from movies
 */
function buildFacets(movies: Movie[], appliedFilters: SearchFilters) {
  const facets: FacetedSearchResult['facets'] = {
    genres: [],
    years: [],
    ratings: [],
    languages: []
  }

  // Genre facets
  const genreMap = new Map<number, number>()
  movies.forEach(movie => {
    movie.genre_ids.forEach(genreId => {
      genreMap.set(genreId, (genreMap.get(genreId) || 0) + 1)
    })
  })
  facets.genres = Array.from(genreMap.entries())
    .map(([id, count]) => ({
      id,
      name: getGenreName(id),
      count
    }))
    .sort((a, b) => b.count - a.count)

  // Year facets
  const yearMap = new Map<number, number>()
  movies.forEach(movie => {
    const year = new Date(movie.release_date).getFullYear()
    if (year > 1980) {
      yearMap.set(year, (yearMap.get(year) || 0) + 1)
    }
  })
  facets.years = Array.from(yearMap.entries())
    .map(([year, count]) => ({
      year,
      count
    }))
    .sort((a, b) => b.year - a.year)
    .slice(0, 20)

  // Rating facets
  const ratingRanges = [
    { range: '8.0 - 10.0', min: 8.0, max: 10.0 },
    { range: '6.0 - 8.0', min: 6.0, max: 8.0 },
    { range: '4.0 - 6.0', min: 4.0, max: 6.0 },
    { range: '2.0 - 4.0', min: 2.0, max: 4.0 }
  ]

  facets.ratings = ratingRanges.map(range => ({
    ...range,
    count: movies.filter(m => m.vote_average >= range.min && m.vote_average <= range.max).length
  }))

  // Language facets
  const languageMap = new Map<string, number>()
  movies.forEach(movie => {
    languageMap.set(movie.original_language, (languageMap.get(movie.original_language) || 0) + 1)
  })
  facets.languages = Array.from(languageMap.entries())
    .map(([code, count]) => ({
      code,
      name: getLanguageName(code),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  return facets
}

/**
 * Get genre name by ID
 */
function getGenreName(id: number): string {
  const genres: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  }
  return genres[id] || 'Unknown'
}

/**
 * Get language name by code
 */
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    hi: 'Hindi',
    ar: 'Arabic',
    tr: 'Turkish',
    pl: 'Polish',
    nl: 'Dutch'
  }
  return languages[code] || code.toUpperCase()
}

/**
 * Get recommendations based on wishlist history
 */
export async function getRecommendations(wishlist: Movie[], limit: number = 12): Promise<Movie[]> {
  try {
    if (wishlist.length === 0) {
      return []
    }

    // Extract genre preferences from wishlist
    const genreFrequency = new Map<number, number>()
    const languages = new Set<string>()
    let totalRating = 0

    wishlist.forEach(movie => {
      totalRating += movie.vote_average
      movie.genre_ids.forEach(genreId => {
        genreFrequency.set(genreId, (genreFrequency.get(genreId) || 0) + 1)
      })
      languages.add(movie.original_language)
    })

    const avgRating = totalRating / wishlist.length
    const preferredGenres = Array.from(genreFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id)

    // Fetch popular movies with similar characteristics
    const response = await fetch('/api/movies/popular')
    if (!response.ok) throw new Error('Failed to fetch movies')

    const { movies } = await response.json()

    // Filter and score movies
    const scored = movies
      .filter((m: Movie) => !wishlist.find(w => w.id === m.id))
      .map((movie: Movie) => {
        let score = 0

        // Bonus for matching genres
        const matchingGenres = movie.genre_ids.filter(g => preferredGenres.includes(g)).length
        score += matchingGenres * 20

        // Bonus for similar rating
        if (Math.abs(movie.vote_average - avgRating) < 2) {
          score += 15
        }

        // Bonus for same language
        if (languages.has(movie.original_language)) {
          score += 10
        }

        return { ...movie, score }
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)

    return scored
  } catch (error) {
    console.error('Recommendation error:', error)
    return []
  }
}

/**
 * Save search to history
 */
export interface SearchHistory {
  id: string
  query: string
  filters: SearchFilters
  resultCount: number
  timestamp: Date
}

const searchHistory: SearchHistory[] = []

export function addToSearchHistory(query: string, filters: SearchFilters, resultCount: number): void {
  searchHistory.unshift({
    id: Math.random().toString(36),
    query,
    filters,
    resultCount,
    timestamp: new Date()
  })

  // Keep only last 50 searches
  if (searchHistory.length > 50) {
    searchHistory.pop()
  }
}

export function getSearchHistory(): SearchHistory[] {
  return [...searchHistory]
}

export function clearSearchHistory(): void {
  searchHistory.length = 0
}
