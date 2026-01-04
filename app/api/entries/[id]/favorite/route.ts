import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { is_favorite } = await req.json();

    // Verify the entry belongs to the user
    const { data: entry, error: entryError } = await supabase
        .from("entries")
        .select("id, user_id")
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

    // Update the favorite status
    const { error: updateError } = await supabase
        .from("entries")
        .update({ is_favorite })
        .eq("id", id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_favorite });
}
