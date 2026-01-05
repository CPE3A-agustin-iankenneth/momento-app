"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import CalendarStrip from "./callendar-strip"
import EmptyView from "./empty-view"
import DailyEntryWrapper from "./daily-entry-wrapper"
import SingleEntryView from "./single-entry-view"
import { Entry } from "@/lib/types"
import formatDate from "@/utils/formatDate"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useImageUpload } from "@/hooks/use-image-upload"

export default function DailyView({entryDates, initialEntries, initialDate}: {entryDates: Date[], initialEntries: Entry[], initialDate: string}) {
    const parseDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    const [selectedDate, setSelectedDate] = useState<Date>(parseDate(initialDate))
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!searchParams.get('date')) {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            const today = new Date()
            router.replace(`/?date=${formatDate(today)}&tz=${encodeURIComponent(tz)}`)
        }
    }, [router, searchParams])

    useEffect(() => {
        setSelectedDate(parseDate(initialDate))
    }, [initialDate])

    const handleCameraUpload = (url: string, filePath: string) => {
        router.push(`/create?signedUrl=${encodeURIComponent(url)}&filePath=${encodeURIComponent(filePath)}`)
    }

    const { triggerUpload, uploading } = useImageUpload(handleCameraUpload)

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        router.push(`/?date=${formatDate(date)}&tz=${encodeURIComponent(tz)}`)
    }

    const entries = initialEntries

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <CalendarStrip onDateSelect={handleDateSelect} entryDates={entryDates} selectedDate={selectedDate} />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex flex-1 h-full flex-col items-center justify-center mt-4">
                    {(entries.length === 0 ? 
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