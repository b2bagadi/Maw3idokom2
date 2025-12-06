'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

// Dynamically import Map to avoid SSR issues with Leaflet
const BusinessMap = dynamic(() => import('./BusinessMap'), {
    loading: () => <div className="h-[400px] flex items-center justify-center bg-muted"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>,
    ssr: false
});

interface LocationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    businesses: any[];
    selectedBusinessSlug: string;
    businessName: string;
}

export function LocationDialog({ open, onOpenChange, businesses, selectedBusinessSlug, businessName }: LocationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-background z-10">
                    <DialogTitle>Location: {businessName}</DialogTitle>
                    <DialogDescription>
                        View location and nearby businesses
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 w-full relative">
                    <div className="absolute inset-0">
                        <BusinessMap
                            businesses={businesses}
                            selectedBusinessSlug={selectedBusinessSlug}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
