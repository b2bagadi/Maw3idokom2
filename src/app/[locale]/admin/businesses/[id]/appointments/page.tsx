"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { BusinessListSidebar } from "@/components/business/BusinessListSidebar";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { FilterRibbon } from "@/components/appointments/FilterRibbon";
import { MoneyCard } from "@/components/appointments/MoneyCard";
import { BulkActionBar } from "@/components/appointments/BulkActionBar";
import { DateRange } from "react-day-picker";
import { GlobalHeader } from "@/components/GlobalHeader";
import { toast } from "sonner";

export default function AdminAppointmentsPage({ params }: { params: { id: string } }) {
  const locale = useLocale() as 'en' | 'fr' | 'ar';
  const tenantId = params.id;

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [status, setStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleBulkAction = async (action: 'CONFIRM' | 'REJECT' | 'EXPORT') => {
    if (action === 'EXPORT') {
      // Handle export
      const queryParams = new URLSearchParams();
      queryParams.append('tenantId', tenantId);
      if (dateRange?.from) queryParams.append('from', dateRange.from.toISOString());
      if (dateRange?.to) queryParams.append('to', dateRange.to.toISOString());
      if (status !== 'ALL') queryParams.append('status', status);
      // Add selected IDs if any, or export all filtered
      if (selectedIds.length > 0) {
        queryParams.append('ids', selectedIds.join(','));
      }
      
      window.open(`/api/appointments/export?${queryParams.toString()}`, '_blank');
      return;
    }

    // Handle Confirm/Reject
    const response = await fetch('/api/appointments/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: selectedIds,
        action,
        tenantId // Admin needs to specify tenantId context if needed, or just IDs are enough
      }),
    });

    if (response.ok) {
      toast.success(`${action} successful`);
      setSelectedIds([]);
      // Trigger refresh? The table depends on filters, so maybe we need a refresh trigger
      // For now, simple state update might not be enough to refresh table.
      // We can pass a "refreshKey" to table or use a context.
      // Or just reload page (not ideal).
      // Ideally, pass a callback to Table to refetch.
      window.location.reload(); // Temporary simple fix
    } else {
      toast.error("Bulk action failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader initialSiteName="Admin Dashboard" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block h-full">
            <BusinessListSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage appointments for this business.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MoneyCard 
                tenantId={tenantId}
                dateRange={dateRange}
                status={status}
            />
          </div>

          <div className="space-y-4">
            <FilterRibbon
              dateRange={dateRange}
              setDateRange={setDateRange}
              status={status}
              setStatus={setStatus}
              search={search}
              setSearch={setSearch}
              locale={locale}
            />

            <AppointmentTable
              scope="admin"
              tenantId={tenantId}
              locale={locale}
              dateRange={dateRange}
              status={status}
              search={search}
              onSelectionChange={setSelectedIds}
            />
          </div>
        </main>
      </div>

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onAction={handleBulkAction}
      />
    </div>
  );
}
