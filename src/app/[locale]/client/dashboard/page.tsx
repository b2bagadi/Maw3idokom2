"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail, Phone, MapPin, MessageCircle, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GlobalHeader } from '@/components/GlobalHeader';

interface Appointment {
    id: number;
    tenantId: number;
    startTime: string;
    endTime: string;
    status: string;
    notes: string | null;
    businessName: string;
    businessNameFr: string;
    businessNameAr: string;
    businessSlug: string;
    businessPhone: string | null;
    businessEmail: string;
    businessWhatsapp: string | null;
    serviceName: string;
    serviceNameFr: string;
    serviceNameAr: string;
    servicePrice: number;
    serviceDuration: number;
}

interface Stats {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}

export default function ClientDashboardPage() {
    const router = useRouter();
    const t = useTranslations('client');
    const locale = useLocale();
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
    });
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('client_token');
        const userData = localStorage.getItem('client_user');

        if (!token) {
            router.push('/client/login');
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }

        fetchAppointments(token);
    }, []);

    const fetchAppointments = async (token: string) => {
        try {
            const response = await fetch('/api/client/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('client_token');
                    localStorage.removeItem('client_user');
                    router.push('/client/login');
                    return;
                }
                toast.error(t('dashboardErrorFetch'));
                return;
            }

            setAppointments(data.appointments || []);
            setStats(data.stats || stats);
        } catch (error) {
            toast.error(t('dashboardErrorFetch'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
        toast.success(t('logoutSuccess'));
        router.push('/');
    };

    const getBusinessName = (appointment: Appointment) => {
        switch (locale) {
            case 'fr': return appointment.businessNameFr || appointment.businessName;
            case 'ar': return appointment.businessNameAr || appointment.businessName;
            default: return appointment.businessName;
        }
    };

    const getServiceName = (appointment: Appointment) => {
        switch (locale) {
            case 'fr': return appointment.serviceNameFr || appointment.serviceName;
            case 'ar': return appointment.serviceNameAr || appointment.serviceName;
            default: return appointment.serviceName;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20';
            case 'CONFIRMED': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
            case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
            default: return 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleContactBusiness = (appointment: Appointment) => {
        if (appointment.businessWhatsapp) {
            window.open(appointment.businessWhatsapp, '_blank');
        } else if (appointment.businessPhone) {
            window.location.href = `tel:${appointment.businessPhone}`;
        } else if (appointment.businessEmail) {
            window.location.href = `mailto:${appointment.businessEmail}`;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-white" />
                    <p className="text-white text-lg">{t('dashboardLoading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)]">
            <GlobalHeader />

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {t('dashboardWelcome')}, {user?.firstName}!
                        </h1>
                        <p className="text-white/80">{t('dashboardSubtitle')}</p>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('logout')}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="backdrop-blur-sm bg-white/95 border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('statsTotal')}</p>
                                    <p className="text-3xl font-bold text-primary">{stats.total}</p>
                                </div>
                                <Calendar className="h-12 w-12 text-primary/20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/95 border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('statsPending')}</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="h-12 w-12 text-yellow-600/20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/95 border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('statsConfirmed')}</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                                </div>
                                <Calendar className="h-12 w-12 text-green-600/20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/95 border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('statsCompleted')}</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
                                </div>
                                <Calendar className="h-12 w-12 text-blue-600/20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Appointments List */}
                <Card className="backdrop-blur-sm bg-white/95 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('dashboardAppointmentsTitle')}</CardTitle>
                        <CardDescription>{t('dashboardAppointmentsSubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointments.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground text-lg">{t('dashboardNoAppointments')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((appointment) => (
                                    <Card key={appointment.id} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-primary mb-1">
                                                                {getBusinessName(appointment)}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {getServiceName(appointment)} • ${appointment.servicePrice} • {appointment.serviceDuration} {t('minutes')}
                                                            </p>
                                                        </div>
                                                        <Badge className={`${getStatusColor(appointment.status)} font-semibold`}>
                                                            {t(`status${appointment.status}`)}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatDate(appointment.startTime)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                                                        </div>
                                                    </div>

                                                    {appointment.notes && (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            {t('notes')}: {appointment.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleContactBusiness(appointment)}
                                                        className="bg-gradient-to-r from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] hover:shadow-lg transition-all duration-300"
                                                    >
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        {t('contactBusiness')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
