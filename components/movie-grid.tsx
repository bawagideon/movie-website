"use client"


import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, type Movie } from "@/lib/tmdb"
import { WishlistButton } from "@/components/wishlist-button"
import Image from "next/image"
import type { AuthUser } from "@/lib/types"

interface MovieGridProps {
  movies: Movie[]
  loading: boolean
  user?: AuthUser | null
}

export function MovieGrid({ movies, loading, user }: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg aspect-[2/3] mb-2" />
            <div className="h-4 bg-muted rounded mb-1" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No movies found</p>
      </div>
    )
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-full"
      role="grid"
      aria-label={`Grid of ${movies.length} movies`}
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} user={user} />
      ))}
    </div>
  )
}

function MovieCard({ movie, user }: { movie: Movie; user?: any }) {
  const posterUrl = getImageUrl(movie.poster_path, "w500")
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null
  const rating = movie.vote_average && !isNaN(movie.vote_average) ? movie.vote_average : 0
  const ratingText = rating > 0 ? `${rating.toFixed(1)} out of 10` : "No rating"
  const yearText = releaseYear && !isNaN(releaseYear) ? releaseYear : "Release date unknown"

  const handleCardClick = () => {
    window.location.href = `/movie/${movie.id}`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-card/50 backdrop-blur-sm touch-manipulation"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}, rated ${ratingText}, released ${yearText}`}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={`Poster for ${movie.title}`}
            width={400}
            height={600}
            className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
            draggable={false}
            style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" aria-hidden="true">
            <Button size="sm" variant="secondary" className="mb-2" aria-hidden="true">
              View Details
            </Button>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 left-2" aria-label={`Rating: ${ratingText}`}>
            <Badge variant="secondary" className="bg-black/70 text-white border-0">
              <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" aria-hidden="true" />
              {rating.toFixed(1)}
            </Badge>
          </div>

          {/* Wishlist Button */}
          <div 
            className="absolute top-2 right-2" 
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={-1}
          >
            <WishlistButton movie={movie} user={user} />
          </div>
        </div>

        <div className="p-3">
          <h3 
            className="font-semibold text-base md:text-sm line-clamp-2 mb-1" 
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)' }}
          >
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground">{yearText}</p>
        </div>
      </CardContent>
    </Card>
  )
}
