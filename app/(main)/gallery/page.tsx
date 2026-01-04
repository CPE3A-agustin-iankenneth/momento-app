import { getAllEntries } from "@/utils/getAllEntries"
import GalleryEntry from "@/components/gallery-entry"
import Link from "next/link"
import { Entry } from "@/lib/types"

interface GroupedEntries {
    [key: string]: Entry[]
}

function groupEntriesByMonth(entries: Entry[]): GroupedEntries {
    return entries.reduce((groups: GroupedEntries, entry) => {
        const date = new Date(entry.created_at)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!groups[key]) {
            groups[key] = []
        }
        groups[key].push(entry)
        return groups
    }, {})
}

function formatMonthYear(key: string): string {
    const [year, month] = key.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default async function GalleryPage() {
    const entries = await getAllEntries()
    const groupedEntries = groupEntriesByMonth(entries)
    const sortedKeys = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a))

    return (
        <div className="h-full overflow-y-auto px-2">
            {sortedKeys.map((monthKey) => (
                <div key={monthKey}>
                    {/* Month/Year Divider */}
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3 px-2">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {formatMonthYear(monthKey)}
                        </h2>
                    </div>
                    
                    {/* 3-Column Grid */}
                    <div className="grid grid-cols-3 gap-0.5">
                        {groupedEntries[monthKey].map((entry) => (
                            <Link 
                                href={`/entry/${entry.id}`} 
                                prefetch={true} 
                                key={entry.id} 
                                className="relative aspect-square hover:opacity-80 transition-opacity ease-in-out"
                            >
                                <GalleryEntry entry={entry} />
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
            
            {entries.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No moments yet. Start capturing your memories!</p>
                </div>
            )}
        </div>
    )
}
