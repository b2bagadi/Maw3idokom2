"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Loader2, Mail, MessageSquare, Phone, Search, Eye, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ContactRequest {
    id: number;
    name: string;
    phone: string;
    email: string;
    businessName: string | null;
    message: string;
    preferredContact: 'email' | 'whatsapp';
    status: 'NEW' | 'REPLIED' | 'CLOSED';
    internalNotes: string | null;
    createdAt: string;
}

export default function AdminContactsPage() {
    const t = useTranslations('admin.contacts');
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
    const [internalNote, setInternalNote] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/contacts');
            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests);
            }
        } catch (error) {
            console.error('Failed to fetch contact requests:', error);
            toast.error('Failed to load contact requests');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            const response = await fetch(`/api/admin/contacts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setRequests(requests.map(r => r.id === id ? { ...r, status: status as any } : r));
                if (selectedRequest && selectedRequest.id === id) {
                    setSelectedRequest({ ...selectedRequest, status: status as any });
                }
                toast.success(`Status updated to ${status}`);
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const saveNote = async () => {
        if (!selectedRequest) return;
        try {
            const response = await fetch(`/api/admin/contacts/${selectedRequest.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ internalNotes: internalNote }),
            });

            if (response.ok) {
                setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, internalNotes: internalNote } : r));
                setSelectedRequest({ ...selectedRequest, internalNotes: internalNote });
                toast.success('Note saved');
            } else {
                throw new Error('Failed to save note');
            }
        } catch (error) {
            toast.error('Failed to save note');
        }
    };

    const filteredRequests = requests.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.phone.includes(search) ||
        (r.businessName && r.businessName.toLowerCase().includes(search.toLowerCase()))
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW': return <Badge variant="default">New</Badge>;
            case 'REPLIED': return <Badge variant="secondary">Replied</Badge>;
            case 'CLOSED': return <Badge variant="outline">Closed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Contact Requests</h1>
                <Button onClick={fetchRequests} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search requests..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Business</TableHead>
                            <TableHead>Preferred</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No contact requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{request.email}</span>
                                            <span className="text-muted-foreground">{request.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{request.businessName || '-'}</TableCell>
                                    <TableCell>
                                        {request.preferredContact === 'email' ? (
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <MessageSquare className="h-4 w-4 text-green-600" />
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(request.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setInternalNote(request.internalNotes || '');
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent className="w-[400px] sm:w-[540px]">
                                                <SheetHeader>
                                                    <SheetTitle>Contact Request Details</SheetTitle>
                                                    <SheetDescription>
                                                        Received on {format(new Date(request.createdAt), 'PPpp')}
                                                    </SheetDescription>
                                                </SheetHeader>

                                                <div className="py-6 space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
                                                            <p>{request.name}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Business</h4>
                                                            <p>{request.businessName || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                                                            <p className="flex items-center gap-2">
                                                                {request.email}
                                                                <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                                                                    <Mail className="h-3 w-3" />
                                                                </a>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                                                            <p className="flex items-center gap-2">
                                                                {request.phone}
                                                                <a href={`tel:${request.phone}`} className="text-primary hover:underline">
                                                                    <Phone className="h-3 w-3" />
                                                                </a>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Message</h4>
                                                        <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap">
                                                            {request.message}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Internal Notes</h4>
                                                        <div className="space-y-2">
                                                            <Textarea
                                                                placeholder="Add internal notes here..."
                                                                value={internalNote}
                                                                onChange={(e) => setInternalNote(e.target.value)}
                                                            />
                                                            <Button size="sm" onClick={saveNote}>Save Note</Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1"
                                                                onClick={() => {
                                                                    const url = request.preferredContact === 'whatsapp'
                                                                        ? `https://wa.me/${request.phone.replace(/\D/g, '')}`
                                                                        : `mailto:${request.email}`;
                                                                    window.open(url, '_blank');
                                                                    updateStatus(request.id, 'REPLIED');
                                                                }}
                                                            >
                                                                Reply via {request.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}
                                                            </Button>
                                                            {request.status !== 'CLOSED' && (
                                                                <Button
                                                                    variant="secondary"
                                                                    onClick={() => updateStatus(request.id, 'CLOSED')}
                                                                >
                                                                    Close Request
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
