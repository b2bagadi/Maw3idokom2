"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Save, Loader2, X, Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WorkingHours {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isEnabled: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleTab() {
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [blockedTimes, setBlockedTimes] = useState<any[]>([]);

    // Blocked Time State
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
    const [blockForm, setBlockForm] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '12:00',
        endTime: '13:00',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('business_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Working Hours
            const hoursRes = await fetch('/api/business/availability', { headers });
            const hoursData = await hoursRes.json();

            if (hoursRes.ok && hoursData.success) {
                const hours = DAYS.map((_, dayIndex) => {
                    const existing = hoursData.workingHours?.find((h: any) => h.dayOfWeek === dayIndex);
                    return existing || {
                        dayOfWeek: dayIndex,
                        startTime: '09:00',
                        endTime: '17:00',
                        isEnabled: dayIndex >= 1 && dayIndex <= 5,
                    };
                });
                setWorkingHours(hours);
            }

            // Fetch Blocked Times
            const blockedRes = await fetch('/api/business/appointments?status=BLOCKED', { headers });
            const blockedData = await blockedRes.json();
            if (blockedRes.ok && blockedData.appointments) {
                setBlockedTimes(blockedData.appointments);
            }
        } catch (error) {
            toast.error('Failed to load schedule data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveHours = async () => {
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

    const handleBlockTime = async () => {
        if (!blockForm.date || !blockForm.startTime || !blockForm.endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Combine date and time
        const startDateTime = new Date(`${blockForm.date}T${blockForm.startTime}`);
        const endDateTime = new Date(`${blockForm.date}T${blockForm.endTime}`);

        if (endDateTime <= startDateTime) {
            toast.error('End time must be after start time');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('business_token');
            const response = await fetch('/api/business/appointments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'BLOCKED',
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    notes: blockForm.notes
                }),
            });

            if (response.ok) {
                toast.success('Time blocked successfully');
                setIsBlockDialogOpen(false);
                setBlockForm({
                    date: format(new Date(), 'yyyy-MM-dd'),
                    startTime: '12:00',
                    endTime: '13:00',
                    notes: ''
                });
                // Ideally refresh blocked slots list (not implemented in this view yet)
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to block time');
            }
        } catch (error) {
            toast.error('Error blocking time');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBlockedTime = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blocked time?')) return;

        setIsSaving(true);
        try {
            const token = localStorage.getItem('business_token');
            const response = await fetch(`/api/business/appointments?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Blocked time removed successfully');
                fetchData(); // Refresh list
            } else {
                toast.error('Failed to remove blocked time');
            }
        } catch (error) {
            toast.error('Error removing blocked time');
        } finally {
            setIsSaving(false);
        }
    };


    // Helper functions
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

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Schedule & Availability</h2>
                    <p className="text-muted-foreground">Manage your operating hours and block time off.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Block Time
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Block Time Off</DialogTitle>
                                <DialogDescription>
                                    Prevent clients from booking during this period.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={blockForm.date}
                                            onChange={e => setBlockForm({ ...blockForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time Range</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={blockForm.startTime}
                                                onChange={e => setBlockForm({ ...blockForm, startTime: e.target.value })}
                                            />
                                            <span>to</span>
                                            <Input
                                                type="time"
                                                value={blockForm.endTime}
                                                onChange={e => setBlockForm({ ...blockForm, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason / Note</Label>
                                    <Textarea
                                        placeholder="e.g. Lunch break, Personal appointment..."
                                        value={blockForm.notes}
                                        onChange={e => setBlockForm({ ...blockForm, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleBlockTime} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : 'Block Time'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleSaveHours} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Hours
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Working Hours</CardTitle>
                    <CardDescription>Configure your standard availability. Uncheck days you are closed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {workingHours.map((hours) => (
                        <div
                            key={hours.dayOfWeek}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${hours.isEnabled
                                ? 'bg-card'
                                : 'bg-muted/50'
                                }`}
                        >
                            <div className="flex items-center gap-3 w-32">
                                <Switch
                                    checked={hours.isEnabled}
                                    onCheckedChange={() => handleToggleDay(hours.dayOfWeek)}
                                />
                                <Label className="font-medium">
                                    {DAYS[hours.dayOfWeek]}
                                </Label>
                            </div>

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
                                        <Input
                                            type="time"
                                            value={hours.endTime}
                                            onChange={(e) => handleTimeChange(hours.dayOfWeek, 'endTime', e.target.value)}
                                            className="w-32"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground italic flex-1">Closed</span>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Blocked Times</CardTitle>
                    <CardDescription>Specific dates and times when you are unavailable.</CardDescription>
                </CardHeader>
                <CardContent>
                    {blockedTimes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>No blocked times configured</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {blockedTimes.map((blocked) => (
                                <div key={blocked.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-100 p-2 rounded-full">
                                            <X className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {format(new Date(blocked.startTime), 'EEEE, MMMM d, yyyy')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(blocked.startTime), 'HH:mm')} - {format(new Date(blocked.endTime), 'HH:mm')}
                                            </p>
                                            {blocked.notes && (
                                                <p className="text-xs text-muted-foreground mt-1 italic">
                                                    "{blocked.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDeleteBlockedTime(blocked.id)}
                                        disabled={isSaving}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
