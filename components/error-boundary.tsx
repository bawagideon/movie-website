"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({ errorInfo })

    // In production, you might want to log this to an error tracking service
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to Sentry or similar error tracking service
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-background flex items-center justify-center px-4 py-12"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6" aria-hidden="true">
              <div className="bg-red-500/10 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold mb-3 text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Please try again or return to the home page.
            </p>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-mono text-destructive mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs">
                    <summary 
                      className="cursor-pointer text-destructive/70 focus:outline-none focus-visible:outline-2 focus-visible:outline-destructive rounded px-1"
                      role="button"
                      tabIndex={0}
                    >
                      Stack trace
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-destructive/60">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2"
                aria-label="Try to recover from the error and reload the page"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="flex-1 flex items-center justify-center gap-2"
                aria-label="Return to the home page"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
