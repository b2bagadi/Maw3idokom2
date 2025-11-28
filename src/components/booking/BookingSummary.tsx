"use client";

import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BookingSummaryProps {
    serviceName: string;
    staffName: string;
    date?: Date;
    time?: string;
    price: number;
    duration: number;
    onConfirm: () => void;
    isProcessing?: boolean;
    locale: string;
}

export function BookingSummary({
    serviceName,
    staffName,
    date,
    time,
    price,
    duration,
    onConfirm,
    isProcessing = false,
    locale
}: BookingSummaryProps) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{serviceName}</p>
                    <p className="text-sm text-muted-foreground">{duration} min</p>
                </div>
                <Separator />
                <div>
                    <p className="text-sm text-muted-foreground">Staff</p>
                    <p className="font-medium">{staffName}</p>
                </div>
                <Separator />
                <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                        {date ? date.toLocaleDateString(locale) : 'Not selected'}
                    </p>
                    <p className="font-medium">
                        {time || '--:--'}
                    </p>
                </div>
                <Separator />
                <div className="mt-auto pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-lg text-primary">{price} MAD</span>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={onConfirm}
                        disabled={!date || !time || isProcessing}
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Booking
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
