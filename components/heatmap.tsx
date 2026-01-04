"use client"
import { useEffect, useRef } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function Heatmap(
    { 
        weightedDates, 
        colors, 
    }: 
    { 
        weightedDates: Record<string, number>, 
        colors: string[] 
    }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth
            }
        }    
    }, [weightedDates])

    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(today.getFullYear() - 1);
    
    // Normalize dates to start of day in local timezone
    const startDate = new Date(yearAgo.getFullYear(), yearAgo.getMonth(), yearAgo.getDate());
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Add 1 to include today in the count
    const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const calendarGrid = Array.from({ length: daysInRange }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        // Format as YYYY-MM-DD in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })
    
    const highestValue = Object.values(weightedDates || {}).reduce((a, b) => Math.max(a, b), -Infinity)

    const getIntensity = (activityCount: number) => {
        return highestValue !== 0 ? Number(activityCount) / highestValue : 0
    }

    const getColorFromIntensity = (intensity: number) => {
        const colorIndex = Math.min(Math.floor((intensity * colors.length)), colors.length - 1)
        return colors[colorIndex]
    }

    return (
        <ScrollArea ref={scrollRef} className="w-full">
            <div className='grid grid-flow-col gap-1' style={{gridTemplateRows: 'repeat(7, minmax(0, 1fr)'}}>
                {calendarGrid.map((day, index)=>{
                    const activityCount = weightedDates[day] || 0;
                    const intensity = getIntensity(activityCount);
                    const color = getColorFromIntensity(intensity)
                    return <div key={index} className='w-3 h-3 rounded-md cursor-pointer bg-gray-400' title={`${activityCount} Posts on ${day}`} style={{backgroundColor: `${String(color)}`}}></div>
                })
            }
            </div>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>            
    )
}