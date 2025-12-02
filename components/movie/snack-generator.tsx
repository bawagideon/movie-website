"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pizza, Loader2, ExternalLink } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { generateAIInsight } from "@/lib/ai/engine" // I might need a new function for snacks

interface SnackGeneratorProps {
    movieTitle: string
    movieGenre: string
}

export function SnackGenerator({ movieTitle, movieGenre }: SnackGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [snack, setSnack] = useState<{ food: string; reason: string } | null>(null)

    const generateSnack = async () => {
        setLoading(true)
        try {
            // We'll use a new API route for this to keep it secure and server-side
            const response = await fetch("/api/ai/snack-pairing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieTitle, movieGenre }),
            })
            const data = await response.json()
            setSnack(data)
        } catch (error) {
            console.error("Failed to generate snack:", error)
        } finally {
            setLoading(false)
        }
    }

    const orderLink = snack
        ? `https://www.ubereats.com/search?q=${encodeURIComponent(snack.food)}`
        : "#"

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Pizza className="h-4 w-4" />
                    Snack & Watch
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Perfect Pairing</DialogTitle>
                    <DialogDescription>
                        Let AI suggest the perfect food for {movieTitle}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    {!snack && !loading && (
                        <Button onClick={generateSnack} size="lg" className="w-full">
                            <Pizza className="mr-2 h-5 w-5" />
                            Generate Pairing
                        </Button>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Consulting the culinary algorithm...</p>
                        </div>
                    )}

                    {snack && (
                        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="text-4xl">🍕</div>
                            <h3 className="text-xl font-bold text-primary">{snack.food}</h3>
                            <p className="text-sm text-muted-foreground italic">
                                "{snack.reason}"
                            </p>
                            <Button asChild className="w-full" size="lg">
                                <a href={orderLink} target="_blank" rel="noopener noreferrer">
                                    Order on UberEats <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
