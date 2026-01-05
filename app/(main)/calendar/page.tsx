import CalendarView from "@/components/calendar-view"
import ListView from "@/components/list-view"
import getEntryDates from "@/utils/getEntryDates"
import { getEntriesByDate } from "@/utils/getEntriesByDate"
import formatDate from "@/utils/formatDate"

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string, tz?: string }> }) {

    const { entryDatesArray, entryDateImageMap } = await getEntryDates()
    const params = await searchParams
    const date = params.date || formatDate(new Date())
    const tz = params.tz || "UTC"
    const entries = await getEntriesByDate(date, tz)

    return (
        <div className="md:w-full md:flex-row flex flex-col gap-4 h-full overflow-hidden md:justify-center md:items-center">
            <CalendarView entryDates={entryDatesArray} entryDateImageMap={entryDateImageMap} selectedDate={date} />
            <ListView entries={entries} date={date} />
        </div>
    )
}