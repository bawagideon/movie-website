"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, PlayCircle, Plus, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getImageUrl, type Movie } from "@/lib/tmdb"
import { WishlistButton } from "@/components/wishlist-button"
import Image from "next/image"
import Link from "next/link"
import type { AuthUser } from "@/lib/types"

interface MovieCardProps {
    movie: Movie
    user?: AuthUser | null
    index?: number
}

export function MovieCard({ movie, user, index = 0 }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    const posterUrl = getImageUrl(movie.poster_path, "w500")
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null
    const rating = movie.vote_average && !isNaN(movie.vote_average) ? movie.vote_average : 0
    const ratingText = rating > 0 ? `${rating.toFixed(1)}` : "NR"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Link href={`/movie/${movie.id}`} className="block h-full">
                <Card
                    className="h-full overflow-hidden border-0 bg-card/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 group relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <CardContent className="p-0 h-full flex flex-col">
                        <div className="relative aspect-[2/3] overflow-hidden">
                            <Image
                                src={posterUrl || "/placeholder.svg"}
                                alt={movie.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white text-sm line-clamp-3 mb-4 opacity-90">
                                        {movie.overview || "No overview available."}
                                    </p>

                                    <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                                            <PlayCircle className="h-4 w-4" />
                                            Details
                                        </Button>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <WishlistButton movie={movie} user={user} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Badge */}
                            <div className="absolute top-2 left-2 z-10">
                                <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/10 gap-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    {ratingText}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/20">
                            <div>
                                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                                    {movie.title}
                                </h3>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{releaseYear || "Unknown"}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}
