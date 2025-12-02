"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Assuming I have this or similar

interface SettingsPanelProps {
    userId: string
}

export function SettingsPanel({ userId }: SettingsPanelProps) {
    const [settings, setSettings] = useState({
        enable_food_rec: true,
        enable_calendar_sync: true,
        adult_content_filter: false,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from("user_settings")
                .select("*")
                .eq("user_id", userId)
                .single()

            if (error && error.code !== "PGRST116") { // PGRST116 is "Row not found"
                console.error("Error fetching settings:", error)
            } else if (data) {
                setSettings({
                    enable_food_rec: data.enable_food_rec,
                    enable_calendar_sync: data.enable_calendar_sync,
                    adult_content_filter: data.adult_content_filter,
                })
            } else {
                // No settings found, create default
                const { error: insertError } = await supabase
                    .from("user_settings")
                    .insert({ user_id: userId })

                if (insertError) {
                    console.error("Error creating settings:", JSON.stringify(insertError, null, 2))
                }
            }
            setLoading(false)
        }

        fetchSettings()
    }, [userId, supabase])

    const handleSave = async () => {
        setSaving(true)
        const { error } = await supabase
            .from("user_settings")
            .upsert({
                user_id: userId,
                ...settings,
                updated_at: new Date().toISOString(),
            })

        if (error) {
            console.error("Error saving settings:", error)
            // Show error toast
        } else {
            // Show success toast
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>
                    Customize your Cinema80 experience.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-1">
                        <Label htmlFor="food-rec">Food Recommendations</Label>
                        <p className="text-sm text-muted-foreground">
                            Get AI-powered snack and meal pairings for your movies.
                        </p>
                    </div>
                    <Switch
                        id="food-rec"
                        checked={settings.enable_food_rec}
                        onCheckedChange={(checked) => setSettings({ ...settings, enable_food_rec: checked })}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-1">
                        <Label htmlFor="calendar-sync">Calendar Sync</Label>
                        <p className="text-sm text-muted-foreground">
                            Allow adding binge plans to your calendar.
                        </p>
                    </div>
                    <Switch
                        id="calendar-sync"
                        checked={settings.enable_calendar_sync}
                        onCheckedChange={(checked) => setSettings({ ...settings, enable_calendar_sync: checked })}
                    />
                </div>

                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-1">
                        <Label htmlFor="adult-filter">Adult Content Filter</Label>
                        <p className="text-sm text-muted-foreground">
                            Hide adult content from search results and recommendations.
                        </p>
                    </div>
                    <Switch
                        id="adult-filter"
                        checked={settings.adult_content_filter}
                        onCheckedChange={(checked) => setSettings({ ...settings, adult_content_filter: checked })}
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
