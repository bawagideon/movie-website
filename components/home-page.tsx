"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Play, Film, Star, TrendingUp, Zap, Calendar, Heart, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MovieGrid } from "@/components/movie-grid"
import { MovieHero } from "@/components/movie-hero"
import { GenreFilter } from "@/components/genre-filter"
import AISearch from "@/components/ai-search"
import { MovieGridSkeleton } from "@/components/loading-skeletons"
import type { Movie, Genre, Language } from "@/lib/tmdb"
import type { AuthUser } from "@/lib/types"
import Link from "next/link"

// Dashboard Components
import { DashboardHero } from "@/components/dashboard/hero"
import { MoodDeck } from "@/components/dashboard/mood-deck"
import { PersonalizedFeed } from "@/components/dashboard/personalized-feed"

type MovieCategory = "popular" | "top_rated" | "now_playing" | "upcoming"

interface HomePageProps {
  user: AuthUser | null
}

export default function HomePage({ user }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [movies, setMovies] = useState<Movie[]>([])
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<MovieCategory>("popular")
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [categoryCache, setCategoryCache] = useState<Record<string, Movie[]>>({})
  const [genres, setGenres] = useState<Genre[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "release_date">("popularity")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAISearch, setShowAISearch] = useState(false)
  const [backgroundMovies, setBackgroundMovies] = useState<Movie[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Dashboard State
  const [dashboardMovies, setDashboardMovies] = useState<Movie[]>([])
  const [dashboardExplanation, setDashboardExplanation] = useState("")
  const [isDashboardSearching, setIsDashboardSearching] = useState(false)

  useEffect(() => {
    loadCriticalData()
    loadSecondaryData()
  }, [])

  useEffect(() => {
    if (!searchQuery && !user) {
      if (categoryCache[activeCategory] && currentPage === 1 && !selectedGenre && sortBy === "popularity") {
        setMovies(categoryCache[activeCategory])
      } else {
        loadMoviesByCategory(activeCategory, currentPage)
      }
    } else if (user && dashboardMovies.length === 0) {
      loadMoviesByCategory("popular", 1).then(() => {
        setDashboardMovies(movies)
      })
    }
  }, [activeCategory, selectedGenre, sortBy, currentPage, user])

  const loadCriticalData = async () => {
    try {
      const [popularMovies, trendingMovies] = await Promise.all([
        fetch("/api/movies/popular").then((res) => res.json()),
        fetch("/api/movies/trending").then((res) => res.json()),
      ])

      const popular = popularMovies?.data?.results || []
      const trending = trendingMovies?.data?.results || []

      setMovies(popular)
      setCategoryCache(prev => ({ ...prev, popular }))

      if (user) setDashboardMovies(popular)
      if (trending.length > 0) setFeaturedMovie(trending[0])

      const allBackgroundMovies = [...popular.slice(0, 30), ...trending.slice(0, 6)]
      setBackgroundMovies(allBackgroundMovies)
    } catch (error) {
      console.error("Failed to load critical data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSecondaryData = async () => {
    try {
      const [genresData, languagesData] = await Promise.all([
        fetch("/api/genres").then((res) => res.json()),
        fetch("/api/languages").then((res) => res.json()),
      ])

      setGenres(genresData?.genres || [])
      setLanguages(languagesData?.languages || [])
    } catch (error) {
      console.error("Failed to load secondary data:", error)
    }
  }

  const loadMoviesByCategory = async (category: MovieCategory, page = 1) => {
    // If we have it in cache and we are on page 1 with no filters, use cache
    if (page === 1 && !selectedGenre && sortBy === "popularity" && categoryCache[category]) {
      setMovies(categoryCache[category])
      return
    }

    setLoading(true)
    try {
      let response
      switch (category) {
        case "popular":
          response = await fetch(`/api/movies/popular?page=${page}`).then((res) => res.json())
          break
        case "top_rated":
          response = await fetch(`/api/movies/top-rated?page=${page}`).then((res) => res.json())
          break
        case "now_playing":
          response = await fetch(`/api/movies/now-playing?page=${page}`).then((res) => res.json())
          break
        case "upcoming":
          response = await fetch(`/api/movies/upcoming?page=${page}`).then((res) => res.json())
          break
      }

      const movieList = response?.data?.results || []
      let filteredMovies = movieList

      if (selectedGenre) {
        filteredMovies = filteredMovies.filter((movie: Movie) => (movie.genre_ids || []).includes(selectedGenre))
      }

      filteredMovies = sortMovies(filteredMovies, sortBy)

      if (page === 1 && !selectedGenre && sortBy === "popularity") {
        setCategoryCache(prev => ({ ...prev, [category]: filteredMovies }))
      }

      setMovies(page === 1 ? filteredMovies : [...(movies || []), ...filteredMovies])
    } catch (error) {
      console.error("Failed to load movies:", error)
    } finally {
      setLoading(false)
    }
  }

  const sortMovies = (movieList: Movie[], sortType: typeof sortBy): Movie[] => {
    return [...movieList].sort((a, b) => {
      switch (sortType) {
        case "rating":
          return b.vote_average - a.vote_average
        case "release_date":
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        case "popularity":
        default:
          return b.popularity - a.popularity
      }
    })
  }

  // handleSearch replaced by performSearch logic


  const handleDashboardSearch = async (query: string) => {
    setIsDashboardSearching(true)
    try {
      const res = await fetch("/api/ai/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: query })
      })
      const data = await res.json()

      if (data.movies) {
        setDashboardMovies(data.movies)
        setDashboardExplanation(data.explanation)
      }
    } catch (error) {
      console.error("Dashboard search failed:", error)
    } finally {
      setIsDashboardSearching(false)
    }
  }

  const handleCategoryChange = (category: MovieCategory) => {
    setActiveCategory(category)
    setCurrentPage(1)
    setSearchQuery("")
  }

  const handleGenreChange = (genreId: number | null) => {
    setSelectedGenre(genreId)
    setCurrentPage(1)
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
    setCurrentPage(1)
  }

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1)
  }

  const getCategoryTitle = (category: MovieCategory) => {
    switch (category) {
      case "popular":
        return "Popular Movies"
      case "top_rated":
        return "Top Rated Movies"
      case "now_playing":
        return "Now Playing"
      case "upcoming":
        return "Coming Soon"
    }
  }

  const searchParams = useSearchParams()
  const queryParam = searchParams.get("q")

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam)
      performSearch(queryParam)
    }
  }, [queryParam])

  // ... (existing useEffects)

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const results = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`).then((res) =>
        res.json(),
      )
      let filteredMovies = results?.data?.results || []

      if (selectedGenre) {
        filteredMovies = filteredMovies.filter((movie: Movie) => movie.genre_ids.includes(selectedGenre))
      }

      filteredMovies = sortMovies(filteredMovies, sortBy)
      setMovies(filteredMovies)
      setCurrentPage(1)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  // ... (existing handlers)

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 font-sans">
      {/* Header removed - now in SiteHeader */}


      <div className="pt-20">
        {user ? (
          // LOGGED IN: PERSONALIZED DASHBOARD
          <main className="min-h-screen bg-background">
            <DashboardHero onSearch={handleDashboardSearch} isSearching={isDashboardSearching} />

            <div className="container mx-auto px-4 space-y-8 pb-20">
              <MoodDeck />

              <PersonalizedFeed
                movies={dashboardMovies}
                explanation={dashboardExplanation}
                title={dashboardExplanation ? "Your Personalized Picks" : "Recommended for You"}
              />
            </div>
          </main>
        ) : (
          // LOGGED OUT: LANDING PAGE
          <AnimatePresence mode="wait">
            {showAISearch ? (
              <motion.div
                key="ai-search"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <section className="relative min-h-[80vh] flex flex-col items-center justify-center p-4">
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                  </div>

                  <div className="relative z-10 w-full max-w-5xl">
                    <div className="text-center mb-12 space-y-4">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                          Discover Your Next Favorite
                        </h2>
                      </motion.div>
                      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Powered by Gemini 1.5 Pro to understand your exact mood and preferences.
                      </p>
                    </div>

                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                      <AISearch user={user} languages={languages} />
                    </div>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="main-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Hero Section */}
                {!searchQuery && featuredMovie && (
                  <section className="relative h-[80vh] w-full overflow-hidden">
                    <div className="absolute inset-0">
                      <img
                        src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`}
                        alt={featuredMovie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-4xl space-y-6 z-10">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/20 backdrop-blur-md px-4 py-1 text-sm uppercase tracking-wider">
                          Trending Now
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white drop-shadow-2xl">
                          {featuredMovie.title}
                        </h1>
                        <div className="flex items-center gap-4 mb-6 text-white/80">
                          <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {featuredMovie.vote_average.toFixed(1)}</span>
                          <span>•</span>
                          <span>{new Date(featuredMovie.release_date).getFullYear()}</span>
                          <span>•</span>
                          <span className="uppercase border border-white/20 px-2 py-0.5 rounded text-xs">HD</span>
                        </div>
                        <p className="text-lg md:text-xl text-gray-300 line-clamp-3 mb-8 max-w-2xl leading-relaxed">
                          {featuredMovie.overview}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Button size="lg" className="rounded-full px-8 h-12 gap-2 text-lg bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                            <Play className="h-5 w-5 fill-current" />
                            Watch Trailer
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full px-8 h-12 gap-2 text-lg bg-white/5 border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
                            onClick={() => setShowAISearch(true)}
                          >
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            AI Search
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </section>
                )}

                {/* Main Content */}
                <main className="container mx-auto px-4 py-12">
                  {!searchQuery ? (
                    <Tabs value={activeCategory} onValueChange={(value) => handleCategoryChange(value as MovieCategory)} className="space-y-12">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sticky top-20 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-white/5">
                        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-full w-full lg:w-auto overflow-x-auto h-12">
                          <TabsTrigger value="popular" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Popular</TabsTrigger>
                          <TabsTrigger value="top_rated" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Top Rated</TabsTrigger>
                          <TabsTrigger value="now_playing" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Now Playing</TabsTrigger>
                          <TabsTrigger value="upcoming" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Upcoming</TabsTrigger>
                        </TabsList>

                        <div className="flex flex-wrap items-center gap-4">
                          <GenreFilter genres={genres} selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />

                          <Select value={sortBy} onValueChange={(value) => handleSortChange(value as typeof sortBy)}>
                            <SelectTrigger className="w-40 rounded-full bg-white/5 border-white/10 h-10" aria-label="Sort movies">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="popularity">Popularity</SelectItem>
                              <SelectItem value="rating">Rating</SelectItem>
                              <SelectItem value="release_date">Release Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <TabsContent value={activeCategory} className="mt-0 space-y-8">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                          <div>
                            <h2 className="text-3xl font-bold tracking-tight">{getCategoryTitle(activeCategory)}</h2>
                            <p className="text-muted-foreground">
                              {selectedGenre
                                ? `Showing ${genres.find((g) => g.id === selectedGenre)?.name} movies`
                                : `Discover the best ${getCategoryTitle(activeCategory).toLowerCase()}`}
                            </p>
                          </div>
                        </div>

                        {loading ? <MovieGridSkeleton /> : <MovieGrid movies={movies} loading={loading} user={user} />}

                        {movies.length > 0 && !loading && (
                          <div className="flex justify-center mt-16">
                            <Button onClick={loadMore} variant="outline" size="lg" className="rounded-full px-10 h-12 border-white/10 hover:bg-white/5 text-lg">
                              Load More Movies
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-2">Search Results for "{searchQuery}"</h2>
                          <p className="text-muted-foreground">
                            {movies.length} {movies.length === 1 ? "movie" : "movies"} found
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <GenreFilter genres={genres} selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />

                          <Select value={sortBy} onValueChange={(value) => handleSortChange(value as typeof sortBy)}>
                            <SelectTrigger className="w-40 rounded-full bg-white/5 border-white/10">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="popularity">Popularity</SelectItem>
                              <SelectItem value="rating">Rating</SelectItem>
                              <SelectItem value="release_date">Release Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {loading ? <MovieGridSkeleton /> : <MovieGrid movies={movies} loading={loading} user={user} />}
                    </div>
                  )}
                </main>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
