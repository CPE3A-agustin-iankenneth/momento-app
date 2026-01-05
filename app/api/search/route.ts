import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSignedUrl } from "@/utils/generateSignedUrl";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const query = req.nextUrl.searchParams.get("q") || "";
    const tagIds = req.nextUrl.searchParams.get("tags")?.split(",").filter(Boolean) || [];

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build the search query
    let entriesQuery = supabase
        .from("entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

    // Add text/title search if query is provided
    if (query.trim()) {
        entriesQuery = entriesQuery.or(`text.ilike.%${query}%,title.ilike.%${query}%`);
    }

    const { data: entries, error: entriesError } = await entriesQuery.limit(50);

    if (entriesError) {
        return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }

    // Fetch tags for all entries
    const { data: tagsData, error: tagsError } = await supabase
        .from("entry_tags")
        .select("entry_id, tags(id, name)")
        .in("entry_id", entries?.map((e) => e.id) || []);

    if (tagsError) {
        return NextResponse.json({ error: tagsError.message }, { status: 500 });
    }

    // Map tags to entries
    let entriesWithTags = (entries ?? []).map((entry) => {
        const entryTags = tagsData?.filter((et) => et.entry_id === entry.id).map((et) => et.tags) || [];
        return { ...entry, tags: entryTags };
    });

    // Filter by tags if tag filter is provided
    if (tagIds.length > 0) {
        entriesWithTags = entriesWithTags.filter((entry) => {
            const entryTagIds = entry.tags.map((tag: { id: string }) => tag.id);
            return tagIds.some((tagId) => entryTagIds.includes(tagId));
        });
    }

    // Generate signed URLs for images
    const updatedEntries = await Promise.all(
        entriesWithTags.map(async (entry) => {
            if (entry.image_url) {
                const signedUrl = await generateSignedUrl(entry.image_url);
                return { ...entry, image_url: signedUrl };
            }
            return entry;
        })
    );

    return NextResponse.json({ entries: updatedEntries });
}
