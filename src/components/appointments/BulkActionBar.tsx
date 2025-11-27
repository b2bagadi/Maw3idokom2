"use client";

import { Button } from "@/components/ui/button";
import { Check, X, Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onAction: (action: 'CONFIRM' | 'REJECT' | 'EXPORT') => Promise<void>;
}

export function BulkActionBar({ selectedCount, onClearSelection, onAction }: BulkActionBarProps) {
    const t = useTranslations('appointments');
    const [isProcessing, setIsProcessing] = useState(false);

    if (selectedCount === 0) return null;

    const handleAction = async (action: 'CONFIRM' | 'REJECT' | 'EXPORT') => {
        setIsProcessing(true);
        try {
            await onAction(action);
        } catch (error) {
            console.error(error);
            toast.error(t('bulkActionError', { defaultMessage: "Action failed" }));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-foreground text-background rounded-lg shadow-lg p-4 flex items-center justify-between animate-in slide-in-from-bottom-10">
            <div className="flex items-center gap-4">
                <span className="font-medium">
                    {selectedCount} {t('selected', { defaultMessage: "selected" })}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    className="text-muted-foreground hover:text-background"
                >
                    {t('clear', { defaultMessage: "Clear" })}
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="secondary"
                    className="bg-green-600 text-white hover:bg-green-700 border-none"
                    onClick={() => handleAction('CONFIRM')}
                    disabled={isProcessing}
                >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    {t('confirm', { defaultMessage: "Confirm" })}
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction('REJECT')}
                    disabled={isProcessing}
                >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    {t('reject', { defaultMessage: "Reject" })}
                </Button>
                <div className="h-6 w-px bg-border/20 mx-2" />
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAction('EXPORT')}
                    disabled={isProcessing}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {t('export', { defaultMessage: "Export CSV" })}
                </Button>
            </div>
        </div>
    );
}
