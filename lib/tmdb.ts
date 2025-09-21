export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface MovieDetails extends Movie {
  genres: Genre[]
  runtime: number
  budget: number
  revenue: number
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string
  homepage: string
  imdb_id: string
  belongs_to_collection: MovieCollection | null
}

export interface ProductionCompany {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  known_for_department?: string
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Credits {
  cast: CastMember[]
  crew: CrewMember[]
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

export interface VideosResponse {
  results: Video[]
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface MovieReview {
  id: string
  author: string
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number | null
  }
  content: string
  created_at: string
  updated_at: string
  url: string
}

export interface MovieKeyword {
  id: number
  name: string
}

export interface MovieImage {
  aspect_ratio: number
  file_path: string
  height: number
  iso_639_1: string | null
  vote_average: number
  vote_count: number
  width: number
}

export interface MovieImages {
  backdrops: MovieImage[]
  logos: MovieImage[]
  posters: MovieImage[]
}

export interface WatchProvider {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}

export interface CountryWatchProviders {
  link?: string
  flatrate?: WatchProvider[]
  rent?: WatchProvider[]
  buy?: WatchProvider[]
}

export interface MovieWatchProviders {
  results: Record<string, CountryWatchProviders>
}

export interface ReleaseDate {
  certification: string
  iso_639_1: string
  note: string
  release_date: string
  type: number
}

export interface CountryReleaseDate {
  iso_3166_1: string
  release_dates: ReleaseDate[]
}

export interface MovieReleaseDates {
  results: CountryReleaseDate[]
}

export interface ExternalIds {
  imdb_id: string | null
  facebook_id: string | null
  instagram_id: string | null
  twitter_id: string | null
}

export interface MovieCollection {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  parts: Movie[]
}

export interface Language {
  iso_639_1: string
  english_name: string
  name: string
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export function getImageUrl(
  path: string | null,
  size: "w92" | "w154" | "w185" | "w200" | "w300" | "w342" | "w400" | "w500" | "w780" | "w1280" | "original" = "w500",
): string {
  if (!path) {
    return "/abstract-movie-poster.png"
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}
