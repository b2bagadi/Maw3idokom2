export interface AppointmentModuleProps {
    scope: 'admin' | 'business';
    tenantId?: string;        // omitted = admin sees all
    locale: 'en' | 'fr' | 'ar';
}

export interface Appointment {
    id: number;
    tenantId: number;
    serviceId: number;
    staffId: number | null;
    customerId: number | null;
    guestName: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    // Joins
    businessName?: string;
    serviceName?: string;
    staffName?: string;
    customerName?: string;
    price?: number;
}

export interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}
