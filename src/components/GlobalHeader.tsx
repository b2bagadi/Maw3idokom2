"use client";

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ArrowLeft } from 'lucide-react';

interface GlobalHeaderProps {
    initialLogoUrl?: string | null;
    initialSiteName?: string;
    showBackArrow?: boolean;
}

export function GlobalHeader({ initialLogoUrl, initialSiteName, showBackArrow = false }: GlobalHeaderProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
    const [siteName, setSiteName] = useState<string>(initialSiteName || 'Maw3idokom');
    const [isLoading, setIsLoading] = useState(!initialLogoUrl);

    useEffect(() => {
        if (!initialLogoUrl) {
            const fetchSettings = async () => {
                try {
                    const response = await fetch('/api/public/settings');
                    if (response.ok) {
                        const data = await response.json();
                        setLogoUrl(data.logoUrl);
                        setSiteName(data.siteName || 'Maw3idokom');
                    }
                } catch (error) {
                    console.error('Failed to fetch settings:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchSettings();
        }
    }, [initialLogoUrl]);

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                    {showBackArrow && (
                        <ArrowLeft className="h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}

                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={siteName}
                            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {siteName}
                        </span>
                    )}
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}
