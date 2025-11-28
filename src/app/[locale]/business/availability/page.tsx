"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Plus, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface WorkingHours {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isEnabled: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchWorkingHours();
    }, []);

    const fetchWorkingHours = async () => {
        try {
            const token = localStorage.getItem('business_token');
            const response = await fetch('/api/business/availability', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                // Initialize with fetched data or default values
                const hours = DAYS.map((_, dayIndex) => {
                    const existing = data.workingHours?.find((h: any) => h.dayOfWeek === dayIndex);
                    return existing || {
                        dayOfWeek: dayIndex,
                        startTime: '09:00',
                        endTime: '17:00',
                        isEnabled: dayIndex >= 1 && dayIndex <= 5, // Monday-Friday default
                    };
                });
                setWorkingHours(hours);
            }
        } catch (error) {
            toast.error('Failed to load availability');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleDay = (dayIndex: number) => {
        setWorkingHours(prev =>
            prev.map(h =>
                h.dayOfWeek === dayIndex ? { ...h, isEnabled: !h.isEnabled } : h
            )
        );
    };

    const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
        setWorkingHours(prev =>
            prev.map(h =>
                h.dayOfWeek === dayIndex ? { ...h, [field]: value } : h
            )
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('business_token');
            const response = await fetch('/api/business/availability', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workingHours }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Availability updated successfully!');
            } else {
                toast.error(data.error || 'Failed to update availability');
            }
        } catch (error) {
            toast.error('Error updating availability');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Availability & Schedule</h1>
                    <p className="text-muted-foreground mt-1">
                        Set your working hours - clients can only book during these times
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {/* Info Card */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <h3 className="font-semibold">How it works</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enable the days you're available and set your working hours. Clients will only be able to
                                book appointments during these times. Disabled days will be completely unavailable for booking.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Configure your availability for each day of the week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {workingHours.map((hours) => (
                        <div
                            key={hours.dayOfWeek}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${hours.isEnabled
                                    ? 'border-primary/20 bg-primary/5'
                                    : 'border-muted bg-muted/30'
                                }`}
                        >
                            {/* Day Toggle */}
                            <div className="flex items-center gap-3 w-32">
                                <Switch
                                    checked={hours.isEnabled}
                                    onCheckedChange={() => handleToggleDay(hours.dayOfWeek)}
                                    className="data-[state=checked]:bg-primary"
                                />
                                <Label className="font-semibold cursor-pointer" onClick={() => handleToggleDay(hours.dayOfWeek)}>
                                    {DAYS[hours.dayOfWeek]}
                                </Label>
                            </div>

                            {/* Time Inputs */}
                            {hours.isEnabled ? (
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            value={hours.startTime}
                                            onChange={(e) => handleTimeChange(hours.dayOfWeek, 'startTime', e.target.value)}
                                            className="w-32"
                                        />
                                    </div>

                                    <span className="text-muted-foreground">to</span>

                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            value={hours.endTime}
                                            onChange={(e) => handleTimeChange(hours.dayOfWeek, 'endTime', e.target.value)}
                                            className="w-32"
                                        />
                                    </div>

                                    <Badge variant="outline" className="ml-auto">
                                        {calculateDuration(hours.startTime, hours.endTime)} hours
                                    </Badge>
                                </div>
                            ) : (
                                <span className="text-muted-foreground italic flex-1">Unavailable</span>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setWorkingHours(prev =>
                                prev.map(h => ({
                                    ...h,
                                    isEnabled: h.dayOfWeek >= 1 && h.dayOfWeek <= 5,
                                    startTime: '09:00',
                                    endTime: '17:00',
                                }))
                            );
                            toast.success('Set to standard business hours (Mon-Fri, 9AM-5PM)');
                        }}
                    >
                        Standard Hours (9-5, Mon-Fri)
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            setWorkingHours(prev =>
                                prev.map(h => ({
                                    ...h,
                                    isEnabled: true,
                                    startTime: '08:00',
                                    endTime: '20:00',
                                }))
                            );
                            toast.success('Extended hours applied');
                        }}
                    >
                        Extended Hours (8AM-8PM, Daily)
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            setWorkingHours(prev =>
                                prev.map(h => ({ ...h, isEnabled: false }))
                            );
                            toast.info('All days disabled');
                        }}
                        className="text-destructive hover:text-destructive"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Disable All
                    </Button>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Active Days</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {workingHours.filter(h => h.isEnabled).length} of 7 days available for booking
                            </p>
                        </div>
                        <Badge className="text-lg px-4 py-2">
                            {calculateTotalHours(workingHours)} hours/week
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function calculateDuration(start: string, end: string): number {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const duration = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
    return Math.max(0, duration);
}

function calculateTotalHours(hours: WorkingHours[]): number {
    return hours
        .filter(h => h.isEnabled)
        .reduce((total, h) => total + calculateDuration(h.startTime, h.endTime), 0)
        .toFixed(1);
}
