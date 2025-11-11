/**
 * Type Definitions for MovieVault
 * Centralized type exports to ensure consistency and type safety
 */

/**
 * Authenticated user interface
 * User session from Supabase Auth
 */
export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
  created_at?: string
}

/**
 * API Response wrapper for consistency
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  statusCode: number
  timestamp: string
  requestId?: string
}

/**
 * Standard pagination response
 */
export interface PaginatedResponse<T> {
  results: T[]
  page: number
  total_pages: number
  total_results: number
}

/**
 * Movie operation result
 */
export interface OperationResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * AI Search result with metadata
 */
export interface AISearchResponse {
  suggestions: any[]
  explanation: string
  searchParams: {
    genres: number[]
    yearRange: { min: number; max: number }
    minRating: number
    thematicSearch: boolean
  }
}

/**
 * Auth error types
 */
export enum AuthErrorType {
  InvalidCredentials = "INVALID_CREDENTIALS",
  UserNotFound = "USER_NOT_FOUND",
  EmailTaken = "EMAIL_TAKEN",
  WeakPassword = "WEAK_PASSWORD",
  NetworkError = "NETWORK_ERROR",
  UnknownError = "UNKNOWN_ERROR",
}

/**
 * Application error types
 */
export enum AppErrorType {
  ValidationError = "VALIDATION_ERROR",
  NotFound = "NOT_FOUND",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  RateLimited = "RATE_LIMITED",
  ServerError = "SERVER_ERROR",
  TimeoutError = "TIMEOUT_ERROR",
  NetworkError = "NETWORK_ERROR",
}

/**
 * Request status for async operations
 */
export type RequestStatus = "idle" | "loading" | "success" | "error"

/**
 * Component loading state
 */
export interface LoadingState {
  isLoading: boolean
  error: string | null
  message?: string
}
