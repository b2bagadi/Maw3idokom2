"use client";

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarSlotsProps {
    staffId: number;
    serviceDuration: number;
    locale: string;
    onSlotSelect: (date: Date, time: string) => void;
}

export function CalendarSlots({ staffId, serviceDuration, locale, onSlotSelect }: CalendarSlotsProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const dateLocale = locale === 'fr' ? fr : locale === 'ar' ? ar : enUS;

    useEffect(() => {
        if (date && staffId) {
            fetchSlots(date);
        }
    }, [date, staffId]);

    const fetchSlots = async (selectedDate: Date) => {
        setIsLoading(true);
        setSlots([]);
        setSelectedTime(null);

        try {
            // Mock API call - replace with actual endpoint
            // const response = await fetch(`/api/availability?staffId=${staffId}&date=${format(selectedDate, 'yyyy-MM-dd')}`);
            // const data = await response.json();

            // Simulating network delay and data
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock slots generation
            const mockSlots = [];
            const startHour = 9;
            const endHour = 17;

            for (let h = startHour; h < endHour; h++) {
                mockSlots.push(`${h.toString().padStart(2, '0')}:00`);
                mockSlots.push(`${h.toString().padStart(2, '0')}:30`);
            }

            setSlots(mockSlots);
        } catch (error) {
            console.error('Failed to fetch slots', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        if (date) {
            onSlotSelect(date, time);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={dateLocale}
                    className="rounded-md border shadow-sm mx-auto"
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                />
            </div>

            <div className="flex-1">
                <div className="mb-4 font-medium text-lg">
                    {date ? format(date, 'EEEE, d MMMM', { locale: dateLocale }) : 'Select a date'}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
                        {slots.length > 0 ? (
                            slots.map((time) => (
                                <Button
                                    key={time}
                                    variant={selectedTime === time ? "default" : "outline"}
                                    className={cn(
                                        "w-full",
                                        selectedTime === time && "ring-2 ring-primary ring-offset-2"
                                    )}
                                    onClick={() => handleTimeSelect(time)}
                                >
                                    {time}
                                </Button>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-muted-foreground py-8">
                                No slots available for this date
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
