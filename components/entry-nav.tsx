"use client"

import { useState } from "react"
import { ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EntryNav({ entryId, isFavorite: initialFavorite }: { entryId: string, isFavorite?: boolean }) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(initialFavorite || false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleFavoriteToggle = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/entries/${entryId}/favorite`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_favorite: !isFavorite })
            });
            
            if (res.ok) {
                setIsFavorite(!isFavorite);
                router.refresh();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <nav className="mt-4 mb-8">
            <div className="flex items-center justify-between">
              <Link href={`/`}>
                  <ArrowLeft />
              </Link>
              <div className="flex items-center gap-2">
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
                <Button onClick={() => router.push(`/entry/${entryId}/edit`)}>Edit</Button>
              </div>
            </div>
        </nav>
    )
}