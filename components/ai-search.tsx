"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2 } from "lucide-react"
import { MovieGrid } from "@/components/movie-grid"
import { MovieGridSkeleton } from "@/components/loading-skeletons"
import type { Movie, Language } from "@/lib/tmdb"
import type { AuthUser } from "@/lib/types"

interface AISearchProps {
  user: AuthUser | null
  languages: Language[]
}

interface AISearchResult {
  suggestions: Movie[]
  explanation: string
  searchParams: {
    searchTerms: string[]
    genres: number[]
    yearRange?: { min: number; max: number }
    minRating?: number
  }
}

export default function AISearch({ user, languages }: AISearchProps) {
  const [mood, setMood] = useState("")
  const [description, setDescription] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AISearchResult | null>(null)

  const popularLanguages = [
    { iso_639_1: "en", english_name: "English" },
    { iso_639_1: "hi", english_name: "Hindi" },
    { iso_639_1: "ta", english_name: "Tamil" },
    { iso_639_1: "te", english_name: "Telugu" },
    { iso_639_1: "ml", english_name: "Malayalam" },
    { iso_639_1: "kn", english_name: "Kannada" },
    { iso_639_1: "bn", english_name: "Bengali" },
    { iso_639_1: "mr", english_name: "Marathi" },
    { iso_639_1: "gu", english_name: "Gujarati" },
    { iso_639_1: "pa", english_name: "Punjabi" },
    { iso_639_1: "or", english_name: "Odia" },
    { iso_639_1: "as", english_name: "Assamese" },
    { iso_639_1: "ur", english_name: "Urdu" },
    { iso_639_1: "es", english_name: "Spanish" },
    { iso_639_1: "fr", english_name: "French" },
    { iso_639_1: "de", english_name: "German" },
    { iso_639_1: "it", english_name: "Italian" },
    { iso_639_1: "ja", english_name: "Japanese" },
    { iso_639_1: "ko", english_name: "Korean" },
    { iso_639_1: "zh", english_name: "Chinese" },
    { iso_639_1: "ar", english_name: "Arabic" },
    { iso_639_1: "ru", english_name: "Russian" },
    { iso_639_1: "pt", english_name: "Portuguese" },
    { iso_639_1: "th", english_name: "Thai" },
    { iso_639_1: "vi", english_name: "Vietnamese" },
  ]

  const moodSuggestions = [
    "Happy and uplifting",
    "Romantic and dreamy",
    "Thrilling and suspenseful",
    "Dark and mysterious",
    "Funny and lighthearted",
    "Epic and adventurous",
    "Emotional and touching",
    "Scary and intense",
    "Thought-provoking",
    "Nostalgic",
  ]

  const handleAISearch = async () => {
    if (!mood.trim() && !description.trim()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood: mood.trim(),
          description: description.trim(),
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI recommendations")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("AI search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMoodClick = (selectedMood: string) => {
    setMood(selectedMood)
  }

  const clearResults = () => {
    setResults(null)
    setMood("")
    setDescription("")
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-700/50 bg-black/40 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <Sparkles className="h-5 w-5 text-white" />
            AI Movie Recommendations
          </CardTitle>
          <CardDescription className="text-gray-300 font-medium leading-relaxed">
            Describe your mood or what you're looking for, and let AI suggest the perfect movies for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white tracking-wide">Language Preference</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="bg-black/60 border-gray-600 text-white font-medium">
                <SelectValue placeholder="Select language" className="font-medium" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="font-medium">
                  All Languages
                </SelectItem>
                {popularLanguages.map((lang) => (
                  <SelectItem key={lang.iso_639_1} value={`${lang.iso_639_1}-US`} className="font-medium">
                    {lang.english_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mood Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white tracking-wide">Your Mood</label>
            <Input
              placeholder="e.g., Happy, Romantic, Thrilling..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="bg-black/60 border-gray-600 text-white placeholder:text-gray-400 font-medium"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {moodSuggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant={mood === suggestion ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 font-medium text-sm ${
                    mood === suggestion
                      ? "bg-white text-black hover:bg-gray-100"
                      : "border-gray-600 text-gray-300 hover:bg-white/10 hover:border-gray-500"
                  }`}
                  onClick={() => handleMoodClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white tracking-wide">Describe What You Want</label>
            <Textarea
              placeholder="e.g., I want something like Inception but funnier, or a movie about friendship with great cinematography..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-black/60 border-gray-600 text-white placeholder:text-gray-400 font-medium leading-relaxed resize-none"
            />
          </div>

          {/* Search Button */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleAISearch}
              disabled={loading || (!mood.trim() && !description.trim())}
              className="flex-1 bg-white text-black hover:bg-gray-100 font-semibold py-3 transition-all duration-200"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="font-semibold">Finding Movies...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Get AI Recommendations</span>
                </>
              )}
            </Button>
            {results && (
              <Button
                variant="outline"
                onClick={clearResults}
                className="border-gray-600 text-white hover:bg-white/10 font-semibold bg-transparent"
                size="lg"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results ? (
        <div className="space-y-6">
          <Card className="border-gray-700/50 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">AI Recommendations</CardTitle>
              <CardDescription className="text-gray-300 font-medium leading-relaxed">
                {results.explanation}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-400 font-medium">
                  Based on: {results.searchParams.searchTerms?.join(", ")}
                </div>
                {results.searchParams.minRating && (
                  <div className="text-sm text-gray-400 font-medium">
                    Minimum rating: {results.searchParams.minRating}/10
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Recommended Movies ({results.suggestions.length})</h3>
            <MovieGrid movies={results.suggestions} loading={false} user={user} />
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          <Card className="border-gray-700/50 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Finding Perfect Movies...</CardTitle>
              <CardDescription className="text-gray-300 font-medium">
                Our AI is analyzing your preferences
              </CardDescription>
            </CardHeader>
          </Card>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Loading recommendations...</h3>
            <MovieGridSkeleton count={12} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
