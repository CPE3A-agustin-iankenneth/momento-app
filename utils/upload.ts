import { createClient } from "./supabase/client";
import imageCompression from "browser-image-compression";

async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.8,           // Compress to max 800KB
        maxWidthOrHeight: 1920,   // Max dimension 1920px
        useWebWorker: true,       // Use web worker for better performance
        fileType: "image/webp",   // Convert to WebP for smaller size
    };

    try {
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
        return compressedFile;
    } catch (error) {
        console.error("Compression failed, using original:", error);
        return file;
    }
}

export default async function handleUploadImage(
    event: React.ChangeEvent<HTMLInputElement>,
    setUploading: (uploading: boolean) => void,
    onUploadComplete: (url: string | null, filePath: string | null) => void,
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Compress image before upload
    const compressedFile = await compressImage(file);

    const fileName = `${user?.id}-${Date.now()}.webp`
    const filePath = `${user?.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from("entry-photo")
        .upload(filePath, compressedFile, {
            contentType: "image/webp",
        })
    if (uploadError) {
        console.error("Error uploading image: ", uploadError)
        setUploading(false)
    }

    console.log("File uploaded successfully:", filePath)

    setUploading(false)

    const response = await fetch('/api/generate-signed', {
        method: 'POST',
        body: JSON.stringify({ filePath: filePath }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (!response.ok) {
        console.error("Error creating image record: ", response.statusText)
    }

    const data = await response.json()
    onUploadComplete(data.url, filePath)
    console.log("Signed URL: ", data.url)
}