import { createClient } from "./supabase/server";

// In-memory cache for signed URLs
const urlCache = new Map<string, { url: string; expires: number }>();

export async function generateSignedUrl(filePath: string): Promise<string | null> {
    // Check cache first
    const cached = urlCache.get(filePath);
    if (cached && Date.now() < cached.expires) {
        return cached.url;
    }

    const supabase = await createClient();

    // Extend expiry to 24 hours for better caching
    const { data, error } = await supabase
        .storage
        .from('entry-photo')
        .createSignedUrl(filePath, 24 * 60 * 60) // 24 hours

    if (error) {
        console.error("Error creating signed URL:", error.message);
        return null;
    }

    // Cache the result (expire 1 hour before the actual URL expires)
    urlCache.set(filePath, {
        url: data.signedUrl,
        expires: Date.now() + (23 * 60 * 60 * 1000) // 23 hours
    });

    return data.signedUrl;
}