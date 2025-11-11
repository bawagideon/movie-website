import { z } from "zod"

// Minimal, pragmatic schemas that validate only the fields we consume in the app.
// These avoid overly strict validation while still protecting against missing shapes.

export const MovieCollectionSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
})

export const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  vote_average: z.number().optional(),
  genre_ids: z.array(z.number()).optional(),
})

export const MovieDetailsSchema = MovieSchema.extend({
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  runtime: z.number().optional(),
  budget: z.number().optional(),
  revenue: z.number().optional(),
  production_companies: z.array(z.any()).optional(),
  production_countries: z.array(z.any()).optional(),
  spoken_languages: z.array(z.any()).optional(),
  status: z.string().optional(),
  tagline: z.string().optional(),
  homepage: z.string().optional(),
  imdb_id: z.string().nullable().optional(),
  belongs_to_collection: MovieCollectionSchema.nullable().optional(),
})

export const CastMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string().optional(),
  profile_path: z.string().nullable().optional(),
})

export const CrewMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  job: z.string().optional(),
  department: z.string().optional(),
})

export const CreditsSchema = z.object({
  cast: z.array(CastMemberSchema).optional(),
  crew: z.array(CrewMemberSchema).optional(),
})

export const VideoSchema = z.object({ id: z.string(), key: z.string(), name: z.string().optional(), site: z.string().optional(), type: z.string().optional() })
export const VideosResponseSchema = z.object({ results: z.array(VideoSchema).optional() })

export const TMDBListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({ page: z.number().optional(), results: z.array(itemSchema).optional(), total_pages: z.number().optional(), total_results: z.number().optional() })

export const MovieImagesSchema = z.object({ backdrops: z.array(z.any()).optional(), logos: z.array(z.any()).optional(), posters: z.array(z.any()).optional() })

export const MovieKeywordsSchema = z.object({ keywords: z.array(z.object({ id: z.number(), name: z.string() })).optional() })

export const MovieReviewsSchema = z.object({ results: z.array(z.any()).optional() })

export const MovieWatchProvidersSchema = z.object({ results: z.record(z.string(), z.any()).optional() })

export const MovieReleaseDatesSchema = z.object({ results: z.array(z.any()).optional() })

export const ExternalIdsSchema = z.object({ imdb_id: z.string().nullable().optional(), facebook_id: z.string().nullable().optional(), instagram_id: z.string().nullable().optional(), twitter_id: z.string().nullable().optional() })

// Validator helpers
export function validate<T>(schema: z.ZodType<T>) {
  return (data: unknown): T => schema.parse(data)
}

export const validateMovieDetails = validate(MovieDetailsSchema)
export const validateCredits = validate(CreditsSchema)
export const validateVideos = validate(VideosResponseSchema)
export const validateMovieList = <T extends z.ZodTypeAny>(itemSchema: T) => validate(TMDBListSchema(itemSchema))
export const validateMovieImages = validate(MovieImagesSchema)
export const validateMovieKeywords = validate(MovieKeywordsSchema)
export const validateMovieReviews = validate(MovieReviewsSchema)
export const validateMovieWatchProviders = validate(MovieWatchProvidersSchema)
export const validateMovieReleaseDates = validate(MovieReleaseDatesSchema)
export const validateExternalIds = validate(ExternalIdsSchema)
