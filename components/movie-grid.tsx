"use client"

import { motion } from "framer-motion"
import { MovieCard } from "@/components/movie-card"
import type { Movie } from "@/lib/tmdb"
import type { AuthUser } from "@/lib/types"

interface MovieGridProps {
  movies: Movie[]
  loading: boolean
  user?: AuthUser | null
}

export function MovieGrid({ movies, loading, user }: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted/50 rounded-xl aspect-[2/3] mb-3" />
            <div className="h-4 bg-muted/50 rounded mb-2 w-3/4" />
            <div className="h-3 bg-muted/50 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-xl">No movies found matching your criteria.</p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} user={user} index={index} />
      ))}
    </motion.div>
  )
}

