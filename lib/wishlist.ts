import { createClient } from "@/lib/supabase/client"
import type { Movie } from "@/lib/tmdb"

export interface WishlistItem {
  id: string
  user_id: string
  movie_id: number
  movie_title: string
  movie_poster: string | null
  movie_overview: string | null
  movie_release_date: string
  movie_rating: number
  created_at: string
}

export class WishlistService {
  private supabase = createClient()

  async addToWishlist(movie: Movie): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Please sign in to add movies to your wishlist" }
      }

      const { error } = await this.supabase.from("wishlists").insert({
        user_id: user.id,
        movie_id: movie.id,
        movie_title: movie.title,
        movie_poster: movie.poster_path,
        movie_overview: movie.overview,
        movie_release_date: movie.release_date,
        movie_rating: movie.vote_average,
      })

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          return { success: false, error: "Movie is already in your wishlist" }
        }
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to add movie to wishlist" }
    }
  }

  async removeFromWishlist(movieId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Please sign in to manage your wishlist" }
      }

      const { error } = await this.supabase.from("wishlists").delete().eq("user_id", user.id).eq("movie_id", movieId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to remove movie from wishlist" }
    }
  }

  async getWishlist(): Promise<{ items: WishlistItem[]; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        return { items: [], error: "Please sign in to view your wishlist" }
      }

      const { data, error } = await this.supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        return { items: [], error: error.message }
      }

      return { items: data || [] }
    } catch (error) {
      return { items: [], error: "Failed to load wishlist" }
    }
  }

  async isInWishlist(movieId: number): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) return false

      const { data, error } = await this.supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("movie_id", movieId)
        .single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }

  async getWishlistMovieIds(): Promise<number[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await this.supabase.from("wishlists").select("movie_id").eq("user_id", user.id)

      if (error) return []

      return data.map((item) => item.movie_id)
    } catch (error) {
      return []
    }
  }
}

export const wishlistService = new WishlistService()
