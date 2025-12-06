"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenue } from "@/hooks/useRevenue";
import { DateRange } from "react-day-picker";
import { Loader2, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";

interface MoneyCardProps {
    tenantId?: string;
    dateRange: DateRange | undefined;
    status: string;
}

export function MoneyCard({ tenantId, dateRange, status }: MoneyCardProps) {
    const t = useTranslations('appointments');
    const { totalMAD, isLoading } = useRevenue({
        tenantId,
        from: dateRange?.from,
        to: dateRange?.to,
        status
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {t('totalRevenue', { defaultMessage: "Total Revenue (MAD)" })}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <span>{totalMAD.toLocaleString()} MAD</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
