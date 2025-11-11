# 🔄 Before & After Code Examples

This document shows common patterns you'll implement during Phase 1.

---

## Pattern 1: API Route Error Handling

### ❌ BEFORE (Current)

```typescript
// app/api/genres/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getGenres } from "@/lib/tmdb-server"

export async function GET() {
  try {
    const genres = await getGenres()
    return NextResponse.json(genres)
  } catch (error) {
    console.error("Failed to fetch genres:", error)
    return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })
    // ❌ Generic error message
    // ❌ No request ID for tracking
    // ❌ No validation
    // ❌ Inconsistent response format
  }
}
```

### ✅ AFTER (Improved)

```typescript
// app/api/genres/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getGenres } from "@/lib/tmdb-server"
import { createErrorResponse, logError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const genres = await getGenres()
    
    // ✅ Standardized success response
    return NextResponse.json(
      { success: true, data: genres },
      { status: 200 }
    )
  } catch (error) {
    // ✅ Proper error logging
    logError(error, {
      endpoint: "/api/genres",
      method: "GET",
      requestId,
    })

    // ✅ Standardized error response with request ID
    return NextResponse.json(
      createErrorResponse(500, "GENRES_FETCH_FAILED", 
        "Failed to fetch genres. Please try again.", requestId),
      { status: 500 }
    )
  }
}
```

---

## Pattern 2: Type Safety - AuthUser

### ❌ BEFORE (Current)

```typescript
// components/movie-details-page.tsx
interface MovieDetailsPageProps {
  movie: MovieDetails
  credits: Credits
  videos: Video[]
  user: any  // ❌ 'any' type loses all type safety
}

export default function MovieDetailsPage({
  movie,
  credits,
  videos,
  user,  // ❌ No IDE autocomplete
}: MovieDetailsPageProps) {
  // user.email might not exist
  // user.id might not exist
  // ❌ Runtime errors possible
  
  return (
    <div>
      {user?.email && <p>Welcome {user.email}</p>}
    </div>
  )
}
```

### ✅ AFTER (Improved)

```typescript
// components/movie-details-page.tsx
import type { AuthUser } from "@/lib/types"
import { MovieDetails, Credits, Video } from "@/lib/tmdb"

interface MovieDetailsPageProps {
  movie: MovieDetails
  credits: Credits
  videos: Video[]
  user: AuthUser | null  // ✅ Proper type with null check
}

export default function MovieDetailsPage({
  movie,
  credits,
  videos,
  user,  // ✅ Full IDE autocomplete
}: MovieDetailsPageProps) {
  // TypeScript knows user properties
  // ✅ Safe property access
  // ✅ No runtime errors
  
  return (
    <div>
      {user && <p>Welcome {user.email}</p>}
    </div>
  )
}
```

---

## Pattern 3: Input Validation

### ❌ BEFORE (Current)

```typescript
// app/api/movies/search/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    
    // ❌ No validation
    // query could be:
    // - null
    // - empty string ""
    // - 50000 characters long
    // - contain SQL injection: "'; DROP TABLE movies; --"
    
    if (!query) {  // ❌ Weak check
      return NextResponse.json({ error: "Query required" }, { status: 400 })
    }

    const movies = await searchMovies(query)  // ❌ Unvalidated input to function
    return NextResponse.json(movies)
  } catch (error) {
    // ...
  }
}
```

### ✅ AFTER (Improved)

```typescript
// app/api/movies/search/route.ts
import { validateMovieSearch } from "@/lib/validation"
import { createErrorResponse } from "@/lib/errors"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const page = searchParams.get("page") || "1"
    
    // ✅ Validate input
    const validation = validateMovieSearch(query, page)
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(400, "VALIDATION_ERROR", 
          validation.error!, requestId),
        { status: 400 }
      )
    }

    // ✅ Use validated data
    const movies = await searchMovies(
      validation.data!.query,
      validation.data!.page
    )
    
    return NextResponse.json(
      { success: true, data: movies },
      { status: 200 }
    )
  } catch (error) {
    // ... error handling
  }
}
```

---

## Pattern 4: Loading States

### ❌ BEFORE (Current)

```tsx
// components/movie-grid.tsx
export default function MovieGrid({ movies, loading }: Props) {
  // ❌ No loading skeleton - looks broken
  // Users don't know if page is loading or data missing
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        // Movies appear suddenly with no transition
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
```

### ✅ AFTER (Improved)

```tsx
// components/movie-grid.tsx
import { MovieGridSkeleton } from "@/components/loading-skeletons"

export default function MovieGrid({ movies, loading }: Props) {
  // ✅ Show skeleton while loading
  if (loading) {
    return <MovieGridSkeleton count={12} />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
```

---

## Pattern 5: Error Boundary

### ❌ BEFORE (Current)

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {/* ❌ Any error in children crashes entire app */}
        {children}
      </body>
    </html>
  )
}
```

### ✅ AFTER (Improved)

```tsx
// app/layout.tsx
import { ErrorBoundary } from "@/components/error-boundary"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {/* ✅ Errors caught and displayed gracefully */}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

## Pattern 6: Auth Form Error Handling

### ❌ BEFORE (Current)

```tsx
// components/login-form.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError("")

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // ❌ Raw error message
      setError(error.message)  
      // Shows: "Invalid login credentials"
      // Could show: "Email or password is incorrect"
    } else {
      router.push("/")
    }
  } catch (err) {
    setError("An unexpected error occurred")  // ❌ Generic
  } finally {
    setLoading(false)
  }
}
```

### ✅ AFTER (Improved)

```tsx
// components/login-form.tsx
import { formatAuthError } from "@/lib/errors"

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError("")

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // ✅ Formatted error message
      const { message } = formatAuthError(authError)
      setError(message)  // Shows helpful message
    } else {
      router.push("/")
    }
  } catch (err) {
    // ✅ Formatted error message
    const { message } = formatAuthError(err)
    setError(message)
  } finally {
    setLoading(false)
  }
}
```

---

## Pattern 7: Environment Validation

### ❌ BEFORE (Current)

```typescript
// lib/tmdb-server.ts
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

if (!TMDB_API_KEY) {
  // ❌ Error occurs when function is first called
  // ❌ Might work in development, fail in production
  // ❌ Hard to debug
  throw new Error("NEXT_PUBLIC_TMDB_API_KEY environment variable is required")
}
```

### ✅ AFTER (Improved)

```typescript
// lib/config/validate-env.ts
import { validateEnvVariables } from "@/lib/errors"

export function validateEnvironment() {
  const requiredVars = [
    "NEXT_PUBLIC_TMDB_API_KEY",
    "GROQ_API_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]

  const { valid, missing } = validateEnvVariables(requiredVars)

  if (!valid) {
    // ✅ Error shown immediately on startup
    // ✅ All missing vars listed
    // ✅ Easy to fix
    console.error("Missing environment variables:", missing.join(", "))
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  console.log("✅ Environment validated")
}

// app/layout.tsx
import { validateEnvironment } from "@/lib/config/validate-env"

// ✅ Runs once on app startup
validateEnvironment()
```

---

## Pattern 8: Standardized Error Response

### ❌ BEFORE (Current)

```typescript
// Different error formats across routes

// Route 1: api/genres/route.ts
return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })

// Route 2: api/movies/search/route.ts
return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })

// Route 3: api/ai-search/route.ts
return NextResponse.json({ error: "Failed to process AI search" }, { status: 500 })

// ❌ Frontend doesn't know what to expect
// ❌ Error handling inconsistent
// ❌ Difficult to add features like error tracking
```

### ✅ AFTER (Improved)

```typescript
// All routes use same format
const errorResponse = createErrorResponse(
  400,  // HTTP status code
  "VALIDATION_ERROR",  // Error type for classification
  "Query must be between 1 and 200 characters",  // User message
  requestId  // Tracking ID
)

// Response structure:
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Query must be between 1 and 200 characters",
  "statusCode": 400,
  "timestamp": "2025-11-11T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}

// ✅ Frontend knows exact format
// ✅ Easy to log errors with request ID
// ✅ Error tracking services can use error type
// ✅ Errors can be displayed to user
```

---

## Summary of Changes

| Aspect | Before | After | Benefit |
|--------|--------|-------|---------|
| **Type Safety** | `any` used | `AuthUser` type | IDE support, no runtime errors |
| **Errors** | Generic message | Descriptive message | Better UX, easier debugging |
| **Validation** | No validation | Full validation | Security, data integrity |
| **Loading** | None | Skeleton screens | Better perceived performance |
| **Crashes** | App crashes | Error boundary | Graceful degradation |
| **Logging** | console.error | logError with context | Production debugging |
| **Response Format** | Inconsistent | Standardized | Predictable frontend code |

---

## Implementation Tips

1. **Start with types** - Fix `any` types first as foundation
2. **Then validation** - Add to inputs before processing
3. **Then error handling** - Wrap with try/catch using utilities
4. **Then UX** - Add skeletons and boundaries
5. **Test each change** - Verify before moving to next

---

This file serves as your reference while implementing Phase 1 improvements!

