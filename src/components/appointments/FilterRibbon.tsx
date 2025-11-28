"use client";

import * as React from "react";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface FilterRibbonProps {
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    status: string;
    setStatus: (status: string) => void;
    search: string;
    setSearch: (search: string) => void;
    locale: string;
}

export function FilterRibbon({
    dateRange,
    setDateRange,
    status,
    setStatus,
    search,
    setSearch,
    locale,
}: FilterRibbonProps) {
    const t = useTranslations('appointments');

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('searchPlaceholder', { defaultMessage: "Search guest, email..." })}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t('status.all', { defaultMessage: "All Status" })} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('status.all', { defaultMessage: "All Status" })}</SelectItem>
                        <SelectItem value="PENDING">{t('status.pending', { defaultMessage: "Pending" })}</SelectItem>
                        <SelectItem value="CONFIRMED">{t('status.confirmed', { defaultMessage: "Confirmed" })}</SelectItem>
                        <SelectItem value="COMPLETED">{t('status.completed', { defaultMessage: "Completed" })}</SelectItem>
                        <SelectItem value="CANCELLED">{t('status.cancelled', { defaultMessage: "Cancelled" })}</SelectItem>
                        <SelectItem value="REJECTED">{t('status.rejected', { defaultMessage: "Rejected" })}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full md:w-[260px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>{t('pickDate', { defaultMessage: "Pick a date range" })}</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                {(dateRange || status !== 'ALL' || search) && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setDateRange(undefined);
                            setStatus('ALL');
                            setSearch('');
                        }}
                        title={t('clearFilters', { defaultMessage: "Clear filters" })}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
