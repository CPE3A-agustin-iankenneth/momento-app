import { createClient } from "@/utils/supabase/server";
import formatDate from "./formatDate";
import { generateSignedUrl } from "./generateSignedUrl";

export interface EntryDateWithImage {
    date: Date;
    imageUrl?: string;
}

export default async function getEntryDates() {
    const supabase = createClient()
    const { data: { user} } = await (await supabase).auth.getUser()
    const { data: entryDates, error: entryDatesError } = await (await supabase)
        .from('entries')
        .select('created_at, image_url')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
    if (entryDatesError) {
        console.error(entryDatesError)
    }

    const entryDatesArray = entryDates?.map(entry => new Date(entry.created_at)) || []
    const entryDatesWeighted = entryDatesArray.reduce((acc, date) => {
        const dateString = formatDate(date)
        acc[dateString] = (acc[dateString] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Build a map of date string -> latest entry image URL (for calendar preview)
    const entryDateImageMap: Record<string, string> = {}
    if (entryDates) {
        for (const entry of entryDates) {
            const dateString = formatDate(new Date(entry.created_at))
            // Only use first image found per date (entries are ordered desc, so first is latest)
            if (!entryDateImageMap[dateString] && entry.image_url) {
                const signedUrl = await generateSignedUrl(entry.image_url)
                if (signedUrl) {
                    entryDateImageMap[dateString] = signedUrl
                }
            }
        }
    }

    return { entryDatesArray, entryDatesWeighted, entryDateImageMap }

}