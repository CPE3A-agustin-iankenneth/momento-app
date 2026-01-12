"use client"

import { useState, useTransition } from "react"
import { ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toggleFavorite } from "@/app/actions/entries"

export default function EntryNav({ entryId, isFavorite: initialFavorite }: { entryId: string, isFavorite?: boolean }) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(initialFavorite || false);
    const [isPending, startTransition] = useTransition();

    const handleFavoriteToggle = async () => {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState); // Optimistic update
        
        startTransition(async () => {
            try {
                await toggleFavorite(entryId, newFavoriteState);
            } catch (error) {
                console.error('Error toggling favorite:', error);
                setIsFavorite(!newFavoriteState); // Revert on error
            }
        });
    };

    return (
        <nav className="mt-4 mb-8">
            <div className="flex items-center justify-between">
              <Link href={`/`} className="active:scale-90 active:opacity-70 transition-all duration-100">
                  <ArrowLeft />
              </Link>
              <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFavoriteToggle}
                    disabled={isPending}
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