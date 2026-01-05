import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SidebarTrigger } from '@/components/ui/sidebar'
import DailyView from '@/components/daily-view'
import getEntryDates from '@/utils/getEntryDates'
import { getEntriesByDate } from '@/utils/getEntriesByDate'
import formatDate from '@/utils/formatDate'

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string, tz?: string }> }) {

    const supabase = await createClient()
  
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      redirect('/login')
    }

    const { data: { user }, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    if (userError) {
      console.error('Error fetching user profile: ', userError)
    }

    const { entryDatesArray } = await getEntryDates()

    const params = await searchParams
    const date = params.date || formatDate(new Date())
    const tz = params.tz || "UTC"
    const entries = await getEntriesByDate(date, tz)
    
  return (
    <div className='relative w-full h-100dvh'>
      <div className="hidden md:block">
          <SidebarTrigger className='absolute top-4 left-4 z-50'/>
      </div>
      <div className='flex flex-col items-center h-full'>
        <DailyView entryDates={entryDatesArray} initialEntries={entries} initialDate={date} />
      </div>
    </div>
  );
}
