/**
 * Comprehensive Analytics Tracking
 * Tracks user interactions, errors, and performance metrics
 */

// Placeholder for Mixpanel/Segment integration
// Replace with actual analytics service
const ANALYTICS_ENABLED = true // Set to false to disable analytics

export interface AnalyticsEvent {
  name: string
  properties: Record<string, string | number | boolean>
  timestamp: number
}

/**
 * Track page view
 */
export const trackPageView = (path: string): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'page_view',
    properties: {
      path,
      timestamp: Date.now(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Track movie interaction
 */
export const trackMovieClick = (movieId: number, title: string): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'movie_clicked',
    properties: {
      movie_id: movieId,
      title,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Track wishlist action
 */
export const trackWishlistToggle = (movieId: number, added: boolean): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'wishlist_toggled',
    properties: {
      movie_id: movieId,
      action: added ? 'added' : 'removed',
      timestamp: Date.now()
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Track search query
 */
export const trackSearch = (query: string, resultCount: number): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'search_performed',
    properties: {
      query,
      result_count: resultCount,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Track AI search
 */
export const trackAISearch = (mood: string, resultCount: number): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'ai_search_performed',
    properties: {
      mood,
      result_count: resultCount,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Track authentication events
 */
export const trackAuth = (action: 'signup' | 'login' | 'logout'): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'auth_action',
    properties: {
      action,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Track errors
 */
export const trackError = (errorCode: string, message: string, context?: string): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'error_occurred',
    properties: {
      error_code: errorCode,
      message,
      context: context || 'unknown',
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ''
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Track performance metrics
 */
export const trackPerformance = (metric: string, duration: number): void => {
  if (!ANALYTICS_ENABLED) return

  const event: AnalyticsEvent = {
    name: 'performance_metric',
    properties: {
      metric,
      duration,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  }

  sendAnalytics(event)
}

/**
 * Send analytics event
 */
const sendAnalytics = async (event: AnalyticsEvent): Promise<void> => {
  try {
    // Send to analytics endpoint
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

/**
 * Measure and track performance of async operations
 */
export const withPerformanceTracking = async <T>(
  metricName: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    trackPerformance(metricName, duration)
    return result
  } catch (error) {
    const duration = performance.now() - start
    trackPerformance(`${metricName}_error`, duration)
    throw error
  }
}

/**
 * Performance observer for web vitals
 */
export const initPerformanceObserver = (): void => {
  if (typeof window === 'undefined') return

  // Observe Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if ('renderTime' in entry) {
            trackPerformance('LCP', (entry as any).renderTime)
          }
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.error('LCP observer error:', e)
    }

    // Observe First Input Delay
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const delay = (entry as any).processingDuration
          trackPerformance('FID', delay)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.error('FID observer error:', e)
    }

    // Observe Cumulative Layout Shift
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            trackPerformance('CLS', (entry as any).value * 100)
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.error('CLS observer error:', e)
    }
  }
}
