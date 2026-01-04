"use client"

import Image from "next/image";
import { Entry } from "@/lib/types";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DailyEntry({ entry }: {entry : Entry}) {
    const [isFavorite, setIsFavorite] = useState(entry.is_favorite || false);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/entries/${entry.id}/favorite`, {
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
        <div className="border-2 rounded-xl lg:px-8 px-4 py-4 mb-4 border-gray-200 shadow-none hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center">
                        {(entry.tags ?? []).slice(0, 2).map(tag => (
                            <div key={tag.id} className="bg-primary text-white font-medium rounded-md md:px-3 py-1 px-2 text-[0.6rem] tracking-widest mr-2 flex items-center justify-center">
                                {(tag.name).toUpperCase()}
                            </div>
                        ))}
                        {entry.tags && entry.tags.length > 2 && (
                            <div className="text-gray-700 text-sm py-1">
                                +{entry.tags.length - 2}
                            </div>
                        )}
                    </div>
                    <h2 className="lg:text-2xl text-xl mt-2 mb-1">{entry.title}</h2>
                    <p className="text-gray-400 lg:text-xs text-[0.6rem] font-semibold tracking-wider uppercase">{new Date(entry.created_at).toLocaleTimeString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-3">
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
                    {entry.image_url && (
                        <div className="relative lg:w-24 lg:h-24 w-16 h-16">
                            <Image 
                                src={entry.image_url} 
                                alt={entry.title} 
                                fill
                                className="object-cover rounded-lg"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
   