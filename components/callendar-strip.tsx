"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format, subDays, isToday, isSameDay } from "date-fns"

export default function CalendarStrip({ onDateSelect, entryDates }: { onDateSelect?: (date: Date) => void, entryDates: Date[] }) {
    const today = new Date()
    const days = Array.from({ length: 30 }, (_, i) => subDays(today, i)).reverse()
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const dayRefs = useRef<(HTMLButtonElement | null)[]>([])

    // Initialize scroll position to the end (right) on load
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
            if (scrollContainer) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
                
                // Set up scroll listener for fade effect
                const handleScroll = () => {
                    setShowLeftFade(scrollContainer.scrollLeft > 10);
                };
                
                scrollContainer.addEventListener('scroll', handleScroll);
                // Initial check
                handleScroll();
                
                return () => scrollContainer.removeEventListener('scroll', handleScroll);
            }
        }
    }, []);

    const handleDayClick = (day: Date, idx: number) => {
        setSelectedDate(day);
        onDateSelect?.(day);
        dayRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    const hasEntry = (date: Date) => {
        return entryDates.some(entryDate => entryDate.toDateString() === date.toDateString())
    }

    return (
        <div className="relative w-full max-w-dvw sm:max-w-md md:max-w-lg lg:max-w-xl">
            <ScrollArea ref={scrollRef} className="w-full">
                <div className="flex gap-4 p-4">
                    {days.map((day, idx) => {
                        const todayFlag = isToday(day)
                        const selectedFlag = isSameDay(day, selectedDate);
                        return (
                            <Button 
                                ref={el => {dayRefs.current[idx] = el}}
                                className={`text-accent rounded-2xl 
                                    ${todayFlag ? "border-2 border-primary" : ""} 
                                    ${selectedFlag ? "bg-primary text-primary-foreground" : ""}
                                    ${hasEntry(day) ? "ring-1 ring-offset-1 ring-accent/70" : ""}
                                `} 
                                key={idx} 
                                size={"lgicon"} 
                                variant={selectedFlag ? "default" : "outline"} 
                                onClick={() => {
                                    handleDayClick(day, idx);
                                }}>
                                <div>
                                    <p className="font-bold text-xs tracking-wider">{format(day, "EEE").toUpperCase()}</p>
                                    <p className="text-xl">{format(day, "d")}</p>
                                </div>
                            </Button>
                        )
                    })}
                </div>
            {showLeftFade && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background/80 from-0% via-background/80 via-10% to-transparent to-20%" />
            )}
            <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}