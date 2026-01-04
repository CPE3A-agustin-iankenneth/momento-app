import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSignedUrl } from "@/utils/generateSignedUrl";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const date = req.nextUrl.searchParams.get("date");
    const timezone = req.nextUrl.searchParams.get("tz") || "UTC";

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    

    if (date) {
        // Get the UTC offset for the given timezone on this date
        const formatter = new Intl.DateTimeFormat('en-CA', { 
            timeZone: timezone, 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const tzDate = new Date(`${date}T12:00:00`);
        const utcTime = tzDate.getTime();
        const tzTime = new Date(formatter.format(tzDate).replace(',', '').replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6')).getTime();
        const offset = utcTime - tzTime;

        // Adjust the query range to account for timezone
        const startUTC = new Date(new Date(`${date}T00:00:00`).getTime() - offset).toISOString();
        const endUTC = new Date(new Date(`${date}T23:59:59.999`).getTime() - offset).toISOString();

        const { data: entries, error: entriesError } = await supabase
            .from("entries")
            .select('*')
            .eq('user_id', userData.user.id)
            .gte('created_at', startUTC)
            .lte('created_at', endUTC)
        if (entriesError) {
            return NextResponse.json({ error: entriesError.message }, { status: 500 });
        }

        const { data: tagsData, error: tagsError } = await supabase
            .from('entry_tags')
            .select('entry_id, tags(id, name)')
            .in('entry_id', entries?.map(e => e.id) || [])
        if (tagsError) {
            return NextResponse.json({ error: tagsError.message }, { status: 500 });
        }

        const entriesWithTags = (entries ?? []).map(entry => {
            const entryTags = tagsData?.filter(et => et.entry_id === entry.id).map(et => et.tags) || [];
            return { ...entry, tags: entryTags };
        })

        const updatedEntries = await Promise.all(
            (entriesWithTags ?? []).map(async (entry) => {

                if (entry.image_url) {
                    const signedUrl = await generateSignedUrl(entry.image_url)
                    return { ...entry, image_url: signedUrl };
                }
                return { ...entry };
            })
        )

        console.log("Updated Entries:", updatedEntries);
        return NextResponse.json({ entries: updatedEntries });
    }

    return NextResponse.json({ error: "Missing date or id parameter" }, { status: 400 });
}