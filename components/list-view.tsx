"use client"

import { Entry } from "@/lib/types"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import DailyEntryWrapper from "./daily-entry-wrapper"

interface ListViewProps {
    entries: Entry[]
    date: string
}

export default function ListView({ entries, date }: ListViewProps) {

    const formatDate = (dateString: string) => {
        // Handle potential timezone issues by appending T12:00:00 if it's just YYYY-MM-DD
        const dateToFormat = dateString.includes('T') ? new Date(dateString) : new Date(`${dateString}T12:00:00`);
        return dateToFormat.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className="flex flex-col w-full h-full px-8 lg:px-0 lg:w-lg">
            <h1 className="text-xl mb-4 mt-2 flex-shrink-0">
                {formatDate(date)}
            </h1>
            <div className="flex-1 overflow-hidden">
                {(entries.length === 0) ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No entries yet for this day</p>
                    </div> 
                )
                : (
                    <ScrollArea className="h-full">
                        <div className="space-y-4 pb-4">
                            {entries.map((entry) => (
                                <DailyEntryWrapper key={entry.id} entry={entry} />
                            ))}
                        </div>
                        <ScrollBar />
                    </ScrollArea> 
                )}
            </div>
        </div>
    )
}