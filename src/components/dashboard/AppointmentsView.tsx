"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MoneyCard } from '@/components/appointments/MoneyCard';
import { FilterRibbon } from '@/components/appointments/FilterRibbon';
import { AppointmentTable } from '@/components/appointments/AppointmentTable';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function AppointmentsView({ onAction }: { onAction?: (action: string, appointment: any) => void }) {
    const t = useTranslations('appointments');
    const [tenantId, setTenantId] = useState<string>('ALL');
    const [businesses, setBusinesses] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [status, setStatus] = useState<string>('ALL');
    const [search, setSearch] = useState('');

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

    const handleExportCSV = () => {
        // TODO: Implement CSV export with current filters
        toast.info('Exporting CSV...');
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
                    locale="en"
                />
            </div>

            <AppointmentTable
                scope="admin"
                tenantId={tenantId}
                locale="en"
                dateRange={dateRange}
                status={status}
                search={search}
                onSelectionChange={() => { }}
                onAction={onAction}
            />
        </div>
    );
}
