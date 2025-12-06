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
    businessSlug: string;
    staffId: number | null;
    serviceDuration: number;
    locale: string;
    onSlotSelect: (date: Date, time: string) => void;
}

export function CalendarSlots({ businessSlug, staffId, serviceDuration, locale, onSlotSelect }: CalendarSlotsProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const dateLocale = locale === 'fr' ? fr : locale === 'ar' ? ar : enUS;

    useEffect(() => {
        if (date) {
            fetchSlots(date);
        }
    }, [date, staffId, businessSlug]);

    const fetchSlots = async (selectedDate: Date) => {
        setIsLoading(true);
        setSlots([]);
        setSelectedTime(null);

        try {
            const queryParams = new URLSearchParams({
                slug: businessSlug,
                date: format(selectedDate, 'yyyy-MM-dd'),
                duration: serviceDuration.toString(),
                ...(staffId ? { staffId: staffId.toString() } : {})
            });

            const response = await fetch(`/api/public/availability/slots?${queryParams}`);
            const data = await response.json();

            if (response.ok && data.slots) {
                setSlots(data.slots);
            } else {
                setSlots([]); // Handle error or empty
            }
        } catch (error) {
            console.error('Failed to fetch slots', error);
            setSlots([]);
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
