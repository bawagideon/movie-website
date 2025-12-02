"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Film, Heart, Zap } from "lucide-react"

interface StatsDashboardProps {
    userId: string
}

export function StatsDashboard({ userId }: StatsDashboardProps) {
    // In a real app, we'd fetch these stats from the DB
    // For now, we'll mock them or calculate from client-side if possible
    // But since we are server-side fetching in the parent, we could pass data down.
    // For this demo, I'll use static mock data to demonstrate the UI.

    const stats = {
        totalWatchedTime: 124, // hours
        moviesWatched: 42,
        favoriteGenre: "Sci-Fi",
        moodMatchRate: 88,
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalWatchedTime}h</div>
                    <p className="text-xs text-muted-foreground">+2.5h from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Movies Watched</CardTitle>
                    <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.moviesWatched}</div>
                    <p className="text-xs text-muted-foreground">+4 new movies</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Genre</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.favoriteGenre}</div>
                    <p className="text-xs text-muted-foreground">35% of your history</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mood Match Rate</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.moodMatchRate}%</div>
                    <Progress value={stats.moodMatchRate} className="mt-2" />
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Genre Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span>Sci-Fi</span>
                                <span>35%</span>
                            </div>
                            <Progress value={35} className="h-2" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span>Action</span>
                                <span>25%</span>
                            </div>
                            <Progress value={25} className="h-2" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span>Drama</span>
                                <span>20%</span>
                            </div>
                            <Progress value={20} className="h-2" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span>Comedy</span>
                                <span>15%</span>
                            </div>
                            <Progress value={15} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
