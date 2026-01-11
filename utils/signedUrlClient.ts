import { generateSignedUploadUrl, generateSignedUploadUrls } from "@/app/actions/storage"

/**
 * Generate a single signed URL for an image
 */
export async function generateSignedUrlClient(filePath: string): Promise<string | null> {
    try {
        const signedUrl = await generateSignedUploadUrl(filePath)
        return signedUrl
    } catch (error) {
        console.error('Error generating signed URL:', error)
        return null
    }
}

/**
 * Generate multiple signed URLs in batch for better performance
 */
export async function generateSignedUrlsBatch(filePaths: string[]): Promise<{ [path: string]: string | null }> {
    try {
        const signedUrls = await generateSignedUploadUrls(filePaths)
        const result: { [path: string]: string | null } = {}
        
        signedUrls.forEach((item: { path: string; url: string | null; error: string | null }) => {
            result[item.path] = item.url
            if (item.error) {
                console.error(`Error for ${item.path}:`, item.error)
            }
        })

        return result
    } catch (error) {
        console.error('Error generating signed URLs batch:', error)
        return {}
    }
}

/**
 * Helper to add signed URLs to entries efficiently
 */
export async function addSignedUrlsToEntries<T extends { image_url?: string | null }>(
    entries: T[]
): Promise<T[]> {
    // Filter out entries that need signed URLs
    const entriesNeedingUrls = entries.filter(entry => entry.image_url && !entry.image_url.startsWith('http'));
    const pathsToSign = entriesNeedingUrls.map(entry => entry.image_url!);
    
    if (pathsToSign.length === 0) {
        return entries; // No URLs to sign
    }

    // Generate all signed URLs in one batch request
    const signedUrls = await generateSignedUrlsBatch(pathsToSign);
    
    // Map the signed URLs back to entries
    return entries.map(entry => {
        if (entry.image_url && signedUrls[entry.image_url]) {
            return {
                ...entry,
                image_url: signedUrls[entry.image_url]
            };
        }
        return entry;
    });
}