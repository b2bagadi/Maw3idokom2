"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarSlots } from "@/components/booking/CalendarSlots";
import { Appointment } from "./types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    locale: string;
    onSuccess: () => void;
}

export function RescheduleModal({
    isOpen,
    onClose,
    appointment,
    locale,
    onSuccess,
}: RescheduleModalProps) {
    const t = useTranslations('appointments');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSlotSelect = (date: Date, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
    };

    const handleConfirm = async () => {
        if (!appointment || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        try {
            const [hours, minutes] = selectedTime.split(':');
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const response = await fetch(`/api/appointments/${appointment.id}/reschedule`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startTime: startDateTime.toISOString() }),
            });

            if (response.ok) {
                toast.success(t('rescheduleSuccess', { defaultMessage: "Appointment rescheduled successfully" }));
                onSuccess();
                onClose();
            } else {
                const data = await response.json();
                toast.error(data.error || t('rescheduleError', { defaultMessage: "Failed to reschedule" }));
            }
        } catch (error) {
            toast.error(t('rescheduleError', { defaultMessage: "Failed to reschedule" }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const servicePrice = appointment?.price || 0;
    const serviceDuration = appointment?.serviceDuration || 60;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('rescheduleTitle', { defaultMessage: "Reschedule Appointment" })}</DialogTitle>
                    <DialogDescription>
                        {t('rescheduleDesc', { defaultMessage: "Select a new date and time for this appointment." })}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {appointment && (
                        <CalendarSlots
                            staffId={appointment.staffId || 0}
                            serviceDuration={serviceDuration}
                            locale={locale}
                            onSlotSelect={handleSlotSelect}
                        />
                    )}
                </div>

                {selectedDate && selectedTime && (
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{t('newTime', { defaultMessage: "New Time" })}</span>
                            <span className="text-sm">
                                {selectedDate.toLocaleDateString(locale)} {selectedTime}
                            </span>
                        </div>
                        <div className="flex justify-between items-center font-bold">
                            <span>{t('totalPrice', { defaultMessage: "Total Price" })}</span>
                            <span>{servicePrice} MAD</span>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        {t('cancel', { defaultMessage: "Cancel" })}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedDate || !selectedTime || isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('confirmReschedule', { defaultMessage: "Confirm Reschedule" })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
