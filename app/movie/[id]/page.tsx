import { createClient } from "@/lib/supabase/server"
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieReviews,
  getMovieKeywords,
  getMovieImages,
  getMovieWatchProviders,
  getMovieReleaseDates,
  getMovieExternalIds,
  getRecommendedMovies,
  getCollection,
} from "@/lib/tmdb-server"
import { notFound } from "next/navigation"
import MovieDetailsPage from "@/components/movie-details-page"

interface MoviePageProps {
  params: {
    id: string
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = Number.parseInt(params.id)

  if (isNaN(movieId)) {
    notFound()
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const [
      movieDetails,
      credits,
      videos,
      similarMovies,
      reviews,
      keywords,
      images,
      watchProviders,
      releaseDates,
      externalIds,
      recommendations,
    ] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId),
      getMovieVideos(movieId),
      getSimilarMovies(movieId),
      getMovieReviews(movieId),
      getMovieKeywords(movieId),
      getMovieImages(movieId),
      getMovieWatchProviders(movieId),
      getMovieReleaseDates(movieId),
      getMovieExternalIds(movieId),
      getRecommendedMovies(movieId),
    ])

    let collection = null
    if (movieDetails.belongs_to_collection) {
      try {
        collection = await getCollection(movieDetails.belongs_to_collection.id)
      } catch (error) {
        console.error("Failed to load collection:", error)
      }
    }

    return (
      <MovieDetailsPage
        movie={movieDetails}
        credits={credits}
        videos={videos.results}
        similarMovies={similarMovies.results}
        reviews={reviews.results}
        keywords={keywords.keywords}
        images={images}
        watchProviders={watchProviders}
        releaseDates={releaseDates}
        externalIds={externalIds}
        recommendations={recommendations.results}
        collection={collection}
        user={user}
      />
    )
  } catch (error) {
    console.error("Failed to load movie details:", error)
    notFound()
  }
}
