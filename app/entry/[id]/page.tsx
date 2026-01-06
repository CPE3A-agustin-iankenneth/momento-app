import Image from "next/image"
import getEntry from "@/utils/getEntry"
import EntryNav from "@/components/entry-nav"
import { Tag } from "@/lib/types";

export default async function EntryPage({ params }: { params: Promise<{ id: string }>}) {
    const { id } = await params
    const entry = await getEntry(id);

    return (
        <div className="w-full md:w-md md:mx-auto">
            <EntryNav entryId={entry.id} isFavorite={entry.is_favorite} />
            {entry.image_url && (
                <Image 
                    src={entry.image_url}
                    alt={entry.title || "Entry Image"}
                    width={320}
                    height={200}
                    className="w-lg h-auto mb-8 rounded-lg"
                />
            )}
            {entry.tags.length > 0 && (
                <div className="flex gap-2 mb-2">
                    {entry.tags.map((tag: Tag) => {
                        return (
                            <div key={tag.id} className="bg-primary text-white font-medium rounded-md md:px-3 py-1 px-2 text-[0.6rem] tracking-widest flex items-center justify-center">
                                {(tag.name).toUpperCase()}
                            </div>
                        )
                    })}
                </div>
            )}
            <h1 className="text-2xl mb-2">{entry.title}</h1>
            <p className="text-gray-400 mb-4 lg:text-xs text-[0.6rem] font-semibold tracking-wider uppercase">{new Date(entry.created_at).toLocaleTimeString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-gray-800 whitespace-pre-wrap text-justify">{entry.text}</p>
        </div>
    )
}