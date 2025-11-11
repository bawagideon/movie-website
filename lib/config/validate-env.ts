/**
 * Environment Variable Validation
 * Validates that all required environment variables are set on application startup
 */

export interface ValidatedEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  tmdbApiKey: string
  groqApiKey: string
  nodeEnv: 'development' | 'production' | 'test'
}

const requiredVars = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  NEXT_PUBLIC_TMDB_API_KEY: 'TMDB API key',
  GROQ_API_KEY: 'Groq API key for AI search',
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

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach((variable) => {
      console.error(`   - ${variable}`)
    })
    console.error('\n📖 See .env.example for required setup.')
    console.error('📝 Copy .env.example to .env.local and fill in your values.')
    throw new Error(`Missing environment variables: ${missingVars.map((v) => v.split(':')[0]).join(', ')}`)
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    tmdbApiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY!,
    groqApiKey: process.env.GROQ_API_KEY!,
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
    console.log('✅ Environment variables validated successfully')
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    process.exit(1)
  }
}
