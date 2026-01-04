"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Entry } from "@/lib/types"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import DailyEntryWrapper from "./daily-entry-wrapper"

export default function ListView() {

    const searchParams = useSearchParams()
    const dateParam = searchParams.get("date")
    const [entries, setEntries] = useState<Entry[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    useEffect(() => {
        setLoading(true)
        setError(null)
        const fetchEntries = async () => {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            await fetch (`/api/entries?date=${dateParam || `${new Date().toISOString().slice(0, 10)}`}&tz=${encodeURIComponent(tz)}`)
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
    }, [dateParam])

    return (
        <div className="flex flex-col w-full px-8 lg:px-0 lg:w-lg sm:h-full lg:h-auto overflow-hidden">
            <h1 className="text-xl mb-4 mt-2">
                {dateParam ? formatDate(dateParam) : formatDate(new Date().toISOString())}
            </h1>
            <div className="flex-1 min-h-0">
                {loading && <p>Loading...</p>}
                {error && <p className="text-destructive">{error}</p>}
                {!loading && !error && (entries.length === 0) ? (
                    <div>
                        <p>No entries yet for this day</p>
                    </div> 
                )
                : (
                    <ScrollArea className={`h-full w-full ${loading ? 'opacity-0' : ''}`}>
                        {entries.map((entry) => (
                            <DailyEntryWrapper key={entry.id} entry={entry} />
                        ))}
                        <ScrollBar />
                    </ScrollArea> 
                )}
            </div>
        </div>
    )
}