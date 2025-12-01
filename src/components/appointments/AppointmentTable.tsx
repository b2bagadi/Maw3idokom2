"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Calendar, Loader2, Check, X, MessageCircle, Mail } from "lucide-react";
import { format } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";
import { Appointment, AppointmentModuleProps, DateRange } from "./types";
import { RescheduleModal } from "./RescheduleModal";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface AppointmentTableProps extends AppointmentModuleProps {
    dateRange: DateRange | undefined;
    status: string;
    search: string;
    onSelectionChange: (ids: number[]) => void;
    onAction?: (action: string, appointment: Appointment) => void;
}

export function AppointmentTable({
    scope,
    tenantId,
    locale,
    dateRange,
    status,
    search,
    onSelectionChange,
    onAction,
}: AppointmentTableProps) {
    const t = useTranslations('appointments');
    const dateLocale = locale === 'fr' ? fr : locale === 'ar' ? ar : enUS;

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, [scope, tenantId, dateRange, status, search]); // Re-fetch when filters change

    useEffect(() => {
        onSelectionChange(selectedIds);
    }, [selectedIds, onSelectionChange]);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (tenantId && tenantId !== 'ALL') params.append('tenantId', tenantId);
            if (dateRange?.from) params.append('from', dateRange.from.toISOString());
            if (dateRange?.to) params.append('to', dateRange.to.toISOString());
            if (status && status !== 'ALL') params.append('status', status);
            if (search) params.append('search', search);

            // Determine endpoint based on scope
            let endpoint = '/api/appointments'; // Default
            let headers: HeadersInit = {};

            if (scope === 'admin') {
                endpoint = '/api/admin/appointments';
                const adminToken = localStorage.getItem('admin_token');
                if (adminToken) {
                    headers['Authorization'] = `Bearer ${adminToken}`;
                }
            } else if (scope === 'business') {
                endpoint = '/api/business/appointments';
                const businessToken = localStorage.getItem('business_token');
                if (businessToken) {
                    headers['Authorization'] = `Bearer ${businessToken}`;
                }
            }

            const url = `${endpoint}?${params.toString()}`;

            const response = await fetch(url, { headers });
            if (response.ok) {
                const data = await response.json();
                setAppointments(data.appointments || []);
            } else {
                console.error("Failed to fetch appointments:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error fetching appointments", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === appointments.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(appointments.map((a) => a.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <Badge className="bg-green-500">{t('status.confirmed', { defaultMessage: "Confirmed" })}</Badge>;
            case 'PENDING': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">{t('status.pending', { defaultMessage: "Pending" })}</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">{t('status.cancelled', { defaultMessage: "Cancelled" })}</Badge>;
            case 'COMPLETED': return <Badge variant="secondary">{t('status.completed', { defaultMessage: "Completed" })}</Badge>;
            case 'REJECTED': return <Badge variant="destructive">{t('status.rejected', { defaultMessage: "Rejected" })}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={appointments.length > 0 && selectedIds.length === appointments.length}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            {scope === 'admin' && <TableHead>{t('business', { defaultMessage: "Business" })}</TableHead>}
                            <TableHead>{t('date', { defaultMessage: "Date & Time" })}</TableHead>
                            <TableHead>{t('customer', { defaultMessage: "Customer" })}</TableHead>
                            <TableHead>{t('service', { defaultMessage: "Service" })}</TableHead>
                            <TableHead>{t('staff', { defaultMessage: "Staff" })}</TableHead>
                            <TableHead className="text-right">{t('price', { defaultMessage: "Price" })}</TableHead>
                            <TableHead>{t('status', { defaultMessage: "Status" })}</TableHead>
                            <TableHead className="text-right">{t('actions', { defaultMessage: "Actions" })}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={scope === 'admin' ? 9 : 8} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={scope === 'admin' ? 9 : 8} className="h-24 text-center text-muted-foreground">
                                    {t('noAppointments', { defaultMessage: "No appointments found." })}
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((appointment) => (
                                <TableRow key={appointment.id} data-state={selectedIds.includes(appointment.id) && "selected"}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(appointment.id)}
                                            onCheckedChange={() => toggleSelect(appointment.id)}
                                            aria-label="Select row"
                                        />
                                    </TableCell>
                                    {scope === 'admin' && (
                                        <TableCell>
                                            <div className="font-medium">{appointment.tenant?.name}</div>
                                            <div className="text-xs text-muted-foreground">{appointment.tenant?.slug}</div>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {format(new Date(appointment.startTime), "PPP", { locale: dateLocale })}
                                            </span>
                                            <span className="text-muted-foreground text-sm">
                                                {format(new Date(appointment.startTime), "p", { locale: dateLocale })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{appointment.guestName || appointment.customerName || "Guest"}</span>
                                            <span className="text-muted-foreground text-xs">{appointment.guestEmail}</span>
                                            <span className="text-muted-foreground text-xs">{appointment.guestPhone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{appointment.serviceName}</TableCell>
                                    <TableCell>{appointment.staffName || "-"}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {appointment.price} MAD
                                    </TableCell>
                                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {appointment.status === 'PENDING' && onAction && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => onAction('confirm', appointment)}
                                                        title={t('confirm', { defaultMessage: "Confirm" })}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => onAction('reject', appointment)}
                                                        title={t('reject', { defaultMessage: "Reject" })}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {scope === 'business' && onAction && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-green-600"
                                                        onClick={() => onAction('whatsapp', appointment)}
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-blue-600"
                                                        onClick={() => onAction('email', appointment)}
                                                        title="Email"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('actions', { defaultMessage: "Actions" })}</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => navigator.clipboard.writeText(appointment.id.toString())}
                                                    >
                                                        {t('copyId', { defaultMessage: "Copy ID" })}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {appointment.status === 'CONFIRMED' && new Date(appointment.startTime) < new Date() && (
                                                        <DropdownMenuItem
                                                            onClick={async () => {
                                                                try {
                                                                    const token = scope === 'admin'
                                                                        ? localStorage.getItem('admin_token')
                                                                        : localStorage.getItem('business_token');
                                                                    const response = await fetch(`/api/admin/appointments/${appointment.id}/complete`, {
                                                                        method: 'PUT',
                                                                        headers: {
                                                                            'Authorization': `Bearer ${token}`
                                                                        }
                                                                    });
                                                                    if (response.ok) {
                                                                        toast.success('Appointment marked as completed');
                                                                        fetchAppointments();
                                                                    } else {
                                                                        const data = await response.json();
                                                                        toast.error(data.error || 'Failed to mark as completed');
                                                                    }
                                                                } catch (error) {
                                                                    toast.error('An error occurred');
                                                                }
                                                            }}
                                                            className="text-green-600"
                                                        >
                                                            <Check className="mr-2 h-4 w-4" />
                                                            {t('markAsCompleted', { defaultMessage: "Mark as Completed" })}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => setRescheduleAppointment(appointment)}>
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {t('reschedule', { defaultMessage: "Reschedule" })}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <RescheduleModal
                isOpen={!!rescheduleAppointment}
                onClose={() => setRescheduleAppointment(null)}
                appointment={rescheduleAppointment}
                locale={locale}
                onSuccess={fetchAppointments}
            />
        </>
    );
}
