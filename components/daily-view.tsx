"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CalendarStrip from "./callendar-strip"
import EmptyView from "./empty-view"
import DailyEntryWrapper from "./daily-entry-wrapper"
import SingleEntryView from "./single-entry-view"
import { Entry } from "@/lib/types"
import formatDate from "@/utils/formatDate"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useImageUpload } from "@/hooks/use-image-upload"

export default function DailyView({entryDates}: {entryDates: Date[]}) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [entries, setEntries] = useState<Entry[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleCameraUpload = (url: string, filePath: string) => {
        router.push(`/create?signedUrl=${encodeURIComponent(url)}&filePath=${encodeURIComponent(filePath)}`)
    }

    const { triggerUpload, uploading } = useImageUpload(handleCameraUpload)


    useEffect(() => {
        setLoading(true)
        setError(null)
        const fetchEntries = async () => {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            await fetch (`/api/entries?date=${formatDate(selectedDate)}&tz=${encodeURIComponent(tz)}`)
            .then(res => res.json())
            .then(data => {
                setEntries(data.entries || [])
                setLoading(false)
            })
            .catch(() => {
                setError("Failed to fetch entries.")
                setLoading(false)
            })
        }
        fetchEntries()
    }, [selectedDate])


    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <CalendarStrip onDateSelect={setSelectedDate} entryDates={entryDates} />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex flex-1 h-full flex-col items-center justify-center mt-4">
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-destructive">{error}</p>}
                    {!loading && !error && (entries.length === 0 ? 
                        <div>
                            <EmptyView />
                        </div> 
                    : entries.length === 1 ? (
                        // Single entry: display full view like entry page
                        <div className="w-full h-full md:px-8 lg:px-16 px-4">
                            <SingleEntryView entry={entries[0]} />
                            {/* Desktop-only add new entry button */}
                            <div className="hidden md:flex justify-center mt-6">
                                <Button
                                    onClick={triggerUpload}
                                    disabled={uploading}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    {uploading ? "Uploading..." : "Add Another Entry"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Multiple entries: display as cards
                        <div className="w-full h-full md:px-8 lg:px-16 px-8 items-start">
                            {entries.map((entry) => (
                                <DailyEntryWrapper key={entry.id} entry={entry} />
                            ))}
                            {/* Desktop-only add new entry button */}
                            <div className="hidden md:flex justify-center mt-6">
                                <Button
                                    onClick={triggerUpload}
                                    disabled={uploading}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    {uploading ? "Uploading..." : "Add New Entry"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    )
}