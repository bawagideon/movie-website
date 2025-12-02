import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsDashboard } from "@/components/profile/stats-dashboard"
import { HistoryFeed } from "@/components/profile/history-feed"
import { SettingsPanel } from "@/components/profile/settings-panel"
import { User } from "lucide-react"

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    // Fetch user profile data
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    return (
        <div className="min-h-screen bg-background text-foreground pt-20 pb-10 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{profile?.username || "User Profile"}</h1>
                        <p className="text-muted-foreground">My Command Center</p>
                    </div>
                </div>

                <Tabs defaultValue="stats" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="stats">Stats & Habits</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats" className="space-y-4">
                        <StatsDashboard userId={user.id} />
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <HistoryFeed userId={user.id} />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                        <SettingsPanel userId={user.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
