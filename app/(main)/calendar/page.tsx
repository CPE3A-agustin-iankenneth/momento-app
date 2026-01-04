import CalendarView from "@/components/calendar-view"
import ListView from "@/components/list-view"
import getEntryDates from "@/utils/getEntryDates"

export default async function CalendarPage() {

    const { entryDatesArray, entryDateImageMap } = await getEntryDates()
    return (
        <div className="md:w-full md:flex-row flex flex-col gap-4 h-full overflow-hidden md:justify-center md:items-center">
            <CalendarView entryDates={entryDatesArray} entryDateImageMap={entryDateImageMap} />
            <ListView />
        </div>
    )
}