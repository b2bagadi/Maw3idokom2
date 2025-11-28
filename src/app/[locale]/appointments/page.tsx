"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, AlertCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyAppointmentsPage() {
    const t = useTranslations('booking');
    const locale = useLocale();
    const router = useRouter();
    const dateLocale = locale === 'fr' ? fr : locale === 'ar' ? ar : enUS;

    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('client_token');
            if (!token) {
                router.push(`/${locale}/auth/login`);
                return;
            }

            const response = await fetch('/api/client/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('client_token');
                localStorage.removeItem('client_user');
                router.push(`/${locale}/auth/login`);
                return;
            }

            const data = await response.json();
            if (response.ok) {
                setAppointments(data.appointments || []);
            } else {
                toast.error('Failed to load appointments');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        try {
            setCancellingId(id);
            const token = localStorage.getItem('client_token');
            const response = await fetch(`/api/client/appointments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Appointment cancelled');
                loadAppointments(); // Reload list
            } else {
                toast.error(data.error || 'Failed to cancel');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <Badge className="bg-green-500">Confirmed</Badge>;
            case 'PENDING': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            case 'COMPLETED': return <Badge variant="secondary">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <GlobalHeader showBackArrow />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

                {appointments.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No appointments found</h3>
                        <p className="text-muted-foreground mb-6">You haven't booked any appointments yet.</p>
                        <Button onClick={() => router.push(`/${locale}/explore`)}>
                            Book Now
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appt) => (
                            <Card key={appt.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{appt.businessName}</CardTitle>
                                            <CardDescription className="flex items-center mt-1">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {appt.businessSlug} {/* Should ideally be address */}
                                            </CardDescription>
                                        </div>
                                        {getStatusBadge(appt.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Service</div>
                                        <div className="font-semibold">{appt.serviceName}</div>
                                        <div className="text-sm text-muted-foreground">{appt.serviceDuration} min • {appt.servicePrice} MAD</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Date & Time</div>
                                        <div className="flex items-center font-semibold">
                                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                                            {format(new Date(appt.startTime), 'PPP', { locale: dateLocale })}
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <Clock className="w-4 h-4 mr-2 text-primary" />
                                            {format(new Date(appt.startTime), 'p', { locale: dateLocale })}
                                        </div>
                                    </div>
                                </CardContent>
                                {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                                    <CardFooter className="bg-muted/10 border-t flex justify-end py-3">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={cancellingId === appt.id}>
                                                    {cancellingId === appt.id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <XCircle className="w-3 h-3 mr-2" />}
                                                    Cancel Appointment
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently cancel your appointment.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleCancel(appt.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Yes, Cancel it
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
