"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Loader2, Check, X, CalendarClock, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MoneyCard } from '@/components/appointments/MoneyCard';
import { FilterRibbon } from '@/components/appointments/FilterRibbon';
import { RescheduleModal } from '@/components/appointments/RescheduleModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AdminAppointmentsPage() {
    const t = useTranslations('appointments');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [status, setStatus] = useState<string>('ALL');
    const [search, setSearch] = useState('');
    const [tenantId, setTenantId] = useState<string>('ALL');
    const [businesses, setBusinesses] = useState<any[]>([]);

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await fetch('/api/admin/businesses');
                if (response.ok) {
                    const data = await response.json();
                    setBusinesses(data.businesses);
                }
            } catch (error) {
                console.error('Failed to fetch businesses:', error);
            }
        };
        fetchBusinesses();
    }, []);

    // Reschedule Modal
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchAppointments();
    }, [dateRange, status, debouncedSearch, tenantId]);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange?.from) params.append('from', dateRange.from.toISOString());
            if (dateRange?.to) params.append('to', dateRange.to.toISOString());

            if (status !== 'ALL') params.append('status', status);
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (tenantId !== 'ALL') params.append('tenantId', tenantId);

            const response = await fetch(`/api/admin/appointments?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setAppointments(data.appointments);
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            const response = await fetch(`/api/appointments/bulk-confirm`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id], status: newStatus }),
            });

            if (response.ok) {
                toast.success(`Appointment ${newStatus.toLowerCase()}`);
                fetchAppointments();
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleExportCSV = () => {
        // Basic CSV export implementation
        const headers = ['ID', 'Business', 'Client', 'Phone', 'Service', 'Staff', 'Date', 'Time', 'Status', 'Price'];
        const csvContent = [
            headers.join(','),
            ...appointments.map(apt => [
                apt.id,
                `"${apt.tenant?.name || ''}"`,
                `"${apt.guestName || apt.customer?.firstName || ''}"`,
                `"${apt.guestPhone || apt.customer?.phone || ''}"`,
                `"${apt.service?.nameEn || ''}"`,
                `"${apt.staff?.nameEn || ''}"`,
                format(new Date(apt.startTime), 'yyyy-MM-dd'),
                `${format(new Date(apt.startTime), 'HH:mm')} - ${format(new Date(apt.endTime), 'HH:mm')}`,
                apt.status,
                apt.service?.price
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `appointments_export_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case 'CONFIRMED': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
            case 'REJECTED': return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
            case 'CANCELLED': return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
            case 'COMPLETED': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Appointments</h1>
                    <p className="text-muted-foreground">Manage all appointments across businesses.</p>
                </div>

                <div className="flex gap-4 items-start">
                    <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <div className="w-full md:w-64">
                        <MoneyCard
                            tenantId={tenantId === 'ALL' ? undefined : tenantId}
                            dateRange={dateRange}
                            status={status}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Select value={tenantId} onValueChange={setTenantId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Business" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Businesses</SelectItem>
                            {businesses.map((b) => (
                                <SelectItem key={b.id} value={b.id.toString()}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <FilterRibbon
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    status={status}
                    setStatus={setStatus}
                    search={search}
                    setSearch={setSearch}
                    locale="en" // Should come from params or context
                />
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Business</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((apt) => (
                                <TableRow key={apt.id}>
                                    <TableCell>#{apt.id}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{apt.tenant?.name}</div>
                                        <div className="text-xs text-muted-foreground">{apt.tenant?.slug}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{apt.guestName || apt.customer?.firstName}</div>
                                        <div className="text-xs text-muted-foreground">{apt.guestPhone || apt.customer?.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{apt.service?.nameEn}</div>
                                        <div className="text-xs text-muted-foreground">{apt.staff?.nameEn}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{format(new Date(apt.startTime), 'MMM d, yyyy')}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(apt.startTime), 'HH:mm')} - {format(new Date(apt.endTime), 'HH:mm')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                                    <TableCell>{apt.service?.price} MAD</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {apt.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}
                                                        title="Confirm"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleStatusUpdate(apt.id, 'REJECTED')}
                                                        title="Reject"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => {
                                                    setSelectedAppointment(apt);
                                                    setIsRescheduleOpen(true);
                                                }}
                                                title="Reschedule"
                                            >
                                                <CalendarClock className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <RescheduleModal
                isOpen={isRescheduleOpen}
                onClose={() => setIsRescheduleOpen(false)}
                appointment={selectedAppointment}
                locale="en"
                onSuccess={() => {
                    fetchAppointments();
                    setIsRescheduleOpen(false);
                }}
            />
        </div>
    );
}
