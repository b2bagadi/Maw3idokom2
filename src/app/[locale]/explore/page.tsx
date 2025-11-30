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
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <GlobalHeader />

            <main className="container mx-auto px-4 py-8 space-y-8">
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
                            filteredBusinesses.map((business) => (
                                <Card
                                    key={business.id}
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] border-2 hover:border-primary/50 overflow-hidden"
                                    onClick={() => router.push(`/${locale}/business/${business.slug}`)}
                                >
                                    <div className="relative h-48 bg-muted">
                                        {business.logo ? (
                                            <img
                                                src={business.logo}
                                                alt={getBusinessName(business)}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-primary/5">
                                                <Store className="h-16 w-16 text-primary/20" />
                                            </div>
                                        )}
                                        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground shadow-sm">
                                            {business.businessType || 'Business'}
                                        </Badge>
                                    </div>

                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start gap-2">
                                            <span className="group-hover:text-primary transition-colors line-clamp-1">
                                                {getBusinessName(business)}
                                            </span>
                                        </CardTitle>

                                        {/* Rating */}
                                        {business.averageRating !== undefined && (
                                            <div className="flex items-center gap-2 py-1">
                                                <StarRating
                                                    rating={business.averageRating || 0}
                                                    reviewCount={business.reviewCount || 0}
                                                    size="sm"
                                                />
                                            </div>
                                        )}

                                        <CardDescription className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                            <span className="line-clamp-1">{business.address || 'No address provided'}</span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {business.serviceCount || 0} {t('servicesCount')}
                                            </span>
                                        </div>
                                        <Button className="w-full group-hover:bg-primary/90">
                                            {t('bookAppointment')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
