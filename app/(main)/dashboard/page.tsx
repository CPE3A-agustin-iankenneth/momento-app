import { createClient } from "@/utils/supabase/server"
import getEntryDates from "@/utils/getEntryDates"
import { getAllEntries } from "@/utils/getAllEntries"
import Heatmap from "@/components/heatmap"
import DailyEntryWrapper from "@/components/daily-entry-wrapper"
import Image from "next/image"
import { Heart, TrendingUp, Camera, Settings, Tag } from "lucide-react"
import Link from "next/link"

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    const { entryDatesWeighted, entryDatesArray } = await getEntryDates()
    const allEntries = await getAllEntries()
    const faveEntries = await getAllEntries({ isFavorite: true })

    // Fetch total tags count
    const { count: totalTags } = await supabase
        .from('tags')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    // Calculate statistics
    const totalEntries = allEntries.length
    const totalFavorites = faveEntries.length
    
    // Calculate current streak
    const calculateStreak = () => {
        if (entryDatesArray.length === 0) return 0
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const uniqueDates = [...new Set(entryDatesArray.map(d => {
            const date = new Date(d)
            date.setHours(0, 0, 0, 0)
            return date.getTime()
        }))].sort((a, b) => b - a)
        
        let streak = 0
        let currentDate = today.getTime()
        
        // Check if there's an entry today or yesterday to start counting
        const hasToday = uniqueDates.includes(currentDate)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const hasYesterday = uniqueDates.includes(yesterday.getTime())
        
        if (!hasToday && !hasYesterday) return 0
        
        if (!hasToday) {
            currentDate = yesterday.getTime()
        }
        
        for (const dateTime of uniqueDates) {
            if (dateTime === currentDate) {
                streak++
                currentDate -= 24 * 60 * 60 * 1000 // Go back one day
            } else if (dateTime < currentDate) {
                break
            }
        }
        
        return streak
    }
    
    const currentStreak = calculateStreak()

    const displayName = profile?.first_name 
        ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
        : user?.email?.split('@')[0] || 'User'

    return (
        <div className="flex flex-col h-full w-full overflow-y-auto px-4 md:px-8 pb-8">
            {/* Profile Section */}
            <div className="flex items-center justify-between py-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Profile"
                                width={64}
                                height={64}
                                className="rounded-full object-cover w-16 h-16"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-2xl font-semibold text-primary">
                                    {displayName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">{displayName}</h1>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <Link 
                    href="/profile" 
                    className="p-2 rounded-full hover:bg-muted active:scale-90 active:opacity-70 transition-all duration-100"
                    title="Edit Profile"
                >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                </Link>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Moments</span>
                    </div>
                    <p className="text-2xl font-bold">{totalEntries}</p>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Favorites</span>
                    </div>
                    <p className="text-2xl font-bold">{totalFavorites}</p>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Streak</span>
                    </div>
                    <p className="text-2xl font-bold">{currentStreak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Tags</span>
                    </div>
                    <p className="text-2xl font-bold">{totalTags || 0}</p>
                </div>
            </div>

            {/* Activity Heatmap */}
            <div className="py-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Activity</h2>
                <div className="w-full border-border border rounded-lg px-4 py-3">
                    <Heatmap weightedDates={entryDatesWeighted} colors={["#f7f6f3", "#d4c89a4d", "#d4c89a99", "#d4c89a", "#b85c00"]} />
                </div>
            </div>

            {/* Favorite Entries */}
            <div className="py-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Favorite Moments</h2>
                {faveEntries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No favorite moments yet.</p>
                        <p className="text-sm">Mark your special memories as favorites to see them here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {faveEntries.slice(0, 5).map((entry) => (
                            <DailyEntryWrapper key={entry.id} entry={entry} />
                        ))}
                        {faveEntries.length > 5 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                                +{faveEntries.length - 5} more favorites
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}