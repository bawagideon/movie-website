"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Play,
  Calendar,
  Clock,
  Star,
  Globe,
  DollarSign,
  ImageIcon,
  MessageSquare,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WishlistButton } from "@/components/wishlist-button"
import { MovieDetailsSkeleton } from "@/components/loading-skeletons"
import {
  getImageUrl,
  type MovieDetails,
  type Credits,
  type Video,
  type Movie,
  type MovieReview,
  type MovieKeyword,
  type MovieImages,
  type MovieWatchProviders,
  type MovieReleaseDates,
  type ExternalIds,
  type MovieCollection,
} from "@/lib/tmdb"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/lib/types"

// Phase 4 Components
import { AIInsight } from "@/components/movie/ai-insight"
import { BingePlanner } from "@/components/movie/binge-planner"
import { SnackGenerator } from "@/components/movie/snack-generator"
import { Zap, Tv, Armchair } from "lucide-react"
import { useEffect } from "react"

interface MovieDetailsPageProps {
  movie: MovieDetails
  credits: Credits
  videos: Video[]
  similarMovies: Movie[]
  reviews: MovieReview[]
  keywords: MovieKeyword[]
  images: MovieImages
  watchProviders: MovieWatchProviders
  releaseDates: MovieReleaseDates
  externalIds: ExternalIds
  recommendations: Movie[]
  collection: MovieCollection | null
  user: AuthUser | null
}

import { getMovieExtraDetails, getMovieCollection } from "@/app/actions"

// ... imports

export default function MovieDetailsPage({
  movie,
  credits,
  videos,
  images,
  reviews: initialReviews,
  similarMovies: initialSimilarMovies,
  recommendations: initialRecommendations,
  watchProviders,
  keywords: initialKeywords,
  externalIds,
  releaseDates,
  user,
  collection: initialCollection,
}: MovieDetailsPageProps) {
  const router = useRouter()
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isCinemaMode, setIsCinemaMode] = useState(false)

  const [extraDetails, setExtraDetails] = useState({
    reviews: initialReviews,
    similarMovies: initialSimilarMovies,
    recommendations: initialRecommendations,
    keywords: initialKeywords,
  })

  const [collectionData, setCollectionData] = useState<MovieCollection | null>(initialCollection)

  useEffect(() => {
    // If we didn't get data from props (lazy loading), fetch it now
    if (initialReviews.length === 0 && initialSimilarMovies.length === 0) {
      getMovieExtraDetails(movie.id).then((data) => {
        setExtraDetails({
          reviews: data.reviews,
          similarMovies: data.similarMovies,
          recommendations: data.recommendations,
          keywords: data.keywords,
        })
      })
    }

    // Lazy load collection if needed
    if (!collectionData && movie.belongs_to_collection) {
      getMovieCollection(movie.belongs_to_collection.id).then((data) => {
        setCollectionData(data)
      })
    }
  }, [movie.id, initialReviews.length, initialSimilarMovies.length, movie.belongs_to_collection])

  const reviews = extraDetails.reviews
  const similar = extraDetails.similarMovies
  const recommendations = extraDetails.recommendations
  const keywords = extraDetails.keywords

  // Cinema Mode Effect
  useEffect(() => {
    if (isCinemaMode) {
      document.body.classList.add("cinema-mode")
    } else {
      document.body.classList.remove("cinema-mode")
    }
    return () => document.body.classList.remove("cinema-mode")
  }, [isCinemaMode])

  // Mock AI Match Score (Random for now, would be real vector similarity later)
  const matchScore = Math.floor(Math.random() * (99 - 75) + 75)

  const backdropUrl = getImageUrl(movie.backdrop_path, "w1280")
  const posterUrl = getImageUrl(movie.poster_path, "w500")
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A"

  const usRelease = releaseDates.results.find((r) => r.iso_3166_1 === "US")
  const usCertification = usRelease?.release_dates.find((d) => d.certification)?.certification || "NR"

  const trailers = videos.filter((video) => video.type === "Trailer" && video.site === "YouTube")
  const mainTrailer = trailers.find((video) => video.official) || trailers[0]

  const mainCast = credits.cast.slice(0, 20) // Show more cast members
  const supportingCast = credits.cast.slice(20, 40)
  const director = credits.crew.find((person) => person.job === "Director")
  const writers = credits.crew.filter(
    (person) => person.job === "Writer" || person.job === "Screenplay" || person.job === "Story",
  )
  const producers = credits.crew.filter((person) => person.job === "Producer" || person.job === "Executive Producer")
  const cinematographer = credits.crew.find((person) => person.job === "Director of Photography")
  const composer = credits.crew.find((person) => person.job === "Original Music Composer")

  const usWatchProviders = watchProviders.results?.US
  const ukWatchProviders = watchProviders.results?.GB
  const caWatchProviders = watchProviders.results?.CA

  const fallbackProviders = !usWatchProviders?.flatrate
    ? (usWatchProviders?.rent || usWatchProviders?.buy || []).slice(0, 3)
    : []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" >
      {/* Hero Section */}
      < div className="relative h-[60vh] sm:h-[70vh] overflow-hidden" >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={backdropUrl || "/placeholder.jpg"}
            alt={movie.title}
            fill
            className="object-cover object-center select-none pointer-events-none"
            priority={true}
            sizes="100vw"
            style={{ zIndex: 0 }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Navigation - Back button removed in favor of global SiteHeader */}


        {/* Movie Info */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-8" >
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-shrink-0">
              <Image
                src={posterUrl || "/placeholder.svg"}
                alt={movie.title}
                width={320}
                height={480}
                className="w-44 sm:w-64 h-auto object-cover rounded-lg shadow-2xl"
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 320px"
                draggable={false}
                priority={false}
              />
            </div>

            <div className="flex-1 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-bold mb-2" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>{movie.title}</h1>
                  {movie.tagline && <p className="text-xl text-gray-300 italic mb-4">{movie.tagline}</p>}
                </div>
                <WishlistButton movie={movie} size="default" variant="outline" />
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{movie.vote_average?.toFixed(1) || "N/A"}</span>
                  <span className="text-gray-300">({movie.vote_count?.toLocaleString() || 0} votes)</span>
                </div>
                {user && (
                  <Badge variant="outline" className="border-green-500 text-green-400 gap-1">
                    <Zap className="h-3 w-3 fill-current" />
                    {matchScore}% Match
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{runtime}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="bg-white/20 text-white">
                    {genre.name}
                  </Badge>
                ))}

                <p className="text-gray-200 mb-6 max-w-3xl leading-relaxed" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)' }}>{movie.overview}</p>

                <div className="flex flex-wrap gap-4">
                  {mainTrailer && (
                    <Button
                      size="lg"
                      onClick={() => setSelectedVideo(mainTrailer)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Trailer
                    </Button>
                  )}

                  {user && (
                    <>
                      <BingePlanner
                        movie={movie}
                        collection={collectionData}
                        similarMovies={similar}
                      />
                      <SnackGenerator
                        movieTitle={movie.title}
                        movieGenre={movie.genres[0]?.name || "General"}
                      />
                      <Button
                        variant={isCinemaMode ? "default" : "outline"}
                        onClick={() => setIsCinemaMode(!isCinemaMode)}
                        className="gap-2"
                      >
                        <Armchair className="h-4 w-4" />
                        {isCinemaMode ? "Exit Cinema Mode" : "Cinema Mode"}
                      </Button>
                    </>
                  )}
                </div>

                {/* Universal Streaming Gateway */}
                {user && (usWatchProviders?.flatrate || usWatchProviders?.rent || usWatchProviders?.buy) && (
                  <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Tv className="h-4 w-4" />
                      Where to Watch
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {usWatchProviders?.flatrate?.map((provider) => (
                        <a
                          key={provider.provider_id}
                          href={`https://www.google.com/search?q=watch ${movie.title} on ${provider.provider_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative"
                          title={`Stream on ${provider.provider_name}`}
                        >
                          <img
                            src={getImageUrl(provider.logo_path, "w92") || "/placeholder.svg"}
                            alt={provider.provider_name}
                            className="w-10 h-10 rounded-lg shadow-md transition-transform group-hover:scale-110"
                          />
                        </a>
                      ))}
                      {/* Fallback if no flatrate */}
                      {fallbackProviders.map((provider) => (
                        <a
                          key={provider.provider_id}
                          href={`https://www.google.com/search?q=rent ${movie.title} on ${provider.provider_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative"
                          title={`Rent/Buy on ${provider.provider_name}`}
                        >
                          <img
                            src={getImageUrl(provider.logo_path, "w92") || "/placeholder.svg"}
                            alt={provider.provider_name}
                            className="w-10 h-10 rounded-lg shadow-md transition-transform group-hover:scale-110 grayscale group-hover:grayscale-0"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div >

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg overflow-hidden max-w-4xl w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedVideo.name}</h3>
              <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
                ×
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.key}`}
                title={selectedVideo.name}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImageIndex !== null && images?.backdrops?.[selectedImageIndex] && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white z-10"
              onClick={() => setSelectedImageIndex(null)}
            >
              ×
            </Button>
            <img
              src={getImageUrl(images.backdrops[selectedImageIndex]?.file_path, "w1280") || "/placeholder.svg"}
              alt="Movie image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-4 py-8 space-y-12 max-w-full">

        {/* AI Insight Section */}
        {user && (
          <section>
            <AIInsight
              movieTitle={movie.title}
              movieOverview={movie.overview}
              className="mb-8"
            />
          </section>
        )}

        {/* Movie Information & Box Office Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Movie Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span>{movie.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Language</span>
                  <span>{movie.original_language?.toUpperCase() || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Runtime</span>
                  <span>{runtime}</span>
                </div>
                {movie.homepage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Homepage</span>
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-4 w-4" />
                      Visit
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Box Office</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {movie.budget > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(movie.budget)}
                    </span>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(movie.revenue)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Popularity</span>
                  <span>{movie.popularity?.toFixed(1) || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cast & Crew Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cast & Crew</h2>
          <div className="space-y-8">
            {/* Key Crew */}
            <div>
              <h3 className="text-xl font-bold mb-4">Key Crew</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {director && (
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <img
                        src={getImageUrl(director.profile_path, "w200") || "/placeholder.svg"}
                        alt={director.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{director.name}</h4>
                        <p className="text-sm text-muted-foreground">Director</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {writers.slice(0, 2).map((writer) => (
                  <Card key={`${writer.id}-${writer.job}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <img
                        src={getImageUrl(writer.profile_path, "w200") || "/placeholder.svg"}
                        alt={writer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{writer.name}</h4>
                        <p className="text-sm text-muted-foreground">{writer.job}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {cinematographer && (
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <img
                        src={getImageUrl(cinematographer.profile_path, "w200") || "/placeholder.svg"}
                        alt={cinematographer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{cinematographer.name}</h4>
                        <p className="text-sm text-muted-foreground">Cinematography</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {composer && (
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <img
                        src={getImageUrl(composer.profile_path, "w200") || "/placeholder.svg"}
                        alt={composer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{composer.name}</h4>
                        <p className="text-sm text-muted-foreground">Music</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Main Cast */}
            <div>
              <h3 className="text-xl font-bold mb-4">Main Cast</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mainCast.map((person) => (
                  <Card key={person.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <img
                        src={getImageUrl(person.profile_path, "w300") || "/placeholder.svg"}
                        alt={person.name}
                        className="w-full aspect-[2/3] object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{person.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{person.character}</p>
                      {person.known_for_department && (
                        <p className="text-xs text-blue-400 mt-1">{person.known_for_department}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Supporting Cast */}
            {supportingCast.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Supporting Cast</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportingCast.map((person) => (
                    <Card key={person.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        <img
                          src={getImageUrl(person.profile_path, "w200") || "/placeholder.svg"}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{person.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Producers */}
            {producers.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Producers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {producers.slice(0, 6).map((producer) => (
                    <Card key={`${producer.id}-${producer.job}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 flex items-center gap-3">
                        <img
                          src={getImageUrl(producer.profile_path, "w200") || "/placeholder.svg"}
                          alt={producer.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{producer.name}</h4>
                          <p className="text-xs text-muted-foreground">{producer.job}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Media Gallery Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Media Gallery</h2>
          <div className="space-y-6">
            {images.backdrops.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Backdrops
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.backdrops.slice(0, 12).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={getImageUrl(image.file_path, "w500") || "/placeholder.svg"}
                        alt={`${movie.title} backdrop`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.posters.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Posters</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.posters.slice(0, 12).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-[2/3] bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={getImageUrl(image.file_path, "w342") || "/placeholder.svg"}
                        alt={`${movie.title} poster`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            User Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No reviews available for this movie.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          {review.author_details.avatar_path ? (
                            <img
                              src={
                                review.author_details.avatar_path.startsWith("/https")
                                  ? review.author_details.avatar_path.slice(1)
                                  : getImageUrl(review.author_details.avatar_path, "w200")
                              }
                              alt={review.author}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold">{review.author.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review.author}</h4>
                          {review.author_details.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{review.author_details.rating}/10</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm leading-relaxed line-clamp-4">{review.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Streaming Options Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Where to Watch</h2>
          <div className="space-y-6">
            {/* US Providers */}
            {usWatchProviders && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🇺🇸</span>
                    United States
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {usWatchProviders.flatrate && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Stream (Subscription)
                      </h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {usWatchProviders.flatrate.map((provider) => (
                          <div key={provider.provider_id} className="text-center">
                            <img
                              src={getImageUrl(provider.logo_path, "w200") || "/placeholder.svg"}
                              alt={provider.provider_name}
                              className="w-12 h-12 rounded-lg mx-auto mb-1"
                            />
                            <p className="text-xs text-muted-foreground truncate">{provider.provider_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {usWatchProviders.rent && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Rent
                      </h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {usWatchProviders.rent.map((provider) => (
                          <div key={provider.provider_id} className="text-center">
                            <img
                              src={getImageUrl(provider.logo_path, "w200") || "/placeholder.svg"}
                              alt={provider.provider_name}
                              className="w-12 h-12 rounded-lg mx-auto mb-1"
                            />
                            <p className="text-xs text-muted-foreground truncate">{provider.provider_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {usWatchProviders.buy && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Buy
                      </h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {usWatchProviders.buy.map((provider) => (
                          <div key={provider.provider_id} className="text-center">
                            <img
                              src={getImageUrl(provider.logo_path, "w200") || "/placeholder.svg"}
                              alt={provider.provider_name}
                              className="w-12 h-12 rounded-lg mx-auto mb-1"
                            />
                            <p className="text-xs text-muted-foreground truncate">{provider.provider_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* UK Providers */}
            {ukWatchProviders && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🇬🇧</span>
                    United Kingdom
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ukWatchProviders.flatrate && (
                    <div>
                      <h4 className="font-semibold mb-3">Stream</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {ukWatchProviders.flatrate.map((provider) => (
                          <div key={provider.provider_id} className="text-center">
                            <img
                              src={getImageUrl(provider.logo_path, "w200") || "/placeholder.svg"}
                              alt={provider.provider_name}
                              className="w-12 h-12 rounded-lg mx-auto mb-1"
                            />
                            <p className="text-xs text-muted-foreground truncate">{provider.provider_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {ukWatchProviders.rent && (
                    <div>
                      <h4 className="font-semibold mb-3">Rent</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {ukWatchProviders.rent.map((provider) => (
                          <div key={provider.provider_id} className="text-center">
                            <img
                              src={getImageUrl(provider.logo_path, "w200") || "/placeholder.svg"}
                              alt={provider.provider_name}
                              className="w-12 h-12 rounded-lg mx-auto mb-1"
                            />
                            <p className="text-xs text-muted-foreground truncate">{provider.provider_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Canada Providers */}
            {caWatchProviders && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🇨🇦</span>
                    Canada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {caWatchProviders.flatrate && (
                    <div>
                      <h4 className="font-semibold mb-3">Stream</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {caWatchProviders.flatrate.map((provider) => (
                          <div key={provider.provider_id} className="text-center">
                            <img
                              src={getImageUrl(provider.logo_path, "w200") || "/placeholder.svg"}
                              alt={provider.provider_name}
                              className="w-12 h-12 rounded-lg mx-auto mb-1"
                            />
                            <p className="text-xs text-muted-foreground truncate">{provider.provider_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!usWatchProviders && !ukWatchProviders && !caWatchProviders && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No streaming information available for this movie.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Production Companies Section */}
        {movie.production_companies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Production Companies</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {movie.production_companies.map((company) => (
                    <div key={company.id} className="text-center">
                      {company.logo_path && (
                        <img
                          src={getImageUrl(company.logo_path, "w200") || "/placeholder.svg"}
                          alt={company.name}
                          className="h-12 mx-auto mb-2 object-contain"
                        />
                      )}
                      <p className="text-sm font-medium">{company.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Similar Movies Section */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.slice(0, 12).map((movie) => (
                <Card key={movie.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <img
                      src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover rounded-t-lg"
                    />
                    <div className="p-3">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">{movie.title}</h4>
                      <p className="text-xs text-muted-foreground">{new Date(movie.release_date).getFullYear()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div >
  )
}
