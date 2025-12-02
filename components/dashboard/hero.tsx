"use client"

import { useState } from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DashboardHeroProps {
    onSearch: (query: string) => void
    isSearching: boolean
}

export function DashboardHero({ onSearch, isSearching }: DashboardHeroProps) {
    const [query, setQuery] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch(query)
        }
    }

    return (
        <section className="relative min-h-[50vh] flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-3xl text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        What's the <span className="text-primary">vibe</span> tonight?
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Describe your mood, a specific feeling, or exactly what you want to watch.
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="relative group"
                >
                    <div className="relative flex items-center">
                        <Sparkles className="absolute left-4 h-6 w-6 text-primary animate-pulse" />
                        <Input
                            type="text"
                            placeholder="e.g., 'Cyberpunk noir with a hopeful ending' or 'Cozy sunday afternoon'"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-32 text-lg bg-white/5 border-white/10 rounded-full focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-2xl backdrop-blur-xl"
                        />
                        <Button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="absolute right-2 top-2 bottom-2 rounded-full px-6"
                        >
                            {isSearching ? (
                                <span className="animate-pulse">Thinking...</span>
                            ) : (
                                <>
                                    Generate <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.form>

                {/* Quick Tags */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-2"
                >
                    {["Mind-bending Sci-Fi", "Feel-good 90s", "Dark Academia", "Slow Burn Horror"].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setQuery(tag)}
                            className="px-4 py-1.5 rounded-full text-sm bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-muted-foreground hover:text-white"
                        >
                            {tag}
                        </button>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
