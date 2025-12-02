"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface AIInsightProps {
    movieTitle: string
    movieOverview: string
    className?: string
}

export function AIInsight({ movieTitle, movieOverview, className }: AIInsightProps) {
    const [insight, setInsight] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const generateInsight = async () => {
        setLoading(true)
        setError(false)
        try {
            const res = await fetch("/api/ai/insight", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieTitle, movieOverview }),
            })

            if (!res.ok) throw new Error("Failed to generate insight")

            const data = await res.json()
            setInsight(data.insight)
        } catch (err) {
            console.error(err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className={`border-primary/20 bg-primary/5 ${className}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <Sparkles className="h-5 w-5" />
                    AI Companion Insight
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    {insight ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose prose-invert prose-sm max-w-none"
                        >
                            <p className="italic text-muted-foreground leading-relaxed">
                                "{insight}"
                            </p>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-start gap-4">
                            <p className="text-sm text-muted-foreground">
                                Want to know why this movie matches your vibe? Ask your AI companion.
                            </p>
                            <Button
                                onClick={generateInsight}
                                disabled={loading}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Get Insight
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
                {error && (
                    <p className="text-xs text-red-400 mt-2">
                        Failed to connect to AI. Please try again.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
