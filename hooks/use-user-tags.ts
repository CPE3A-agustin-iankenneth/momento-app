"use client"

import { useState, useEffect, useCallback } from "react"
import { Tag } from "@/lib/types"
import { getUserTags } from "@/app/actions/tags"

export function useUserTags() {
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTags = useCallback(async () => {
        try {
            setLoading(true)
            const fetchedTags = await getUserTags()
            setTags(fetchedTags)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTags()
    }, [fetchTags])

    const refetch = useCallback(async () => {
        await fetchTags()
    }, [fetchTags])

    return { tags, loading, error, refetch }
}