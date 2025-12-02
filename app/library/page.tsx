import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MoodVault } from "@/components/library/mood-vault"
import { SmartWatchlist } from "@/components/library/smart-watchlist"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Heart } from "lucide-react"

export default async function LibraryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">My Library</h1>
                    <p className="text-muted-foreground">
                        Your personal collection of moods and movies.
                    </p>
                </div>

                <Tabs defaultValue="watchlist" className="space-y-8">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="watchlist" className="gap-2">
                            <Heart className="h-4 w-4" />
                            Watchlist
                        </TabsTrigger>
                        <TabsTrigger value="moods" className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            Mood Vault
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="watchlist" className="space-y-6">
                        <SmartWatchlist />
                    </TabsContent>

                    <TabsContent value="moods" className="space-y-6">
                        <MoodVault />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
