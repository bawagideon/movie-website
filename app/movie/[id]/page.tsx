import { createClient } from "@/lib/supabase/server"
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getMovieImages,
  getMovieWatchProviders,
  getMovieReleaseDates,
  getMovieExternalIds,
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
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const [
      movieDetails,
      credits,
      videos,
      images,
      watchProviders,
      releaseDates,
      externalIds,
    ] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId),
      getMovieVideos(movieId),
      getMovieImages(movieId),
      getMovieWatchProviders(movieId),
      getMovieReleaseDates(movieId),
      getMovieExternalIds(movieId),
    ])

    // Collection is now lazy loaded in the client component
    const collection = null

    return (
      <MovieDetailsPage
        movie={movieDetails}
        credits={credits}
        videos={videos.results}
        similarMovies={[]}
        reviews={[]}
        keywords={[]}
        images={images}
        watchProviders={watchProviders}
        releaseDates={releaseDates}
        externalIds={externalIds}
        recommendations={[]}
        collection={collection}
        user={user}
      />
    )
  } catch (error) {
    console.error("Failed to load movie details:", error)
    notFound()
  }
}
