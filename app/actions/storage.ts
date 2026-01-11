"use server"

import { createClient } from '@/utils/supabase/server'

// ============================================
// GENERATE SIGNED URL FOR SINGLE FILE
// ============================================
export async function generateSignedUploadUrl(filePath: string): Promise<string> {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
        throw new Error("Unauthorized")
    }

    const user = userData.user

    if (!filePath.startsWith(`${user.id}/${user.id}-`)) {
        throw new Error("Forbidden")
    }

    const { data, error } = await supabase
        .storage
        .from('entry-photo')
        .createSignedUrl(filePath, 24 * 60 * 60) // 24 hours

    if (error) {
        throw new Error(error.message)
    }

    return data.signedUrl
}

// ============================================
// GENERATE SIGNED URLS FOR BATCH FILES
// ============================================
export async function generateSignedUploadUrls(filePaths: string[]): Promise<Array<{ path: string; url: string | null; error: string | null }>> {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
        throw new Error("Unauthorized")
    }

    const user = userData.user

    // Validate all file paths belong to the user
    const invalidPaths = filePaths.filter(
        (path: string) => !path.startsWith(`${user.id}/${user.id}-`)
    )

    if (invalidPaths.length > 0) {
        throw new Error(`Forbidden paths detected: ${invalidPaths.join(', ')}`)
    }

    // Generate all URLs in parallel
    const signedUrls = await Promise.all(
        filePaths.map(async (path: string) => {
            try {
                const { data, error } = await supabase.storage
                    .from('entry-photo')
                    .createSignedUrl(path, 24 * 60 * 60) // 24 hours

                if (error) {
                    console.error(`Error generating signed URL for ${path}:`, error.message)
                    return { path, url: null, error: error.message }
                }

                return { path, url: data.signedUrl, error: null }
            } catch (err) {
                console.error(`Unexpected error for ${path}:`, err)
                return { path, url: null, error: "Unexpected error" }
            }
        })
    )

    return signedUrls
}
