import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this exists or I'll create it

interface UseRevenueProps {
    tenantId?: string;
    from?: Date;
    to?: Date;
    status?: string;
}

export function useRevenue({ tenantId, from, to, status }: UseRevenueProps) {
    const [totalMAD, setTotalMAD] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Debounce the params to avoid too many requests
    // const debouncedParams = useDebounce({ tenantId, from, to, status }, 300);

    useEffect(() => {
        const fetchRevenue = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (tenantId) params.append('tenantId', tenantId);
                if (from) params.append('from', from.toISOString());
                if (to) params.append('to', to.toISOString());
                if (status && status !== 'ALL') params.append('status', status);

                const response = await fetch(`/api/appointments/revenue?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setTotalMAD(data.total || 0);
                }
            } catch (error) {
                console.error('Failed to fetch revenue', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRevenue();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [tenantId, from, to, status]);

    return { totalMAD, isLoading };
}
