
import { Star, Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, type Movie } from "@/lib/tmdb"
import Image from "next/image"

interface MovieHeroProps {
  movie: Movie
}

export function MovieHero({ movie }: MovieHeroProps) {
  const backdropUrl = getImageUrl(movie.backdrop_path, "original")
  const releaseYear = new Date(movie.release_date).getFullYear()

  return (
  <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden max-w-full">
      {/* Responsive Background Image */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
  <div className="container mx-auto px-2 sm:px-4 max-w-full">
          <div className="max-w-2xl">
            <h1 className="font-bold text-white mb-4 drop-shadow-lg" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)' }}>{movie.title}</h1>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
              <Badge variant="secondary">{releaseYear}</Badge>
              <Badge variant="outline" className="text-white border-white/30">
                {movie.adult ? "R" : "PG-13"}
              </Badge>
            </div>

            <p className="text-gray-200 mb-6 leading-relaxed" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)' }}>{movie.overview}</p>

            <div className="flex items-center space-x-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                <Play className="h-5 w-5 mr-2" />
                Watch Trailer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
