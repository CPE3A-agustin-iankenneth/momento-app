"use client"

import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import formatDate from "@/utils/formatDate"

interface CalendarViewProps {
    entryDates: Date[]
    entryDateImageMap?: Record<string, string>
    selectedDate?: string
}

export default function CalendarView({ entryDates, entryDateImageMap = {}, selectedDate }: CalendarViewProps) {
    const router = useRouter()
    
    const parseDate = (dateStr?: string) => {
        if (!dateStr) return new Date();
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    const [selectedDay, setSelectedDay] = useState<Date | undefined>(parseDate(selectedDate))

    useEffect(() => {
        setSelectedDay(parseDate(selectedDate))
    }, [selectedDate])

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const dateString = formatDate(date)
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            router.push(`/calendar?date=${dateString}&tz=${encodeURIComponent(tz)}`)
            setSelectedDay(date)
        }
        else {
            router.push(`/calendar`)
        }
    }

    return (
        <div className="flex justify-center py-4 md:py-0">
            <Calendar 
                entryDates={entryDates}
                entryDateImageMap={entryDateImageMap}
                mode="single"
                selected={selectedDay}
                onSelect={handleDateSelect}
                className="w-full max-w-md px-4 md:px-8"
                showOutsideDays={false}
                buttonVariant="ghost"
            />
        </div>

    )
}