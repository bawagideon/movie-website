"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { wishlistService, type WishlistItem } from "@/lib/wishlist"
import { getImageUrl } from "@/lib/tmdb"

interface WishlistPageProps {
  user: any
}

export default function WishlistPage({ user }: WishlistPageProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    setLoading(true)
    const result = await wishlistService.getWishlist()

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setWishlistItems(result.items)
    }

    setLoading(false)
  }

  const handleRemoveFromWishlist = async (movieId: number, movieTitle: string) => {
    const result = await wishlistService.removeFromWishlist(movieId)

    if (result.success) {
      setWishlistItems((prev) => prev.filter((item) => item.movie_id !== movieId))
      toast({
        title: "Removed from wishlist",
        description: `${movieTitle} has been removed from your wishlist`,
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to remove from wishlist",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">My Wishlist</h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-[2/3] mb-2" />
                <div className="h-4 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Badge variant="secondary" className="ml-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? "movie" : "movies"}
          </Badge>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Start adding movies you want to watch to your wishlist</p>
            <Button onClick={() => (window.location.href = "/")}>Browse Movies</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {wishlistItems.map((item) => (
              <WishlistMovieCard
                key={item.id}
                item={item}
                onRemove={() => handleRemoveFromWishlist(item.movie_id, item.movie_title)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WishlistMovieCard({ item, onRemove }: { item: WishlistItem; onRemove: () => void }) {
  const posterUrl = getImageUrl(item.movie_poster, "w500")
  const releaseYear = new Date(item.movie_release_date).getFullYear()
  const addedDate = new Date(item.created_at).toLocaleDateString()

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={posterUrl || "/placeholder.svg"}
            alt={item.movie_title}
            className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button size="sm" variant="secondary" className="mb-2">
              View Details
            </Button>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/70 text-white border-0">
              <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
              {item.movie_rating.toFixed(1)}
            </Badge>
          </div>

          {/* Remove Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-600/80 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.movie_title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{releaseYear}</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{addedDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
