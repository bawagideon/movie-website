# 🚀 Phase 1 Implementation Guide - Error Handling & Validation

**Target**: Complete by end of week 1  
**Priority**: Critical for production readiness

---

## Overview

This guide provides step-by-step implementation of error handling, input validation, and type safety improvements for MovieVault.

---

## Part 1: Update All API Routes with Error Handling

### Pattern to Follow

All API routes should follow this standard error handling pattern:

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { createErrorResponse, logError } from "@/lib/errors"
import { validateInput } from "@/lib/validation"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // 1. Parse request
    const { searchParams } = new URL(request.url)
    const param = searchParams.get("param")

    // 2. Validate input
    const validation = validateInput(param)
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(400, "VALIDATION_ERROR", validation.error!, requestId),
        { status: 400 }
      )
    }

    // 3. Execute logic
    const result = await someLogic(validation.data!)

    // 4. Return success
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    // 5. Log error
    logError(error, {
      endpoint: "/api/endpoint",
      method: "GET",
      requestId,
    })

    // 6. Return error response
    return NextResponse.json(
      createErrorResponse(500, "ERROR_TYPE", "User-friendly message", requestId),
      { status: 500 }
    )
  }
}
```

### Files to Update

1. **`app/api/movies/popular/route.ts`**
2. **`app/api/movies/top-rated/route.ts`**
3. **`app/api/movies/now-playing/route.ts`**
4. **`app/api/movies/upcoming/route.ts`**
5. **`app/api/movies/trending/route.ts`**
6. **`app/api/genres/route.ts`**
7. **`app/api/languages/route.ts`**
8. **`app/api/ai-search/route.ts`** (Most critical)

---

## Part 2: Update Components to Use AuthUser Type

### Current Issue
```tsx
// ❌ WRONG - Using 'any' type
interface MovieDetailsPageProps {
  user: any
}
```

### Fixed Version
```tsx
// ✅ CORRECT - Using proper type
import type { AuthUser } from "@/lib/types"

interface MovieDetailsPageProps {
  user: AuthUser | null
}
```

### Files to Update

1. **`app/movie/[id]/page.tsx`**
   - Replace `user: any` with `user: AuthUser | null`

2. **`components/movie-details-page.tsx`**
   - Replace `user: any` with `user: AuthUser | null`

3. **`components/home-page.tsx`**
   - Replace `user: any` with `user: AuthUser | null`

4. **`components/wishlist-page.tsx`**
   - Replace `user: any` with `user: AuthUser | null`

5. **`components/auth-button.tsx`**
   - Replace `user: any` with `user: AuthUser | null`

6. **`components/movie-grid.tsx`**
   - Replace `user: any` with `user: AuthUser | null`

7. **`components/wishlist-button.tsx`**
   - Replace `user: any` with `user: AuthUser | null`

---

## Part 3: Add Environment Validation on Startup

### Create `lib/config/validate-env.ts`

```typescript
import { validateEnvVariables } from "@/lib/errors"

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_TMDB_API_KEY",
  "GROQ_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]

export function validateEnvironment() {
  const { valid, missing } = validateEnvVariables(REQUIRED_ENV_VARS)

  if (!valid) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", ")
    )
    throw new Error(`Missing environment variables: ${missing.join(", ")}`)
  }

  console.log("✅ Environment variables validated")
}
```

### Update `app/layout.tsx`

Add validation call on app startup:

```tsx
import { validateEnvironment } from "@/lib/config/validate-env"

// Call at module level (runs once on startup)
validateEnvironment()

export default function RootLayout() {
  // ...
}
```

---

## Part 4: Add Error Boundary to Layout

### Update `app/layout.tsx`

```tsx
import { ErrorBoundary } from "@/components/error-boundary"
import { ClientLayout } from "@/app/ClientLayout"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

## Part 5: Add Loading States to Components

### Example: Movie Grid Component

Before:
```tsx
export default function MovieGrid({ movies, loading }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map(movie => (...))}
    </div>
  )
}
```

After:
```tsx
import { MovieGridSkeleton } from "@/components/loading-skeletons"

export default function MovieGrid({ movies, loading }: Props) {
  if (loading) {
    return <MovieGridSkeleton />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map(movie => (...))}
    </div>
  )
}
```

### Files to Add Loading States

1. **`components/home-page.tsx`**
   - Add skeleton before movies load

2. **`components/movie-details-page.tsx`**
   - Add skeleton for hero section
   - Add skeleton for cast section
   - Add skeleton for gallery

3. **`components/wishlist-page.tsx`**
   - Add skeleton while loading wishlist

4. **`components/ai-search.tsx`**
   - Add skeleton for search results

---

## Part 6: Improve Auth Form Error Handling

### Update `components/login-form.tsx`

```tsx
import { formatAuthError } from "@/lib/errors"

export default function LoginForm() {
  const [error, setError] = useState("")

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
        const { message } = formatAuthError(authError)
        setError(message)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      const { message } = formatAuthError(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // ... rest of component
}
```

### Update `components/signup-form.tsx`

Apply same pattern as login form

---

## Part 7: Create .env.example

### Create `.env.example` file

```env
# TMDB API Configuration
# Get your API key from: https://www.themoviedb.org/settings/api
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here

# Groq API Configuration
# Get your API key from: https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
# Get from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Analytics
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Optional: Auth Redirect
# NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

---

## Part 8: Add Request ID Tracking

Create a utility for generating request IDs:

```typescript
// lib/utils/request-id.ts
export function generateRequestId(): string {
  return crypto.randomUUID()
}
```

Use in all API routes and error logging.

---

## Testing Checklist

After implementing these changes, test:

- [ ] API routes return proper error responses
- [ ] Error messages are user-friendly
- [ ] Console shows no type errors for `user` prop
- [ ] Environment variables validated on startup
- [ ] Error boundary catches component errors
- [ ] Loading skeletons appear while data loads
- [ ] Auth form errors are descriptive
- [ ] Request IDs appear in error logs

---

## Implementation Timeline

- **Day 1**: Update all API routes with error handling
- **Day 2**: Fix type safety issues across components
- **Day 3**: Add environment validation and error boundaries
- **Day 4**: Add loading skeletons to components
- **Day 5**: Improve auth forms and final testing

---

## Files Created

- ✅ `lib/types/index.ts` - Type definitions
- ✅ `lib/errors/index.ts` - Error handling utilities
- ✅ `lib/validation/index.ts` - Input validation functions
- ✅ `components/error-boundary.tsx` - Error boundary component
- ✅ `components/loading-skeletons.tsx` - Loading skeleton components

---

## Next Steps

After Phase 1 is complete:
1. Move to Phase 2: UX improvements and accessibility
2. Implement Phase 3: SEO and performance optimization
3. Complete Phase 4: Testing and monitoring setup

