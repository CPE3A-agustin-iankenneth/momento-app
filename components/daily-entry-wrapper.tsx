import Link from "next/link"
import DailyEntry from "./daily-entry"
import { Entry } from "@/lib/types"

export default function DailyEntryWrapper({ entry }: {entry : Entry}) {
    return (
        <Link href={`/entry/${entry.id}`} className="block active:scale-[0.98] active:opacity-80 transition-all duration-100">
            <DailyEntry entry={entry} />
        </Link>
    )
}
