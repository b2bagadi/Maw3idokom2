"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, Mail, Phone, Filter, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
    id: number;
    status: string;
    startTime: string;
    endTime: string;
    notes: string | null;
    createdAt: string;
    business: string;
    service: string;
    price: number;
    duration: number;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isRegistered: boolean;
    appointments: Appointment[];
    stats: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalCustomers: 0,
        registeredCustomers: 0,
        guestCustomers: 0,
        totalAppointments: 0,
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [customers, statusFilter, dateFilter, searchQuery]);

    const fetchCustomers = async (status?: string, startDate?: string, endDate?: string) => {
        setIsLoading(true);
        try {
            let url = '/api/admin/customers';
            const params = new URLSearchParams();

            if (status && status !== 'all') params.append('status', status);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok && data.success) {
                setCustomers(data.customers);
                setStats(data.stats);
            } else {
                toast.error('Failed to load customers');
            }
        } catch (error) {
            toast.error('Error loading customers');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...customers];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query)
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate: Date;

            switch (dateFilter) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                default:
                    startDate = new Date(0);
            }

            filtered = filtered.map(customer => {
                const filteredAppointments = customer.appointments.filter(apt =>
                    new Date(apt.startTime) >= startDate
                );

                if (filteredAppointments.length === 0) return null;

                return {
                    ...customer,
                    appointments: filteredAppointments,
                };
            }).filter(c => c !== null) as Customer[];
        }

        setFilteredCustomers(filtered);
    };

    const toggleCustomer = (customerId: string) => {
        const newExpanded = new Set(expandedCustomers);
        if (newExpanded.has(customerId)) {
            newExpanded.delete(customerId);
        } else {
            newExpanded.add(customerId);
        }
        setExpandedCustomers(newExpanded);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
            case 'CONFIRMED': return 'bg-green-500/10 text-green-600 border-green-200';
            case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'CANCELLED': return 'bg-red-500/10 text-red-600 border-red-200';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Customers & Appointments</h1>
                <p className="text-muted-foreground mt-1">Manage all customers and their bookings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Customers</p>
                                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Registered</p>
                                <p className="text-2xl font-bold text-green-600">{stats.registeredCustomers}</p>
                            </div>
                            <Users className="h-8 w-8 text-green-600/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Guests</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.guestCustomers}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Appointments</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.totalAppointments}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-600/20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="All Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Customers List */}
            <div className="space-y-4">
                {filteredCustomers.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground">No customers found matching your filters</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredCustomers.map((customer) => (
                        <Card key={customer.id} className="overflow-hidden">
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleCustomer(customer.id)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-lg">{customer.name}</CardTitle>
                                            <Badge variant="outline" className={customer.isRegistered ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}>
                                                {customer.isRegistered ? 'Registered' : 'Guest'}
                                            </Badge>
                                        </div>
                                        <CardDescription className="mt-1 flex items-center gap-4 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {customer.email}
                                            </span>
                                            {customer.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {customer.phone}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:flex gap-3">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Total</p>
                                                <p className="font-bold">{customer.stats.total}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-yellow-600">Pending</p>
                                                <p className="font-bold text-yellow-600">{customer.stats.pending}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-green-600">Confirmed</p>
                                                <p className="font-bold text-green-600">{customer.stats.confirmed}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-blue-600">Completed</p>
                                                <p className="font-bold text-blue-600">{customer.stats.completed}</p>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="sm">
                                            {expandedCustomers.has(customer.id) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedCustomers.has(customer.id) && (
                                <CardContent className="border-t bg-muted/30">
                                    <div className="space-y-3 py-4">
                                        <h4 className="font-semibold text-sm">Appointments ({customer.appointments.length})</h4>
                                        {customer.appointments.map((apt) => (
                                            <div key={apt.id} className="bg-background rounded-lg p-4 border">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge className={getStatusColor(apt.status)}>
                                                                {apt.status}
                                                            </Badge>
                                                            <span className="text-sm font-medium">{apt.business}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {apt.service} • {apt.price} MAD • {apt.duration} min
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatDate(apt.startTime)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {apt.notes && (
                                                    <p className="text-sm text-muted-foreground italic mt-2 border-t pt-2">
                                                        Note: {apt.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
