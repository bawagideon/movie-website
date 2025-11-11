"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Play, Sparkles, Film, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MovieGrid } from "@/components/movie-grid"
import { MovieHero } from "@/components/movie-hero"
import { GenreFilter } from "@/components/genre-filter"
import AuthButton from "@/components/auth-button"
import AISearch from "@/components/ai-search"
import { MovieGridSkeleton } from "@/components/loading-skeletons"
import type { Movie, Genre, Language } from "@/lib/tmdb"
import type { AuthUser } from "@/lib/types"

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
  const [genres, setGenres] = useState<Genre[]>([])
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "release_date">("popularity")
  const [currentPage, setCurrentPage] = useState(1)
  const [languages, setLanguages] = useState<Language[]>([])
  const [showAISearch, setShowAISearch] = useState(false)
  const [backgroundMovies, setBackgroundMovies] = useState<Movie[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      loadMoviesByCategory(activeCategory, currentPage)
    }
  }, [activeCategory, selectedGenre, sortBy, currentPage])

  const loadInitialData = async () => {
    try {
      const [popularMovies, trendingMovies, genresData, languagesData, topRatedMovies, nowPlayingMovies] =
        await Promise.all([
          fetch("/api/movies/popular").then((res) => res.json()),
          fetch("/api/movies/trending").then((res) => res.json()),
          fetch("/api/genres").then((res) => res.json()),
          fetch("/api/languages").then((res) => res.json()),
          fetch("/api/movies/top-rated").then((res) => res.json()),
          fetch("/api/movies/now-playing").then((res) => res.json()),
        ])

      setMovies(popularMovies.results)
      setFeaturedMovie(trendingMovies.results[0])
      setGenres(genresData.genres)
      setLanguages(languagesData.languages)

      const allBackgroundMovies = [
        ...popularMovies.results.slice(0, 30),
        ...topRatedMovies.results.slice(0, 30),
        ...nowPlayingMovies.results.slice(0, 30),
        ...trendingMovies.results.slice(0, 6),
      ]
      setBackgroundMovies(allBackgroundMovies)
    } catch (error) {
      console.error("Failed to load movies:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoviesByCategory = async (category: MovieCategory, page = 1) => {
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

      let filteredMovies = response.results

      if (selectedGenre) {
        filteredMovies = filteredMovies.filter((movie: Movie) => movie.genre_ids.includes(selectedGenre))
      }

      filteredMovies = sortMovies(filteredMovies, sortBy)

      setMovies(page === 1 ? filteredMovies : [...movies, ...filteredMovies])
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const results = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`).then((res) =>
        res.json(),
      )
      let filteredMovies = results.results

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

  return (
  <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">MovieVault</h1>
            </div>

            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex items-center space-x-2 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" size="sm">
                  Search
                </Button>
              </form>

              <Button
                variant={showAISearch ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAISearch(!showAISearch)}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Search
              </Button>
            </div>

            <AuthButton user={user} />
          </div>
        </div>
      </header>

  <section className="relative min-h-screen flex flex-col overflow-hidden max-w-full">
        <div className="absolute inset-0 z-0">
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1 h-full opacity-40">
            {Array.from({ length: 96 }).map((_, i) => {
              const movie = backgroundMovies[i % backgroundMovies.length]
              return (
                <div
                  key={i}
                  className="aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-sm overflow-hidden transform hover:scale-105 transition-transform duration-500"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  {movie?.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover animate-fade-in"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "0.8s",
                        animationFillMode: "both",
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* AI Discovery Section */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center space-y-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent tracking-tight">
                    AI Movie Discovery
                  </h1>
                  <Film className="h-8 w-8 text-gray-300 animate-pulse" />
                </div>

                <div className="space-y-4">
                  <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-medium leading-relaxed">
                    Describe your mood, get perfect movie recommendations
                  </p>
                  <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-4xl mx-auto">
                    "I want something romantic but not too cheesy" • "A thriller that won't give me nightmares"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8 md:gap-12">
                <div className="flex items-center gap-3 text-base font-medium text-gray-300">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-3 text-base font-medium text-gray-300">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span>Smart Recommendations</span>
                </div>
                <div className="flex items-center gap-3 text-base font-medium text-gray-300">
                  <Film className="h-5 w-5 text-blue-400" />
                  <span>Multi-Language</span>
                </div>
              </div>
            </div>

            {/* Integrated AI Search Form */}
            <div className="max-w-4xl mx-auto">
              <div className="relative group">
                {/* Soft glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-gray-400/20 to-white/10 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

                {/* Main form container with glass-morphism */}
                <div className="relative bg-gradient-to-br from-black/30 via-gray-900/40 to-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all duration-500">
                  {/* Inner gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-3xl pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10">
                    <AISearch user={user} languages={languages} />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto">
                Try: "Bollywood romance in monsoon" • "Korean thriller with plot twists" • "Feel-good animated movies"
              </p>
            </div>
          </div>
        </div>

        {/* Seamless transition to featured movie */}
        {featuredMovie && !searchQuery && !showAISearch && (
          <div className="relative z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="relative">
              <MovieHero movie={featuredMovie} />
            </div>
          </div>
        )}
      </section>

      {/* Main Content */}
  <main className="container mx-auto px-2 sm:px-4 py-8 max-w-full">
        {showAISearch ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Use the AI search above to discover movies based on your mood and preferences.
            </p>
          </div>
        ) : !searchQuery ? (
          <Tabs value={activeCategory} onValueChange={(value) => handleCategoryChange(value as MovieCategory)}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:grid-cols-4">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
                <TabsTrigger value="now_playing">Now Playing</TabsTrigger>
                <TabsTrigger value="upcoming">Coming Soon</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4">
                <GenreFilter genres={genres} selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />

                <Select value={sortBy} onValueChange={(value) => handleSortChange(value as typeof sortBy)}>
                  <SelectTrigger className="w-40">
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

            <TabsContent value={activeCategory} className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{getCategoryTitle(activeCategory)}</h2>
                <p className="text-muted-foreground">
                  {selectedGenre
                    ? `${getCategoryTitle(activeCategory)} in ${genres.find((g) => g.id === selectedGenre)?.name}`
                    : `Discover the best ${getCategoryTitle(activeCategory).toLowerCase()}`}
                </p>
              </div>

              {loading ? <MovieGridSkeleton /> : <MovieGrid movies={movies} loading={loading} user={user} />}

              {movies.length > 0 && !loading && (
                <div className="flex justify-center mt-8">
                  <Button onClick={loadMore} variant="outline" size="lg">
                    Load More Movies
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Search Results for "{searchQuery}"</h2>
                <p className="text-muted-foreground">
                  {movies.length} {movies.length === 1 ? "movie" : "movies"} found
                </p>
              </div>

              <div className="flex items-center gap-4">
                <GenreFilter genres={genres} selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />

                <Select value={sortBy} onValueChange={(value) => handleSortChange(value as typeof sortBy)}>
                  <SelectTrigger className="w-40">
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
    </div>
  )
}
