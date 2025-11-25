"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ArrowLeft, Loader2, MapPin, Search, Store, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
    const t = useTranslations('booking');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();

    const [businesses, setBusinesses] = useState<any[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAllBusinesses();
    }, []);

    useEffect(() => {
        // Filter businesses based on search query
        if (searchQuery.trim() === '') {
            setFilteredBusinesses(businesses);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = businesses.filter(b =>
                b.nameEn?.toLowerCase().includes(query) ||
                b.nameFr?.toLowerCase().includes(query) ||
                b.nameAr?.toLowerCase().includes(query) ||
                b.businessType?.toLowerCase().includes(query) ||
                b.address?.toLowerCase().includes(query)
            );
            setFilteredBusinesses(filtered);
        }
    }, [searchQuery, businesses]);

    const loadAllBusinesses = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('Fetching businesses from API...');
            const response = await fetch('/api/public/tenants');

            console.log('API Response status:', response.status);
            const data = await response.json();
            console.log('API Response data:', data);

            if (response.ok) {
                const tenants = data.tenants || [];
                console.log('Businesses loaded:', tenants.length);
                setBusinesses(tenants);
                setFilteredBusinesses(tenants);

                if (tenants.length === 0) {
                    console.warn('No businesses found in database');
                }
            } else {
                const errorMsg = data.message || data.error || 'Failed to load businesses';
                console.error('API Error:', errorMsg);
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Failed to load businesses:', error);
            const errorMsg = error instanceof Error ? error.message : 'Network error';
            setError(errorMsg);
            toast.error('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBusinessSelect = (slug: string) => {
        console.log('Navigating to business:', slug);
        router.push(`/${locale}/book/${slug}`);
    };

    const getBusinessName = (business: any) => {
        if (locale === 'fr') return business.nameFr || business.nameEn;
        if (locale === 'ar') return business.nameAr || business.nameEn;
        return business.nameEn || business.name;
    };

    const getBusinessAbout = (business: any) => {
        if (locale === 'fr') return business.aboutFr;
        if (locale === 'ar') return business.aboutAr;
        return business.aboutEn;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading businesses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-semibold">Maw3idokom</span>
                    </Link>
                    <LanguageSwitcher />
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                            <Store className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Find a Business
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Select a business to book an appointment. Browse our partners and choose the perfect service for you.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by business name, type, or location..."
                                className="pl-12 h-14 text-lg border-2 focus:border-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <p className="text-destructive font-medium">Failed to load businesses</p>
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                    <Button onClick={loadAllBusinesses} variant="outline">
                                        Try Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Results Count */}
                    {!error && businesses.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
                                {searchQuery && ` matching "${searchQuery}"`}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Business Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBusinesses.length === 0 && !error ? (
                            <div className="col-span-full">
                                <Card className="border-dashed">
                                    <CardContent className="pt-12 pb-12">
                                        <div className="text-center space-y-4">
                                            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full">
                                                <Store className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-semibold">
                                                    {searchQuery ? 'No businesses found matching your search' : 'No businesses available'}
                                                </h3>
                                                <p className="text-muted-foreground max-w-md mx-auto">
                                                    {searchQuery
                                                        ? 'Try adjusting your search terms or browse all businesses.'
                                                        : 'There are currently no businesses registered on our platform. Please check back later.'
                                                    }
                                                </p>
                                            </div>
                                            {searchQuery && (
                                                <Button onClick={() => setSearchQuery('')} variant="outline">
                                                    Show all businesses
                                                </Button>
                                            )}
                                            <div className="pt-4">
                                                <Button onClick={() => router.push('/')} variant="ghost">
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                    Back to home
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            filteredBusinesses.map((business) => (
                                <Card
                                    key={business.id}
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] border-2 hover:border-primary/50"
                                    onClick={() => handleBusinessSelect(business.slug)}
                                >
                                    {/* Business Image/Logo */}
                                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                                        {business.logo ? (
                                            <img
                                                src={business.logo}
                                                alt={getBusinessName(business)}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Store className="h-20 w-20 text-primary/30" />
                                            </div>
                                        )}
                                        {business.businessType && (
                                            <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur">
                                                {business.businessType}
                                            </Badge>
                                        )}
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start gap-2">
                                            <span className="group-hover:text-primary transition-colors">
                                                {getBusinessName(business)}
                                            </span>
                                        </CardTitle>
                                        {business.address && (
                                            <CardDescription className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                                <span className="line-clamp-1">{business.address}</span>
                                            </CardDescription>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {getBusinessAbout(business) && (
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {getBusinessAbout(business)}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            {business.serviceCount !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {business.serviceCount} {business.serviceCount === 1 ? 'service' : 'services'}
                                                </span>
                                            )}
                                        </div>

                                        <Button className="w-full group-hover:bg-primary/90 group-hover:scale-105 transition-all">
                                            Book Appointment
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Debug Info (only in development) */}
                    {process.env.NODE_ENV === 'development' && businesses.length > 0 && (
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-sm">Debug Info</CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-2">
                                <p>Total businesses in database: {businesses.length}</p>
                                <p>Filtered businesses: {filteredBusinesses.length}</p>
                                <p>Current locale: {locale}</p>
                                {businesses[0] && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer font-medium">Sample Business Data</summary>
                                        <pre className="mt-2 p-2 bg-background rounded text-[10px] overflow-auto">
                                            {JSON.stringify(businesses[0], null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
