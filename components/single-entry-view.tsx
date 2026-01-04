"use client"

import Image from "next/image"
import { Entry, Tag } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Pencil } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SingleEntryView({ entry }: { entry: Entry }) {
    const [isFavorite, setIsFavorite] = useState(entry.is_favorite || false)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        setIsUpdating(true)
        try {
            const res = await fetch(`/api/entries/${entry.id}/favorite`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_favorite: !isFavorite })
            })
            
            if (res.ok) {
                setIsFavorite(!isFavorite)
                router.refresh()
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/entry/${entry.id}/edit`)
    }

    return (
        <div className="block w-full h-full">
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 mb-4 px-4 md:px-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFavoriteToggle}
                    disabled={isUpdating}
                    className="hover:bg-primary/10"
                >
                    <Heart 
                        className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    className="gap-2"
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </Button>
            </div>

            <Link href={`/entry/${entry.id}`} className="block">
                <div className="flex flex-col items-start w-full px-4 md:px-8">
                    {entry.image_url && (
                        <Image 
                            src={entry.image_url}
                            alt={entry.title || "Entry Image"}
                            width={400}
                            height={300}
                            className="w-full max-w-md h-auto mb-6 rounded-lg object-cover"
                        />
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                        <div className="flex gap-2 mb-2">
                            {entry.tags.map((tag: Tag) => (
                                <div key={tag.id} className="bg-primary text-white font-medium rounded-md md:px-3 py-1 px-2 text-[0.6rem] tracking-widest flex items-center justify-center">
                                    {(tag.name).toUpperCase()}
                                </div>
                            ))}
                        </div>
                    )}
                    <h1 className="text-2xl mb-2">{entry.title}</h1>
                    <p className="text-gray-400 mb-4 lg:text-xs text-[0.6rem] font-semibold tracking-wider uppercase">
                        {new Date(entry.created_at).toLocaleTimeString([], { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </p>
                    <p className="text-gray-800 whitespace-pre-wrap text-justify line-clamp-3">{entry.text}</p>
                </div>
            </Link>
        </div>
    )
}
