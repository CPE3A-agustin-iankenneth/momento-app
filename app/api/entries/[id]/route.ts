import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSignedUrl } from "@/utils/generateSignedUrl";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (id) {
        const { data: entry, error: entryError } = await supabase
            .from("entries")
            .select("*")
            .eq("id", id)
            .single();
        if (entryError) {
            return NextResponse.json({ error: entryError.message }, { status: 500 });
        }
        if (!entry) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        const { data: tagsData, error: tagsError } = await supabase
            .from('entry_tags')
            .select('tags(id, name)')
            .eq('entry_id', id);
        if (tagsError) {
            return NextResponse.json({ error: tagsError.message }, { status: 500 });
        }

        const tags = tagsData?.map(t => t.tags) || []
        let signedUrl = null;
        if (entry.image_url) {
            signedUrl = await generateSignedUrl(entry.image_url)
        }

        const updatedEntry = { ...entry, tags, image_url: signedUrl };
        return NextResponse.json({ entry: updatedEntry });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const data = {
      title: formData.get('title') as string,
      text: formData.get('content') as string,
      tags: JSON.parse(formData.get('tags') as string) as string[],
    }
    const { id } = await params;

    const { data: entry, error } = await supabase
      .from('entries')
      .update({title: data.title, text: data.text})
      .eq('id', id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { error: deleteError } = await supabase
        .from('entry_tags')
        .delete()
        .eq('entry_id', id);
    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (data.tags.length > 0) {
        const { data: upserted, error: upsertError } = await supabase
          .from('tags')
          .upsert(
            data.tags.map(tag => ({ name: tag, user_id: userData?.user.id })),
            { onConflict: "name" } 
          )
          .select()
        if (upsertError) {
            return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }

        if (upserted) {
          const rows = upserted.map((t) => ({
            entry_id: entry.id,
            tag_id: t.id,
          }));

          const { error: insertError } = await supabase
            .from("entry_tags")
            .insert(rows);
          if (insertError) {
              return NextResponse.json({ error: insertError.message }, { status: 500 });
          }
        }
    }


    return NextResponse.json({ success: true });

}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First verify the entry belongs to the user
    const { data: entry, error: entryError } = await supabase
        .from("entries")
        .select("id, user_id, image_url")
        .eq("id", id)
        .single();
    
    if (entryError) {
        return NextResponse.json({ error: entryError.message }, { status: 500 });
    }
    if (!entry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    if (entry.user_id !== userData.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete entry_tags first (due to foreign key constraint)
    const { error: deleteTagsError } = await supabase
        .from("entry_tags")
        .delete()
        .eq("entry_id", id);
    if (deleteTagsError) {
        return NextResponse.json({ error: deleteTagsError.message }, { status: 500 });
    }

    // Delete the entry
    const { error: deleteError } = await supabase
        .from("entries")
        .delete()
        .eq("id", id);
    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Optionally delete the image from storage if it exists
    if (entry.image_url) {
        const { error: storageError } = await supabase.storage
            .from("entries")
            .remove([entry.image_url]);
        if (storageError) {
            console.error("Failed to delete image from storage:", storageError);
        }
    }

    return NextResponse.json({ success: true });
}