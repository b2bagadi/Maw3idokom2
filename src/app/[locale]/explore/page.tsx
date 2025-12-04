"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Search, Store, Calendar, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import { StarRating } from '@/components/reviews/StarRating';
import { BusinessImageCarousel } from '@/components/BusinessImageCarousel';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { toast } from 'sonner';

export default function ExplorePage() {
    const t = useTranslations('booking');
    const locale = useLocale();
    const router = useRouter();

    const [businesses, setBusinesses] = useState<any[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Mock categories for now - in a real app these might come from DB
    const categories = ['Barbershop', 'Salon', 'Clinic', 'Spa', 'Gym'];

    useEffect(() => {
        loadAllBusinesses();
    }, []);

    useEffect(() => {
        filterBusinesses();
    }, [searchQuery, selectedCategory, businesses]);

    const loadAllBusinesses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/public/tenants');
            const data = await response.json();

            if (response.ok) {
                setBusinesses(data.tenants || []);
                setFilteredBusinesses(data.tenants || []);
            } else {
                toast.error(data.message || 'Failed to load businesses');
            }
        } catch (error) {
            toast.error('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const filterBusinesses = () => {
        let filtered = businesses;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
            (b.nameEn?.toLowerCase().includes(query) ||
                b.nameFr?.toLowerCase().includes(query) ||
                b.nameAr?.toLowerCase().includes(query) ||
                b.businessType?.toLowerCase().includes(query) ||
                b.address?.toLowerCase().includes(query))
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(b =>
                b.businessType?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        setFilteredBusinesses(filtered);
    };

    const handleNearMe = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`/api/public/tenants?lat=${latitude}&lng=${longitude}`);
                    const data = await response.json();

                    if (response.ok) {
                        setBusinesses(data.tenants || []);
                        toast.success('Found businesses near you');
                    }
                } catch (error) {
                    toast.error('Failed to find nearby businesses');
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                toast.error('Unable to retrieve your location');
            }
        );
    };

    const getBusinessName = (business: any) => {
        if (locale === 'fr') return business.nameFr || business.nameEn;
        if (locale === 'ar') return business.nameAr || business.nameEn;
        return business.nameEn || business.name;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative">
            {/* Animated Background */}
            <AnimatedBackground />

            <GlobalHeader />

            <main className="container mx-auto px-4 py-12 relative z-10 space-y-8">
                {/* Hero Search Section */}
                <div className="text-center space-y-6 py-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {t('findBusiness')}
                    </h1>

                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                className="pl-12 h-14 text-lg shadow-lg border-primary/20 focus:border-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                            <Button
                                variant={isLocating ? "secondary" : "outline"}
                                size="sm"
                                onClick={handleNearMe}
                                disabled={isLocating}
                                className="rounded-full"
                            >
                                {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Navigation className="w-4 h-4 mr-2" />}
                                Near Me
                            </Button>
                            <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
                            {categories.map(cat => (
                                <Badge
                                    key={cat}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    className="cursor-pointer px-4 py-1.5 rounded-full text-sm hover:bg-primary/10 transition-colors"
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBusinesses.length === 0 ? (
                            <div className="col-span-full text-center py-12 space-y-4">
                                <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full">
                                    <Store className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">{t('noBusinessesFound')}</h3>
                                <p className="text-muted-foreground">{t('tryAdjustingSearch')}</p>
                                <Button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} variant="outline">
                                    {t('clearSearch')}
                                </Button>
                            </div>
                        ) : (
                            filteredBusinesses.map((business) => {
                                // Parse gallery images
                                let galleryImages: string[] = [];
                                try {
                                    if (business.galleryImages) {
                                        galleryImages = JSON.parse(business.galleryImages);
                                    }
                                } catch (e) {
                                    galleryImages = [];
                                }

                                // Use gallery images if available, otherwise use logo
                                const displayImages = galleryImages.length > 0 ? galleryImages : (business.logo ? [business.logo] : []);

                                return (
                                    <Card
                                        key={business.id}
                                        className="group relative cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-orange-950/20 dark:via-background dark:to-blue-950/20 shadow-lg hover:shadow-2xl transition-all duration-500"
                                        onClick={() => router.push(`/${locale}/business/${business.slug}`)}
                                    >
                                        {/* Animated gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-blue-400/0 to-orange-400/0 group-hover:from-orange-400/10 group-hover:via-blue-400/10 group-hover:to-orange-400/10 transition-all duration-700" />

                                        {/* Image Carousel with enhanced styling */}
                                        <div className="relative">
                                            <BusinessImageCarousel
                                                images={displayImages}
                                                businessName={getBusinessName(business)}
                                                businessType={business.businessType || 'Business'}
                                            />
                                            {/* Gradient overlay on image */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        <CardHeader className="relative z-10 space-y-3">
                                            {/* Business Name with gradient effect */}
                                            <CardTitle className="flex justify-between items-start gap-2">
                                                <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-blue-500 transition-all duration-300 line-clamp-1 text-xl font-bold">
                                                    {getBusinessName(business)}
                                                </span>
                                            </CardTitle>

                                            {/* Rating with enhanced styling */}
                                            {business.averageRating !== undefined && (
                                                <div className="flex items-center gap-2 py-1 px-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-full w-fit">
                                                    <StarRating
                                                        rating={business.averageRating || 0}
                                                        reviewCount={business.reviewCount || 0}
                                                        size="sm"
                                                    />
                                                </div>
                                            )}

                                            {/* Address with icon */}
                                            <CardDescription className="flex items-center gap-2 text-sm">
                                                <div className="p-1.5 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30">
                                                    <MapPin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <span className="line-clamp-1">{business.address || 'No address provided'}</span>
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4 relative z-10">
                                            {/* Service count with gradient background */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-950/30 dark:to-orange-950/30 border border-orange-100 dark:border-orange-900/30">
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <div className="p-1.5 rounded-full bg-white dark:bg-background shadow-sm">
                                                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="text-muted-foreground">
                                                        {business.serviceCount || 0} {t('servicesCount')}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Book button with gradient and animation */}
                                            <Button
                                                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold shadow-md hover:shadow-xl transform transition-all duration-300 group-hover:scale-105 border-0"
                                            >
                                                <span className="flex items-center gap-2">
                                                    {t('bookAppointment')}
                                                    <Calendar className="w-4 h-4 animate-pulse" />
                                                </span>
                                            </Button>
                                        </CardContent>

                                        {/* Decorative corner accent */}
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-blue-400/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-400/20 to-orange-400/20 rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </Card>
                                );
                            })
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
