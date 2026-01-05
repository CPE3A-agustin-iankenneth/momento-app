"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, Loader2 } from "lucide-react"
import { Entry, Tag } from "@/lib/types"
import { useUserTags } from "@/hooks/use-user-tags"

interface SearchDialogProps {
    trigger?: React.ReactNode
}

export default function SearchDialog({ trigger }: SearchDialogProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [results, setResults] = useState<Entry[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { tags, loading: tagsLoading } = useUserTags()

    const searchEntries = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (query.trim()) params.set("q", query.trim())
            if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))
            
            const response = await fetch(`/api/search?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setResults(data.entries || [])
            }
        } catch (error) {
            console.error("Search failed:", error)
        } finally {
            setLoading(false)
        }
    }, [query, selectedTags])

    // Debounced search
    useEffect(() => {
        if (!open) return
        
        const timeoutId = setTimeout(() => {
            searchEntries()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [query, selectedTags, open, searchEntries])

    const toggleTag = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        )
    }

    const clearFilters = () => {
        setQuery("")
        setSelectedTags([])
    }

    const handleEntryClick = (entry: Entry) => {
        setOpen(false)
        router.push(`/entry/${entry.id}`)
    }

    const formatEntryDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col p-0 gap-0" showCloseButton={false}>
                {/* Search input */}
                <div className="flex items-center gap-2 p-4 border-b">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                        placeholder="Search entries..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        autoFocus
                    />
                    {(query || selectedTags.length > 0) && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Tag filters */}
                {!tagsLoading && tags.length > 0 && (
                    <div className="px-4 py-3 border-b">
                        <p className="text-xs text-muted-foreground mb-2">Filter by tags</p>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag: Tag) => (
                                <Badge
                                    key={tag.id}
                                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                <ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
                    <div className="p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {query || selectedTags.length > 0
                                    ? "No entries found"
                                    : "Start typing to search..."}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {results.map((entry) => (
                                    <button
                                        key={entry.id}
                                        onClick={() => handleEntryClick(entry)}
                                        className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            {entry.image_url && (
                                                <Image
                                                    src={entry.image_url}
                                                    alt=""
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 object-cover rounded-md shrink-0"
                                                    unoptimized
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{entry.title}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {entry.text}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatEntryDate(entry.created_at)}
                                                    </span>
                                                    {entry.tags && entry.tags.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {entry.tags.slice(0, 2).map((tag) => (
                                                                <Badge key={tag.id} variant="secondary" className="text-xs py-0">
                                                                    {tag.name}
                                                                </Badge>
                                                            ))}
                                                            {entry.tags.length > 2 && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    +{entry.tags.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
