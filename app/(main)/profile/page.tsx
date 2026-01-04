"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, User, ArrowLeft, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/utils/supabase/client"
import { logout } from "@/app/auth/actions"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function ProfilePage() {
    const router = useRouter()
    const [email, setEmail] = useState<string>("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                router.push('/login')
                return
            }

            setEmail(user.email || "")

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setFirstName(profileData.first_name || "")
                setLastName(profileData.last_name || "")
                setAvatarUrl(profileData.avatar_url)
            }
            
            setLoading(false)
        }

        fetchProfile()
    }, [router])

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
        setSaving(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                console.error("User not found")
                setSaving(false)
                return
            }

            // Update profile
            const { error } = await supabase
                .from("profiles")
                .update({ 
                    first_name: firstName || null,
                    last_name: lastName || null,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString() 
                })
                .eq("id", user.id)

            if (error) {
                console.error("Error updating profile:", error)
                setSaving(false)
                return
            }

            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            console.error("Error saving profile:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        await logout()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center min-h-full w-full px-4 py-8">
            {/* Back Navigation */}
            <div className="w-full max-w-md mb-6">
                <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span>Back to dashboard</span>
                </Link>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                    className="rounded-full object-cover w-24 h-24"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-12 h-12 text-primary" />
                                </div>
                            )}
                            
                            <label 
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        {uploading && (
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        )}
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            type="text"
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button 
                        onClick={handleSave} 
                        className="w-full"
                        disabled={saving || uploading}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    
                    <Separator />
                    
                    {/* Logout Section */}
                    <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Log Out
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Log out?</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to log out of your account?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleLogout}>
                                    Log Out
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>
    )
}
