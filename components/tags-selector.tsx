/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { FormControl, FormItem, FormMessage } from "./ui/form"
import { UseFormReturn } from "react-hook-form"

type Tag = { id: string; name: string }

export default function TagsSelector({ form, name } : { form: UseFormReturn<any>; name: string }) {
    const supabase = createClient()

    const [tags, setTags] = useState<Tag[]>([])
    const [query, setQuery] = useState<string>("")
    const [selected, setSelected] = useState<Tag[]>([])

    useEffect(() => {
        const fetchTags = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data, error } = await supabase
                    .from('tags')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('name', { ascending: true })
                if (data) setTags(data)
                if (error) console.error("Error fetching tags:", error)
            }
        }
        fetchTags()
    }, [supabase])

    // Sync with react-hook-form
    useEffect(() => {
        form.setValue(name, selected.map((t) => t.name));
    }, [selected, form, name]);

    const addTag = (name: string) => {
        const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          if (!selected.some((t) => t.id === existing.id)) {
            setSelected([...selected, existing]);
          }
        } else {
          const newTag = { id: crypto.randomUUID(), name };
          setTags([...tags, newTag]);
          setSelected([...selected, newTag]);
        }
        setQuery("");
    };

  return (
    <FormItem>
      <FormControl>
        <div className="space-y-2 mb-4">
          {/* Selected tags */}
          <div className="flex flex-wrap gap-2">
            {selected.map((tag) => (
              <span
                key={tag.id}
                className="bg-primary/70 hover:bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() =>
                  setSelected(selected.filter((t) => t.id !== tag.id))
                }
              >
                {tag.name} ✕
              </span>
            ))}
          </div>

          {/* Input */}
          <input
            className="w-full border rounded p-2 text-sm"
            placeholder="Add or select a tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                e.preventDefault();
                addTag(query.trim());
              }
            }}
          />

          {/* Suggestions */}
          {query && (
            <div className="border rounded p-2 bg-popover shadow max-h-40 overflow-y-auto">
              {tags
                .filter((t) =>
                  t.name.toLowerCase().includes(query.toLowerCase())
                )
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-1 hover:bg-accent-foreground cursor-pointer"
                    onClick={() => addTag(t.name)}
                  >
                    {t.name}
                  </div>
                ))}
              {!tags.some(
                (t) => t.name.toLowerCase() === query.toLowerCase()
              ) && (
                <div
                  className="p-1 text-accent cursor-pointer"
                  onClick={() => addTag(query)}
                >
                  + Create “{query}”
                </div>
              )}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}   
