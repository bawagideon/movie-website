"use client"

import { useEffect, useState } from "react"
import { wishlistService, WishlistItem } from "@/lib/wishlist"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash2, Play } from "lucide-react"
import { getImageUrl } from "@/lib/tmdb"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function SmartWatchlist() {
    const [items, setItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchWatchlist()
    }, [])

    const fetchWatchlist = async () => {
        const { items, error } = await wishlistService.getWishlist()
        if (error) {
            console.error(error)
        } else {
            setItems(items)
        }
        setLoading(false)
    }

    const handleRemove = async (movieId: number) => {
        const result = await wishlistService.removeFromWishlist(movieId)
        if (result.success) {
            setItems(items.filter(item => item.movie_id !== movieId))
            toast({
                title: "Removed from watchlist",
                description: "Movie removed successfully.",
            })
        } else {
            toast({
                title: "Error",
                description: "Failed to remove movie.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return <div className="text-center py-10">Loading your watchlist...</div>
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-muted/10">
                <Star className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Your watchlist is empty</h3>
                <p className="text-muted-foreground">
                    Start adding movies you want to watch!
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
                <Card key={item.id} className="group relative overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-[2/3] relative">
                        <img
                            src={getImageUrl(item.movie_poster, "w500") || "/placeholder.svg"}
                            alt={item.movie_title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                            <Link href={`/movie/${item.movie_id}`} className="w-full">
                                <Button variant="secondary" className="w-full gap-2">
                                    <Play className="h-4 w-4" />
                                    View Details
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="w-full gap-2"
                                onClick={() => handleRemove(item.movie_id)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <h3 className="font-semibold truncate" title={item.movie_title}>
                            {item.movie_title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            {item.movie_rating.toFixed(1)}
                            <span>•</span>
                            {new Date(item.movie_release_date).getFullYear()}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
