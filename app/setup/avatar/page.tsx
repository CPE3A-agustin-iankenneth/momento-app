"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

export default function AvatarSetupPage() {
    const router = useRouter()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                console.error("User not found")
                setUploading(false)
                return
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // Upload to avatar bucket
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    upsert: true
                })

            if (uploadError) {
                console.error("Error uploading avatar:", uploadError)
                setUploading(false)
                return
            }

            // Get public URL for avatar
            const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath)

            setAvatarUrl(urlData.publicUrl)
        } catch (error) {
            console.error("Error uploading avatar:", error)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!avatarUrl) {
            router.push("/")
            return
        }

        setSaving(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                console.error("User not found")
                setSaving(false)
                return
            }

            // Update profile with avatar URL
            const { error } = await supabase
                .from("profiles")
                .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
                .eq("id", user.id)

            if (error) {
                console.error("Error updating profile:", error)
                setSaving(false)
                return
            }

            router.push("/")
        } catch (error) {
            console.error("Error saving avatar:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleSkip = () => {
        router.push("/")
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl mb-6">momento</h1>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Add a profile photo</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Add a photo so you can recognize your journal
                    </p>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <label 
                            htmlFor="avatar-upload" 
                            className="cursor-pointer group"
                        >
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt="Avatar preview"
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-muted-foreground" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-md group-hover:scale-110 transition-transform">
                                <Camera className="w-4 h-4" />
                            </div>
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                        />
                    </div>
                    {uploading && (
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || uploading}
                        className="w-full"
                    >
                        {saving ? "Saving..." : avatarUrl ? "Continue" : "Continue without photo"}
                    </Button>
                    {avatarUrl && (
                        <Button 
                            variant="ghost" 
                            onClick={handleSkip}
                            disabled={saving || uploading}
                            className="w-full text-muted-foreground"
                        >
                            Skip for now
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
