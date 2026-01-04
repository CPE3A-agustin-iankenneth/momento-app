import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = userData.user;
    
    try {
        const body = await req.json();
        
        // Support both single filePath and batch filePaths
        if (body.filePath) {
            // Single file operation (backwards compatibility)
            const { filePath } = body;
            
            if (!filePath.startsWith(`${user.id}/${user.id}-`)) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const { data, error } = await supabase
                .storage
                .from('entry-photo')
                .createSignedUrl(filePath, 24 * 60 * 60) // 24 hours
                
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            return NextResponse.json({ url: data.signedUrl });
        }
        
        if (body.filePaths) {
            // Batch operation
            const { filePaths } = body;
            
            if (!Array.isArray(filePaths)) {
                return NextResponse.json({ error: "filePaths must be an array" }, { status: 400 });
            }

            // Validate all file paths belong to the user
            const invalidPaths = filePaths.filter(
                (path: string) => !path.startsWith(`${user.id}/${user.id}-`)
            );
            
            if (invalidPaths.length > 0) {
                return NextResponse.json({ 
                    error: "Forbidden paths detected", 
                    invalidPaths 
                }, { status: 403 });
            }

            // Generate all URLs in parallel
            const signedUrls = await Promise.all(
                filePaths.map(async (path: string) => {
                    try {
                        const { data, error } = await supabase.storage
                            .from('entry-photo')
                            .createSignedUrl(path, 24 * 60 * 60); // 24 hours
                        
                        if (error) {
                            console.error(`Error generating signed URL for ${path}:`, error.message);
                            return { path, url: null, error: error.message };
                        }
                        
                        return { path, url: data.signedUrl, error: null };
                    } catch (err) {
                        console.error(`Unexpected error for ${path}:`, err);
                        return { path, url: null, error: "Unexpected error" };
                    }
                })
            );

            return NextResponse.json({ urls: signedUrls });
        }
        
        return NextResponse.json({ error: "Either filePath or filePaths is required" }, { status: 400 });
        
    } catch (error) {
        console.error("Error in signed URL generation:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}