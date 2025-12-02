/**
 * Environment Variable Validation
 * Validates that all required environment variables are set on application startup
 */

export interface ValidatedEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  tmdbApiKey: string
  googleApiKey: string
  nodeEnv: 'development' | 'production' | 'test'
}

const requiredVars = {
  NEXT_PUBLIC_TMDB_API_KEY: 'TMDB API key',
  GOOGLE_GENERATIVE_AI_API_KEY: 'Google Gemini API key',
}

/**
 * Validate all required environment variables
 * Throws error if any required variable is missing
 */
export function validateEnvironment(): ValidatedEnv {
  const missingVars: string[] = []

  for (const [key, description] of Object.entries(requiredVars)) {
    if (!process.env[key]) {
      missingVars.push(`${key}: ${description}`)
    }
  }

  const isProd = process.env.NODE_ENV === 'production'

  if (missingVars.length > 0) {
    const names = missingVars.map((v) => v.split(':')[0]).join(', ')

    // In production we keep the strict behavior (throw) so deployments fail fast.
    // In development/test we log a single warning and return safe (possibly empty) fallbacks
    if (isProd) {
      console.error('❌ Missing required environment variables:')
      missingVars.forEach((variable) => {
        console.error(`   - ${variable}`)
      })
      console.error('\n📖 See .env.example for required setup.')
      console.error('📝 Copy .env.example to .env.local and fill in your values.')
      throw new Error(`Missing environment variables: ${names}`)
    } else {
      // warn once (less noisy than many console.error calls)
      console.warn(`⚠️ Missing environment variables (development): ${names}. See .env.example to set them.`)
    }
  }

  // Return values as strings; use empty string fallback for missing vars in dev to avoid runtime crashes
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    tmdbApiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '',
    googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  }
}

/**
 * Validate environment on application startup
 * Call this in your root layout or entry point
 */
export function initializeEnvironment(): void {
  try {
    validateEnvironment()
    // Only log success on the server to reduce client console noise
    if (typeof window === 'undefined') {
      console.log('✅ Environment variables validated successfully')
    }
  } catch (error) {
    // If we're on the server in production, exit to fail fast. On the client/dev we avoid crashing.
    if (typeof window === 'undefined') {
      console.error('❌ Environment validation failed:', error)
      try {
        process.exit(1)
      } catch (_e) {
        // some environments (like certain serverless runtimes) may not allow exit; just throw
        throw error
      }
    } else {
      // Client: surface a single console.warn to avoid noisy stacks
      console.warn('Environment validation failed (client):', error)
    }
  }
}
