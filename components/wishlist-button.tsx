"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { wishlistService } from "@/lib/wishlist"
import type { Movie } from "@/lib/tmdb"
import type { AuthUser } from "@/lib/types"

interface WishlistButtonProps {
  movie: Movie
  user?: AuthUser | null
  size?: "sm" | "default" | "lg"
  variant?: "ghost" | "outline" | "default"
}

export function WishlistButton({ movie, user, size = "sm", variant = "ghost" }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      checkWishlistStatus()
    }
  }, [movie.id, user])

  const checkWishlistStatus = async () => {
    const inWishlist = await wishlistService.isInWishlist(movie.id)
    setIsInWishlist(inWishlist)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add movies to your wishlist",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (isInWishlist) {
        const result = await wishlistService.removeFromWishlist(movie.id)
        if (result.success) {
          setIsInWishlist(false)
          toast({
            title: "Removed from wishlist",
            description: `${movie.title} has been removed from your wishlist`,
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to remove from wishlist",
            variant: "destructive",
          })
        }
      } else {
        const result = await wishlistService.addToWishlist(movie)
        if (result.success) {
          setIsInWishlist(true)
          toast({
            title: "Added to wishlist",
            description: `${movie.title} has been added to your wishlist`,
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add to wishlist",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleWishlistToggle}
      disabled={loading}
      aria-label={
        isInWishlist 
          ? `Remove ${movie.title} from wishlist` 
          : `Add ${movie.title} to wishlist`
      }
      aria-pressed={isInWishlist}
      aria-busy={loading}
      className={`h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isInWishlist ? "text-red-500" : ""
      }`}
    >
      <Heart 
        className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`}
        aria-hidden="true"
      />
    </Button>
  )
}
