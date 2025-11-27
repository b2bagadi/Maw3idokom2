import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, users, tenants, services } from '@/db/schema';
import { eq, and, gte, lte, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, CONFIRMED, CANCELLED, COMPLETED
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query - get all appointments with customer info
    let query = db.select({
      // Appointment info
      appointmentId: appointments.id,
      appointmentStatus: appointments.status,
      appointmentStart: appointments.startTime,
      appointmentEnd: appointments.endTime,
      appointmentNotes: appointments.notes,
      appointmentCreated: appointments.createdAt,

      // Customer info (registered users)
      customerId: users.id,
      customerEmail: users.email,
      customerFirstName: users.firstName,
      customerLastName: users.lastName,
      customerPhone: users.phone,
      customerCreated: users.createdAt,

      // Guest info (non-registered)
      guestName: appointments.guestName,
      guestEmail: appointments.guestEmail,
      guestPhone: appointments.guestPhone,

      // Business info
      businessId: tenants.id,
      businessName: tenants.nameEn,

      // Service info
      serviceName: services.nameEn,
      servicePrice: services.price,
      serviceDuration: services.duration,
    })
      .from(appointments)
      .leftJoin(users, eq(appointments.customerId, users.id))
      .leftJoin(tenants, eq(appointments.tenantId, tenants.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .orderBy(sql`${appointments.createdAt} DESC`);

    // Apply filters
    const conditions = [];

    if (status) {
      conditions.push(eq(appointments.status, status));
    }

    if (startDate) {
      conditions.push(gte(appointments.startTime, startDate));
    }

    if (endDate) {
      conditions.push(lte(appointments.startTime, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;

    // Group by customer (registered users and guests)
    const customerMap = new Map();

    results.forEach((row) => {
      let customerId: string;
      let customerName: string;
      let customerEmail: string;
      let customerPhone: string | null;
      let isRegistered: boolean;

      if (row.customerId) {
        // Registered customer
        customerId = `user_${row.customerId}`;
        customerName = `${row.customerFirstName} ${row.customerLastName}`;
        customerEmail = row.customerEmail!;
        customerPhone = row.customerPhone;
        isRegistered = true;
      } else {
        // Guest customer
        // Use email as unique identifier for guests
        customerId = `guest_${row.guestEmail}`;
        customerName = row.guestName || 'Guest';
        customerEmail = row.guestEmail!;
        customerPhone = row.guestPhone;
        isRegistered = false;
      }

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          isRegistered,
          appointments: [],
          stats: {
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
          },
        });
      }

      const customer = customerMap.get(customerId);
      customer.appointments.push({
        id: row.appointmentId,
        status: row.appointmentStatus,
        startTime: row.appointmentStart,
        endTime: row.appointmentEnd,
        notes: row.appointmentNotes,
        createdAt: row.appointmentCreated,
        business: row.businessName,
        service: row.serviceName,
        price: row.servicePrice,
        duration: row.serviceDuration,
      });

      // Update stats
      customer.stats.total++;
      switch (row.appointmentStatus) {
        case 'PENDING':
          customer.stats.pending++;
          break;
        case 'CONFIRMED':
          customer.stats.confirmed++;
          break;
        case 'COMPLETED':
          customer.stats.completed++;
          break;
        case 'CANCELLED':
          customer.stats.cancelled++;
          break;
      }
    });

    const customers = Array.from(customerMap.values());

    // Overall stats
    const overallStats = {
      totalCustomers: customers.length,
      registeredCustomers: customers.filter(c => c.isRegistered).length,
      guestCustomers: customers.filter(c => !c.isRegistered).length,
      totalAppointments: results.length,
    };

    return NextResponse.json({
      success: true,
      customers,
      stats: overallStats,
    });

  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}