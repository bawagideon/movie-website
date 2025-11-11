/**
 * Caching Strategy and Cache Management
 * Implements different caching patterns for optimized performance
 */

export const CACHE_TIMES = {
  genres: 86400,           // 24 hours
  languages: 86400,        // 24 hours
  movie: 3600,             // 1 hour
  movieList: 3600,         // 1 hour
  search: 300,             // 5 minutes
  trending: 3600,          // 1 hour
  topRated: 3600,          // 1 hour
  upComing: 3600,          // 1 hour
  nowPlaying: 3600,        // 1 hour
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private pendingRequests: Map<string, Promise<any>> = new Map()

  /**
   * Get item from cache if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Get or fetch with deduplication
   * Prevents thundering herd problem
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key)
    if (cached) {
      return cached
    }

    // Check if request is already in flight
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    // Create new request
    const request = fetcher()
      .then(data => {
        this.set(key, data, ttl)
        this.pendingRequests.delete(key)
        return data
      })
      .catch(error => {
        this.pendingRequests.delete(key)
        throw error
      })

    this.pendingRequests.set(key, request)
    return request
  }

  /**
   * Invalidate specific cache entries
   */
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}

// Global cache instance
export const cacheManager = new CacheManager()

/**
 * Stale-while-revalidate pattern
 * Return cached data immediately, update in background
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
  staleTime: number = ttl * 0.8 // 80% of TTL
): Promise<T> {
  const cached = cacheManager.get<T>(key)

  if (cached) {
    // Revalidate in background if stale
    const age = Date.now() - (cached ? staleTime : 0)
    if (age > staleTime * 1000) {
      fetcher()
        .then(data => cacheManager.set(key, data, ttl))
        .catch(err => console.error('Background revalidation error:', err))
    }
    return cached
  }

  // No cache, fetch fresh
  const data = await fetcher()
  cacheManager.set(key, data, ttl)
  return data
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  genre: () => 'genres',
  language: () => 'languages',
  movie: (id: number) => `movie-${id}`,
  movieList: (type: string, page: number = 1) => `movies-${type}-${page}`,
  search: (query: string, page: number = 1) => `search-${query}-${page}`,
  trending: (timeWindow: string = 'week', page: number = 1) => `trending-${timeWindow}-${page}`,
  aiSearch: (query: string) => `ai-search-${query}`,
  wishlist: (userId: string) => `wishlist-${userId}`,
  recommendations: (userId: string) => `recommendations-${userId}`
}

/**
 * Batch requests with caching
 */
export async function batchRequests<T>(
  requests: Array<{ key: string; fetcher: () => Promise<T>; ttl: number }>
): Promise<T[]> {
  return Promise.all(
    requests.map(req =>
      cacheManager.getOrFetch(req.key, req.fetcher, req.ttl)
    )
  )
}

/**
 * Prefetch data for better perceived performance
 */
export async function prefetchData(keys: string[], ttl: number = 3600): Promise<void> {
  const now = Date.now()

  // Prefetch common queries in background
  const prefetchRequests = [
    { key: cacheKeys.genre(), fetcher: () => fetch('/api/genres').then(r => r.json()), ttl },
    { key: cacheKeys.language(), fetcher: () => fetch('/api/languages').then(r => r.json()), ttl },
    {
      key: cacheKeys.movieList('popular', 1),
      fetcher: () => fetch('/api/movies/popular').then(r => r.json()),
      ttl
    },
    {
      key: cacheKeys.movieList('trending', 1),
      fetcher: () => fetch('/api/movies/trending').then(r => r.json()),
      ttl
    }
  ]

  try {
    await batchRequests(prefetchRequests)
    const loadTime = Date.now() - now
    console.log(`Prefetch completed in ${loadTime}ms`)
  } catch (error) {
    console.error('Prefetch error:', error)
  }
}

/**
 * Adaptive caching based on connection speed
 */
export function getAdaptiveCacheTTL(baseTTL: number): number {
  if (typeof navigator === 'undefined') return baseTTL

  const connection = (navigator as any).connection
  if (!connection) return baseTTL

  const effectiveType = connection.effectiveType

  // Slower connections benefit from longer caching
  switch (effectiveType) {
    case '4g':
      return baseTTL // Standard cache time
    case '3g':
      return Math.ceil(baseTTL * 1.5) // 50% longer for 3G
    case '2g':
    case 'slow-2g':
      return Math.ceil(baseTTL * 2) // 2x longer for 2G/slow
    default:
      return baseTTL
  }
}

/**
 * Memory-efficient cache with LRU eviction
 */
export class LRUCache<T> {
  private maxSize: number
  private cache: Map<string, { data: T; accessTime: number }> = new Map()

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Update access time
    entry.accessTime = Date.now()
    return entry.data
  }

  set(key: string, data: T): void {
    // Remove if exists
    this.cache.delete(key)

    // Add new entry
    this.cache.set(key, {
      data,
      accessTime: Date.now()
    })

    // Evict least recently used if over capacity
    if (this.cache.size > this.maxSize) {
      const lru = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].accessTime - b[1].accessTime
      )[0]

      if (lru) {
        this.cache.delete(lru[0])
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

// Export LRU instance for component data
export const componentCache = new LRUCache<any>(50)
