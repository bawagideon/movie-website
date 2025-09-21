"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Genre } from "@/lib/tmdb"

interface GenreFilterProps {
  genres: Genre[]
  selectedGenre: number | null
  onGenreChange: (genreId: number | null) => void
}

export function GenreFilter({ genres, selectedGenre, onGenreChange }: GenreFilterProps) {
  const selectedGenreName = genres.find((g) => g.id === selectedGenre)?.name

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          {selectedGenreName ? (
            <Badge variant="secondary" className="ml-1">
              {selectedGenreName}
            </Badge>
          ) : (
            "All Genres"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onGenreChange(null)}>
          <span className={selectedGenre === null ? "font-medium" : ""}>All Genres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {genres.map((genre) => (
          <DropdownMenuItem key={genre.id} onClick={() => onGenreChange(genre.id)}>
            <span className={selectedGenre === genre.id ? "font-medium" : ""}>{genre.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
