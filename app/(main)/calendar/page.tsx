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
        <div className="md:w-full md:flex-row flex flex-col gap-0 h-full overflow-hidden md:justify-center md:items-center">
            <div className="flex-shrink-0">
                <CalendarView entryDates={entryDatesArray} entryDateImageMap={entryDateImageMap} selectedDate={date} />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
                <ListView entries={entries} date={date} />
            </div>
        </div>
    )
}