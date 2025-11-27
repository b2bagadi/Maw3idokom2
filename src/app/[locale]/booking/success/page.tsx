"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Calendar, Home, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import { Link } from '@/i18n/routing';

export default function BookingSuccessPage() {
    const t = useTranslations('booking');
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('id');

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <GlobalHeader />

            <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
                <Card className="max-w-md w-full text-center shadow-xl border-t-4 border-t-green-500">
                    <CardHeader>
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-700">
                            Booking Confirmed!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground">
                            Your appointment has been successfully booked. We have sent a confirmation to your email/phone.
                        </p>

                        {appointmentId && (
                            <div className="bg-muted p-3 rounded-md font-mono text-sm">
                                Reference: #{appointmentId}
                            </div>
                        )}

                        <div className="space-y-3 pt-4">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push('/appointments')}
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                My Appointments
                            </Button>

                            <Button
                                className="w-full"
                                onClick={() => router.push('/explore')}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Back to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
