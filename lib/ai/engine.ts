import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText, generateObject } from "ai"
import { z } from "zod"
import { Movie } from "@/lib/tmdb"

// Initialize Gemini Client
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
})

// Types
export interface UserProfile {
    id: string
    username: string
    preferences: Record<string, any>
    // taste_vector: number[] // Future use
}

export interface BingePlan {
    episodesPerSession: number
    totalDays: number
    endDate: string
    dailyTime: string
}

/**
 * Generate Personalized Picks
 * 
 * Since we don't have a fully populated vector DB of movies yet, 
 * we use Gemini to "hallucinate" the best search parameters for TMDB 
 * based on the user's mood and profile.
 */
export async function generatePersonalizedPicks(
    userProfile: UserProfile,
    moodPrompt: string
): Promise<{ searchParams: any; explanation: string }> {
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                explanation: z.string().describe("A short, 1-sentence explanation of why these parameters match the mood."),
                tmdbParams: z.object({
                    with_genres: z.string().optional().describe("Comma-separated genre IDs (e.g., '28,878')"),
                    with_keywords: z.string().optional().describe("Comma-separated keyword IDs"),
                    sort_by: z.enum(["popularity.desc", "vote_average.desc", "release_date.desc"]).default("popularity.desc"),
                    primary_release_year: z.number().optional(),
                })
            }),
            prompt: `
        You are a movie recommendation engine.
        User Profile: ${JSON.stringify(userProfile.preferences)}
        Current Mood: "${moodPrompt}"
        
        Translate this mood into TMDB discovery API parameters.
        Common TMDB Genre IDs:
        Action 28, Adventure 12, Animation 16, Comedy 35, Crime 80,
        Documentary 99, Drama 18, Family 10751, Fantasy 14, History 36,
        Horror 27, Music 10402, Mystery 9648, Romance 10749, Sci-Fi 878,
        TV Movie 10770, Thriller 53, War 10752, Western 37.
      `,
        })

        return {
            searchParams: object.tmdbParams,
            explanation: object.explanation
        }
    } catch (error) {
        console.error("AI Personalized Picks Failed:", error)
        // Fallback
        return {
            searchParams: { sort_by: "popularity.desc" },
            explanation: "We couldn't fully process your specific mood, so here are some popular hits!"
        }
    }
}

/**
 * Generate AI Insight
 * "Why you specifically will like this"
 */
export async function generateAIInsight(
    movie: Movie,
    userProfile: UserProfile
): Promise<string> {
    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            prompt: `
        You are a witty movie buff friend.
        Movie: "${movie.title}" (${movie.release_date})
        Overview: ${movie.overview}
        User Preferences: ${JSON.stringify(userProfile.preferences)}
        
        Write a 1-2 sentence insight on why this user specifically would enjoy this movie. 
        Be personal, engaging, and mention specific elements (acting, tone, director) if relevant.
        Do not start with "Based on your preferences..." or "You will like this because...". Just dive in.
      `,
        })
        return text
    } catch (error) {
        return `A hit movie that matches your taste for ${movie.title}.`
    }
}

/**
 * Binge Planner Logic
 */
export function calculateBingePlan(
    totalRuntimeMinutes: number,
    dailyAvailableMinutes: number
): BingePlan {
    if (dailyAvailableMinutes <= 0) dailyAvailableMinutes = 60 // Default fallback

    const daysToFinish = Math.ceil(totalRuntimeMinutes / dailyAvailableMinutes)

    // Calculate end date
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysToFinish)

    // Estimate episodes (assuming avg 45 min if unknown, but usually we'd want exact ep counts)
    // For this utility, we'll just return the raw math

    return {
        episodesPerSession: Math.floor(dailyAvailableMinutes / 45) || 1, // Rough estimate
        totalDays: daysToFinish,
        endDate: endDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
        dailyTime: `${Math.floor(dailyAvailableMinutes / 60)}h ${dailyAvailableMinutes % 60}m`
    }
}

/**
 * Generate Snack Pairing
 */
export async function generateSnackPairing(
    movieTitle: string,
    movieGenre: string
): Promise<{ food: string; reason: string }> {
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                food: z.string().describe("Name of the food dish or snack"),
                reason: z.string().describe("A creative, fun 1-sentence reason why it pairs well"),
            }),
            prompt: `
        Suggest a specific food dish or snack that pairs perfectly with the movie "${movieTitle}" (Genre: ${movieGenre}).
        Provide a creative, fun reason why they go together.
        Example: {"food": "Spicy Ramen", "reason": "The intense heat matches the fiery action sequences."}
      `,
        })

        return object
    } catch (error) {
        console.error("Snack Pairing Failed:", error)
        return {
            food: "Popcorn",
            reason: "You can't go wrong with the classic movie snack."
        }
    }
}
