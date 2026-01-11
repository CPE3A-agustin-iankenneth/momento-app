"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { generateSignedUrl } from '@/utils/generateSignedUrl'

// ============================================
// CREATE MOMENT
// ============================================
export async function createMoment(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const data = {
        title: formData.get('title') as string,
        text: formData.get('content') as string,
        image_url: formData.get('image') as string,
        tags: JSON.parse(formData.get('tags') as string || '[]') as string[],
    }

    const { data: entry, error } = await supabase
        .from('entries')
        .insert({ title: data.title, text: data.text, image_url: data.image_url, user_id: user.id })
        .select()
        .single()

    if (error) {
        console.error('Error creating moment:', error)
        throw new Error(error.message)
    }

    // Handle tags
    if (data.tags.length > 0) {
        const { data: upserted, error: upsertError } = await supabase
            .from('tags')
            .upsert(
                data.tags.map(tag => ({ name: tag, user_id: user.id })),
                { onConflict: "name" }
            )
            .select()

        if (upsertError) {
            console.error('Error upserting tags:', upsertError)
            throw new Error(upsertError.message)
        }

        if (upserted) {
            const rows = upserted.map((t) => ({
                entry_id: entry.id,
                tag_id: t.id,
            }))
            await supabase.from("entry_tags").insert(rows)
        }
    }

    revalidatePath('/')
    redirect('/')
}

// ============================================
// UPDATE ENTRY
// ============================================
export async function updateEntry(entryId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const data = {
        title: formData.get('title') as string,
        text: formData.get('content') as string,
        tags: JSON.parse(formData.get('tags') as string || '[]') as string[],
    }

    const { data: entry, error } = await supabase
        .from('entries')
        .update({ title: data.title, text: data.text })
        .eq('id', entryId)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating entry:', error)
        throw new Error(error.message)
    }

    // Delete existing entry_tags
    const { error: deleteError } = await supabase
        .from('entry_tags')
        .delete()
        .eq('entry_id', entryId)

    if (deleteError) {
        console.error('Error deleting entry tags:', deleteError)
        throw new Error(deleteError.message)
    }

    // Handle tags
    if (data.tags.length > 0) {
        const { data: upserted, error: upsertError } = await supabase
            .from('tags')
            .upsert(
                data.tags.map(tag => ({ name: tag, user_id: user.id })),
                { onConflict: "name" }
            )
            .select()

        if (upsertError) {
            console.error('Error upserting tags:', upsertError)
            throw new Error(upsertError.message)
        }

        if (upserted) {
            const rows = upserted.map((t) => ({
                entry_id: entry.id,
                tag_id: t.id,
            }))

            const { error: insertError } = await supabase
                .from("entry_tags")
                .insert(rows)

            if (insertError) {
                console.error('Error inserting entry tags:', insertError)
                throw new Error(insertError.message)
            }
        }
    }

    revalidatePath(`/entry/${entryId}`)
    revalidatePath('/')
    redirect(`/entry/${entryId}`)
}

// ============================================
// DELETE ENTRY
// ============================================
export async function deleteEntry(entryId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify the entry belongs to the user
    const { data: entry, error: entryError } = await supabase
        .from("entries")
        .select("id, user_id, image_url")
        .eq("id", entryId)
        .single()

    if (entryError) {
        throw new Error(entryError.message)
    }
    if (!entry) {
        throw new Error("Entry not found")
    }
    if (entry.user_id !== user.id) {
        throw new Error("Unauthorized")
    }

    // Delete entry_tags first (due to foreign key constraint)
    const { error: deleteTagsError } = await supabase
        .from("entry_tags")
        .delete()
        .eq("entry_id", entryId)

    if (deleteTagsError) {
        throw new Error(deleteTagsError.message)
    }

    // Delete the entry
    const { error: deleteError } = await supabase
        .from("entries")
        .delete()
        .eq("id", entryId)

    if (deleteError) {
        throw new Error(deleteError.message)
    }

    // Optionally delete the image from storage if it exists
    if (entry.image_url) {
        const { error: storageError } = await supabase.storage
            .from("entries")
            .remove([entry.image_url])

        if (storageError) {
            console.error("Failed to delete image from storage:", storageError)
        }
    }

    revalidatePath('/')
    redirect('/')
}

// ============================================
// TOGGLE FAVORITE
// ============================================
export async function toggleFavorite(entryId: string, isFavorite: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify the entry belongs to the user
    const { data: entry, error: entryError } = await supabase
        .from("entries")
        .select("id, user_id")
        .eq("id", entryId)
        .single()

    if (entryError) {
        throw new Error(entryError.message)
    }
    if (!entry) {
        throw new Error("Entry not found")
    }
    if (entry.user_id !== user.id) {
        throw new Error("Unauthorized")
    }

    // Update the favorite status
    const { error: updateError } = await supabase
        .from("entries")
        .update({ is_favorite: isFavorite })
        .eq("id", entryId)

    if (updateError) {
        throw new Error(updateError.message)
    }

    revalidatePath('/')
    revalidatePath(`/entry/${entryId}`)

    return { success: true, is_favorite: isFavorite }
}

// ============================================
// GET ENTRIES BY DATE
// ============================================
export async function getEntriesByDate(date: string, timezone: string = "UTC") {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
        throw new Error("Unauthorized")
    }

    // Get the UTC offset for the given timezone on this date
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })

    const tzDate = new Date(`${date}T12:00:00`)
    const utcTime = tzDate.getTime()
    const tzTime = new Date(formatter.format(tzDate).replace(',', '').replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6')).getTime()
    const offset = utcTime - tzTime

    // Adjust the query range to account for timezone
    const startUTC = new Date(new Date(`${date}T00:00:00`).getTime() - offset).toISOString()
    const endUTC = new Date(new Date(`${date}T23:59:59.999`).getTime() - offset).toISOString()

    const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select('*')
        .eq('user_id', userData.user.id)
        .gte('created_at', startUTC)
        .lte('created_at', endUTC)
        .order('created_at', { ascending: false })

    if (entriesError) {
        throw new Error(entriesError.message)
    }

    const { data: tagsData, error: tagsError } = await supabase
        .from('entry_tags')
        .select('entry_id, tags(id, name)')
        .in('entry_id', entries?.map(e => e.id) || [])

    if (tagsError) {
        throw new Error(tagsError.message)
    }

    const entriesWithTags = (entries ?? []).map(entry => {
        const entryTags = tagsData?.filter(et => et.entry_id === entry.id).map(et => et.tags) || []
        return { ...entry, tags: entryTags }
    })

    const updatedEntries = await Promise.all(
        (entriesWithTags ?? []).map(async (entry) => {
            if (entry.image_url) {
                const signedUrl = await generateSignedUrl(entry.image_url)
                return { ...entry, image_url: signedUrl }
            }
            return { ...entry }
        })
    )

    return updatedEntries
}

// ============================================
// GET ENTRY BY ID
// ============================================
export async function getEntryById(id: string) {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
        throw new Error("Unauthorized")
    }

    const { data: entry, error: entryError } = await supabase
        .from("entries")
        .select("*")
        .eq("id", id)
        .eq("user_id", userData.user.id)
        .single()

    if (entryError) {
        throw new Error(entryError.message)
    }
    if (!entry) {
        throw new Error("Entry not found")
    }

    const { data: tagsData, error: tagsError } = await supabase
        .from('entry_tags')
        .select('tags(id, name)')
        .eq('entry_id', id)

    if (tagsError) {
        throw new Error(tagsError.message)
    }

    const tags = tagsData?.map(t => t.tags) || []
    let signedUrl = null
    if (entry.image_url) {
        signedUrl = await generateSignedUrl(entry.image_url)
    }

    return { ...entry, tags, image_url: signedUrl }
}
