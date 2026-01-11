"use server"

import { createClient } from '@/utils/supabase/server'
import { generateSignedUrl } from '@/utils/generateSignedUrl'
import { Entry } from '@/lib/types'

// ============================================
// SEARCH ENTRIES
// ============================================
export async function searchEntries(query: string = "", tagIds: string[] = []): Promise<Entry[]> {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
        throw new Error("Unauthorized")
    }

    // Build the search query
    let entriesQuery = supabase
        .from("entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })

    // Add text/title search if query is provided
    if (query.trim()) {
        entriesQuery = entriesQuery.or(`text.ilike.%${query}%,title.ilike.%${query}%`)
    }

    const { data: entries, error: entriesError } = await entriesQuery.limit(50)

    if (entriesError) {
        throw new Error(entriesError.message)
    }

    // Fetch tags for all entries
    const { data: tagsData, error: tagsError } = await supabase
        .from("entry_tags")
        .select("entry_id, tags(id, name)")
        .in("entry_id", entries?.map((e) => e.id) || [])

    if (tagsError) {
        throw new Error(tagsError.message)
    }

    // Map tags to entries
    let entriesWithTags = (entries ?? []).map((entry) => {
        const entryTags = tagsData?.filter((et) => et.entry_id === entry.id).map((et) => et.tags) || []
        return { ...entry, tags: entryTags }
    })

    // Filter by tags if tag filter is provided
    if (tagIds.length > 0) {
        entriesWithTags = entriesWithTags.filter((entry) => {
            const entryTagIds = entry.tags.map((tag: { id: string }) => tag.id)
            return tagIds.some((tagId) => entryTagIds.includes(tagId))
        })
    }

    // Generate signed URLs for images
    const updatedEntries = await Promise.all(
        entriesWithTags.map(async (entry) => {
            if (entry.image_url) {
                const signedUrl = await generateSignedUrl(entry.image_url)
                return { ...entry, image_url: signedUrl }
            }
            return entry
        })
    )

    return updatedEntries as Entry[]
}
