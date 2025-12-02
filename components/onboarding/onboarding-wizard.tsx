"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
]

export function OnboardingWizard({ userId }: { userId: string }) {
    const [step, setStep] = useState(1)
    const [name, setName] = useState("")
    const [selectedGenres, setSelectedGenres] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleGenreToggle = (id: number) => {
        if (selectedGenres.includes(id)) {
            setSelectedGenres(selectedGenres.filter(g => g !== id))
        } else {
            if (selectedGenres.length < 3) {
                setSelectedGenres([...selectedGenres, id])
            }
        }
    }

    const handleComplete = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    username: name,
                    preferences: { favorite_genres: selectedGenres },
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId)

            if (error) throw error

            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Error updating profile:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-3xl text-center text-white">Welcome to Cinema80</CardTitle>
                                <CardDescription className="text-center text-lg text-gray-400">Let's get to know you better. What should we call you?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="text-lg py-6 bg-white/5 border-white/20 text-center text-white placeholder:text-gray-500 focus:border-primary"
                                />
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!name.trim()}
                                    className="w-full sm:w-auto px-8 py-6 text-lg"
                                >
                                    Next Step
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="bg-black/50 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-3xl text-center text-white">Your Taste</CardTitle>
                                <CardDescription className="text-center text-lg text-gray-400">Select 3 genres you love.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {GENRES.map((genre) => (
                                        <button
                                            key={genre.id}
                                            onClick={() => handleGenreToggle(genre.id)}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all duration-200 text-sm font-medium",
                                                selectedGenres.includes(genre.id)
                                                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {genre.name}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="justify-center gap-4">
                                <Button variant="ghost" onClick={() => setStep(1)} className="text-white hover:text-white/80">Back</Button>
                                <Button
                                    onClick={handleComplete}
                                    disabled={selectedGenres.length !== 3 || loading}
                                    className="w-full sm:w-auto px-8 py-6 text-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
