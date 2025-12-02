"use client"

import { motion } from "framer-motion"
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
    <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden max-w-full group">
      {/* Responsive Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={backdropUrl || "/placeholder.jpg"}
          alt={movie.title}
          fill
          className="object-cover object-center select-none pointer-events-none transition-transform duration-[20s] ease-in-out group-hover:scale-110"
          priority={true}
          sizes="100vw"
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 max-w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-bold text-white mb-4 drop-shadow-2xl leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              {movie.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center space-x-4 mb-6"
            >
              <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-500/30">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold">{movie.vote_average.toFixed(1)}</span>
              </div>
              <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md px-3 py-1 text-base">
                {releaseYear}
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md px-3 py-1 text-base">
                {movie.adult ? "R" : "PG-13"}
              </Badge>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-200 mb-8 leading-relaxed text-lg md:text-xl max-w-2xl drop-shadow-md"
            >
              {movie.overview}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center space-x-4"
            >
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Play className="h-5 w-5 mr-2 fill-current" />
                Watch Trailer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm rounded-full px-8 h-12 text-lg font-semibold transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add to Wishlist
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
