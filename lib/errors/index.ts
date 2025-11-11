/**
 * Error Handling Utilities for MovieVault
 * Centralized error creation, handling, and formatting
 */

import type { ApiErrorResponse, AppErrorType } from "@/lib/types"

/**
 * Custom AppError class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorType: AppErrorType | string,
    public userMessage: string,
    public requestId?: string,
  ) {
    super(userMessage)
    this.name = "AppError"
  }

  toJSON(): ApiErrorResponse {
    return {
      success: false,
      error: this.errorType,
      message: this.userMessage,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
    }
  }
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  statusCode: number,
  errorType: string,
  message: string,
  requestId?: string,
): ApiErrorResponse {
  return {
    success: false,
    error: errorType,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId,
  }
}

/**
 * Handle and format API errors
 */
export function formatApiError(error: unknown, requestId?: string): ApiErrorResponse {
  if (error instanceof AppError) {
    return error.toJSON()
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("rate limit") || error.message.includes("429")) {
      return createErrorResponse(429, "RATE_LIMITED", "Too many requests. Please try again later.", requestId)
    }

    if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
      return createErrorResponse(
        504,
        "TIMEOUT_ERROR",
        "Request timed out. Please try again.",
        requestId,
      )
    }

    if (error.message.includes("ECONNREFUSED") || error.message.includes("network")) {
      return createErrorResponse(503, "NETWORK_ERROR", "Service temporarily unavailable. Please try again later.", requestId)
    }

    return createErrorResponse(500, "SERVER_ERROR", "An unexpected error occurred.", requestId)
  }

  return createErrorResponse(500, "UNKNOWN_ERROR", "An unknown error occurred.", requestId)
}

/**
 * Handle authentication errors
 */
export function formatAuthError(error: unknown): { type: string; message: string } {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes("invalid login credentials")) {
      return { type: "INVALID_CREDENTIALS", message: "Invalid email or password." }
    }

    if (message.includes("user already registered")) {
      return { type: "EMAIL_TAKEN", message: "This email is already registered." }
    }

    if (message.includes("password")) {
      return { type: "WEAK_PASSWORD", message: "Password is too weak. Use at least 8 characters." }
    }

    if (message.includes("network")) {
      return { type: "NETWORK_ERROR", message: "Network error. Please check your connection." }
    }
  }

  return { type: "UNKNOWN_ERROR", message: "An unexpected error occurred." }
}

/**
 * Validate required environment variables
 */
export function validateEnvVariables(requiredVars: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const varName of requiredVars) {
    // @ts-ignore - process is available in Node.js
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context: {
    endpoint?: string
    method?: string
    userId?: string
    requestId?: string
    userAgent?: string
  } = {},
): void {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)

  const logEntry = {
    timestamp,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    context,
  }

  // In production, send to error tracking service (Sentry, etc)
  // @ts-ignore - process is available in Node.js
  const isProduction = process.env.NODE_ENV === "production"
  if (isProduction) {
    // TODO: Send to Sentry or similar
    console.error("[ERROR LOG]", JSON.stringify(logEntry))
  } else {
    console.error("[ERROR]", logEntry)
  }
}

/**
 * Handle API request errors with proper logging
 */
export async function handleApiError(
  error: unknown,
  context: {
    endpoint: string
    method: string
    userId?: string
    requestId?: string
  },
) {
  logError(error, context)
  return formatApiError(error, context.requestId)
}
