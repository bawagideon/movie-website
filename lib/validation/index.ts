/**
 * Input Validation Functions for MovieVault
 * Runtime validation for API inputs
 */

/**
 * AI Search validation
 */
export interface AISearchInput {
  mood?: string
  description?: string
  language?: string
}

export function validateAISearch(data: unknown, description?: any): { valid: boolean; data?: AISearchInput; error?: string } {
  if (typeof data !== "object" || !data) {
    return { valid: false, error: "Request body must be an object" }
  }

  const input = data as Record<string, unknown>

  // Check that at least mood or description is provided
  if (!input.mood && !input.description) {
    return { valid: false, error: "Either mood or description must be provided" }
  }

  // Validate mood length
  if (input.mood && typeof input.mood === "string" && input.mood.length > 100) {
    return { valid: false, error: "Mood must be less than 100 characters" }
  }

  // Validate description length
  if (input.description && typeof input.description === "string" && input.description.length > 500) {
    return { valid: false, error: "Description must be less than 500 characters" }
  }

  // Validate language
  if (input.language && typeof input.language !== "string") {
    return { valid: false, error: "Language must be a string" }
  }

  return {
    valid: true,
    data: {
      mood: typeof input.mood === "string" ? input.mood : undefined,
      description: typeof input.description === "string" ? input.description : undefined,
      language: typeof input.language === "string" ? input.language : "en-US",
    },
  }
}

/**
 * Movie search validation
 */
export interface MovieSearchInput {
  query: string
  page?: number
  language?: string
  originalLanguage?: string
}

export function validateMovieSearch(query: unknown, page: unknown = 1): { valid: boolean; data?: MovieSearchInput; error?: string } {
  // Validate query
  if (typeof query !== "string") {
    return { valid: false, error: "Query must be a string" }
  }

  if (query.length < 1 || query.length > 200) {
    return { valid: false, error: "Query must be between 1 and 200 characters" }
  }

  // Validate page
  const pageNum = typeof page === "string" ? parseInt(page, 10) : page
  if (typeof pageNum !== "number" || pageNum < 1) {
    return { valid: false, error: "Page must be a positive number" }
  }

  return { valid: true, data: { query: query.trim(), page: pageNum, language: "en-US" } }
}

/**
 * Email validation
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password validation
 */
export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== "string") {
    return { valid: false, error: "Password must be a string" }
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" }
  }

  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, error: "Password must contain letters" }
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: "Password must contain numbers" }
  }

  return { valid: true }
}

/**
 * Pagination validation
 */
export interface PaginationInput {
  page: number
  limit: number
}

export function validatePagination(
  page: unknown = 1,
  limit: unknown = 20,
): { valid: boolean; data?: PaginationInput; error?: string } {
  const pageNum = typeof page === "string" ? parseInt(page, 10) : page
  const limitNum = typeof limit === "string" ? parseInt(limit, 10) : limit

  if (typeof pageNum !== "number" || pageNum < 1) {
    return { valid: false, error: "Page must be a positive number" }
  }

  if (typeof limitNum !== "number" || limitNum < 1 || limitNum > 100) {
    return { valid: false, error: "Limit must be between 1 and 100" }
  }

  return { valid: true, data: { page: pageNum, limit: limitNum } }
}

/**
 * Movie ID validation
 */
export function validateMovieId(id: unknown): { valid: boolean; id?: number; error?: string } {
  const movieId = typeof id === "string" ? parseInt(id, 10) : id

  if (typeof movieId !== "number" || !Number.isInteger(movieId) || movieId < 1) {
    return { valid: false, error: "Invalid movie ID" }
  }

  return { valid: true, id: movieId }
}

/**
 * Genre ID validation
 */
export function validateGenreId(id: unknown): { valid: boolean; id?: number; error?: string } {
  const genreId = typeof id === "number" ? id : typeof id === "string" ? parseInt(id, 10) : null

  if (typeof genreId !== "number" || !Number.isInteger(genreId) || genreId < 1) {
    return { valid: false, error: "Invalid genre ID" }
  }

  return { valid: true, id: genreId }
}

/**
 * Sanitize string input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 500) // Max length
    .replace(/[<>]/g, "") // Remove potential HTML tags
}
