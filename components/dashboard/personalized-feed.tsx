"use client"

import { Movie } from "@/lib/tmdb"
import { MovieCard } from "@/components/movie-card"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface PersonalizedFeedProps {
    movies: Movie[]
    explanation?: string
    title?: string
}

export function PersonalizedFeed({ movies, explanation, title = "Personalized Picks" }: PersonalizedFeedProps) {
    if (!movies.length) return null

    return (
        <div className="space-y-6 py-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {title}
                </h2>
                {explanation && (
                    <p className="text-muted-foreground text-lg border-l-2 border-primary/50 pl-4 italic">
                        "{explanation}"
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie, index) => (
                    <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                        <MovieCard movie={movie} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
