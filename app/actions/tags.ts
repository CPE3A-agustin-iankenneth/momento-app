"use server"

import { createClient } from '@/utils/supabase/server'
import { Tag } from '@/lib/types'

// ============================================
// GET USER TAGS
// ============================================
export async function getUserTags(): Promise<Tag[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data: tags, error: tagsError } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

    if (tagsError) {
        throw new Error(tagsError.message)
    }

    return tags || []
}
