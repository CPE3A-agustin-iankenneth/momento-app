"use client"

import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { useState } from "react"
import formatDate from "@/utils/formatDate"

interface CalendarViewProps {
    entryDates: Date[]
    entryDateImageMap?: Record<string, string>
}

export default function CalendarView({ entryDates, entryDateImageMap = {} }: CalendarViewProps) {
    const router = useRouter()
    const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const dateString = formatDate(date)
            router.push(`/calendar?date=${dateString}`)
            setSelectedDay(date)
        }
        else {
            router.push(`/calendar`)
        }
    }

    return (
        <div className="flex justify-center">
            <Calendar 
                entryDates={entryDates}
                entryDateImageMap={entryDateImageMap}
                mode="single"
                selected={selectedDay}
                onSelect={handleDateSelect}
                className="w-screen lg:w-sm px-8"
                showOutsideDays={false}
                buttonVariant="ghost"
            />
        </div>

    )
}