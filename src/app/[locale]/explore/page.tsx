"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessCard, Business } from '@/components/BusinessCard';
import { Loader2, MapPin, Search, Store, Calendar, Navigation, Scissors, CircleUserRound, Dumbbell, Car, Stethoscope, GraduationCap, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import { StarRating } from '@/components/reviews/StarRating';
import { BusinessImageCarousel } from '@/components/BusinessImageCarousel';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const BusinessMap = dynamic(() => import('@/components/maps/BusinessMap'), {
    loading: () => <div className="h-[500px] w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>,
    ssr: false
});

// Icon mapping for categories
const iconMap: Record<string, any> = {
    'Scissors': Scissors,
    'CircleUserRound': CircleUserRound,
    'Dumbbell': Dumbbell,
    'Car': Car,
    'Stethoscope': Stethoscope,
    'GraduationCap': GraduationCap,
    'Tag': Tag,
};

export default function ExplorePage() {
    const t = useTranslations('booking');
    const tExplore = useTranslations('explore');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();

    // ... (state definitions kept same)
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isMapView, setIsMapView] = useState(false);

    // ... (effects and logic kept same)

    // Check URL params for filters and view mode
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const serviceParam = searchParams.get('service');
        const locationParam = searchParams.get('location');
        const viewParam = searchParams.get('view');

        if (categoryParam && categories.length > 0) {
            const cat = categories.find(c => c.slug === categoryParam);
            if (cat) {
                setSelectedCategory(String(cat.id));
            }
        }

        if (serviceParam) {
            setSearchQuery(serviceParam);
        }

        if (locationParam) {
            setLocationQuery(locationParam);
        }

        if (viewParam === 'map') {
            setIsMapView(true);
        }
    }, [searchParams, categories]);

    useEffect(() => {
        loadAllBusinesses();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterBusinesses();
    }, [searchQuery, locationQuery, selectedCategory, businesses]);

    const loadAllBusinesses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/public/tenants');
            const data = await response.json();

            if (response.ok) {
                setBusinesses(data.tenants || []);
                setFilteredBusinesses(data.tenants || []);
            } else {
                toast.error(data.message || t('failedToLoadBusinesses'));
            }
        } catch (error) {
            toast.error(t('errorLoadBusiness'));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/public/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
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
                b.businessType?.toLowerCase().includes(query))
            );
        }

        if (locationQuery.trim()) {
            const loc = locationQuery.toLowerCase();
            filtered = filtered.filter(b =>
            (b.address?.toLowerCase().includes(loc) ||
                b.addressEn?.toLowerCase().includes(loc) ||
                b.addressFr?.toLowerCase().includes(loc) ||
                b.addressAr?.toLowerCase().includes(loc))
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(b =>
                b.categoryId === parseInt(selectedCategory)
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
                        toast.success(tExplore('toastFound'));
                    }
                } catch (error) {
                    toast.error(tExplore('toastError'));
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                toast.error(tExplore('toastLocationError'));
            }
        );
    };

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    };

    const handleSearch = () => {
        filterBusinesses();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const getBusinessName = (business: any) => {
        if (locale === 'fr') return business.nameFr || business.nameEn;
        if (locale === 'ar') return business.nameAr || business.nameEn;
        return business.nameEn || business.name;
    };

    const getCategoryName = (category: any) => {
        if (locale === 'fr') return category.nameFr;
        if (locale === 'ar') return category.nameAr;
        return category.nameEn;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
            <GlobalHeader />

            {/* Hero Search Section - EXACT MATCH TO LANDING PAGE */}
            <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            {tExplore('title')}
                        </h1>

                        {/* Search Pill - SAME AS LANDING PAGE */}
                        <div className="w-full max-w-3xl mx-auto">
                            {/* Desktop Search Pill */}
                            <div className="hidden md:flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 p-2">
                                {/* Service Input */}
                                <div className="flex items-center flex-1 px-4 py-2 border-r border-gray-200">
                                    <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={tExplore('searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                    />
                                </div>

                                {/* Location Input */}
                                <div className="flex items-center flex-1 px-4 py-2">
                                    <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={tExplore('locationPlaceholder')}
                                        value={locationQuery}
                                        onChange={(e) => setLocationQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                    />
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={handleSearch}
                                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:shadow-lg whitespace-nowrap"
                                >
                                    {tExplore('search')}
                                </button>
                            </div>

                            {/* Mobile Stacked Search */}
                            <div className="md:hidden space-y-3">
                                <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-4">
                                    <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={tExplore('searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-4">
                                    <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={tExplore('locationPlaceholder')}
                                        value={locationQuery}
                                        onChange={(e) => setLocationQuery(e.target.value)}
                                        className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200"
                                >
                                    {tExplore('search')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Rail - CLEAN WHITE STYLE LIKE NEAR ME */}
            <section className="bg-white py-8 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {tExplore('categories')}
                    </h2>
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-4 min-w-max pb-2">
                            {/* Near Me Button - Clean White */}
                            <button
                                onClick={handleNearMe}
                                disabled={isLocating}
                                className={`flex items-center gap-3 bg-white border rounded-xl px-5 py-3 transition-all duration-200 hover:shadow-md min-w-fit disabled:opacity-50 ${isLocating ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    {isLocating ? (
                                        <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                                    ) : (
                                        <Navigation className="w-4 h-4 text-gray-600" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                                    {tExplore('nearMe')}
                                </span>
                            </button>

                            {/* Category Buttons - Same Clean White Style */}
                            {categories.map((category) => {
                                const isImageUrl = category.icon?.startsWith('http://') || category.icon?.startsWith('https://');
                                const IconComponent = iconMap[category.icon] || Tag;
                                const isSelected = selectedCategory === String(category.id);

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(String(category.id))}
                                        className={`flex items-center gap-3 bg-white border rounded-xl px-5 py-3 transition-all duration-200 hover:shadow-md min-w-fit ${isSelected
                                            ? 'border-teal-400 bg-teal-50 ring-1 ring-teal-400'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden ${isSelected ? 'bg-teal-100' : 'bg-gray-100'
                                            }`}>
                                            {isImageUrl ? (
                                                <img src={category.icon} alt={getCategoryName(category)} className="w-full h-full object-cover" />
                                            ) : (
                                                <IconComponent className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-gray-600'}`} />
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium whitespace-nowrap ${isSelected ? 'text-teal-700' : 'text-gray-900'}`}>
                                            {getCategoryName(category)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Active Filters */}
            {selectedCategory && (
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{tExplore('filteredBy')}</span>
                        <Badge
                            variant="secondary"
                            className="cursor-pointer bg-teal-50 text-teal-700 hover:bg-teal-100"
                            onClick={() => setSelectedCategory(null)}
                        >
                            {getCategoryName(categories.find(c => String(c.id) === selectedCategory))}
                            <span className="ml-1">×</span>
                        </Badge>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {tExplore('resultsFound', { count: filteredBusinesses.length })}
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            variant={!isMapView ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsMapView(false)}
                            className="gap-2"
                        >
                            <Store className="h-4 w-4" />
                            {tExplore('viewList')}
                        </Button>
                        <Button
                            variant={isMapView ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsMapView(true)}
                            className="gap-2"
                        >
                            <MapPin className="h-4 w-4" />
                            {tExplore('viewMap')}
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
                    </div>
                ) : (
                    <>
                        {isMapView ? (
                            <div className="h-[600px] w-full border rounded-xl overflow-hidden shadow-sm relative z-0">
                                <BusinessMap businesses={filteredBusinesses} />
                            </div>
                        ) : (
                            <>
                                {filteredBusinesses.length === 0 ? (
                                    <div className="col-span-full text-center py-12 space-y-4">
                                        <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full">
                                            <Store className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">{tExplore('noResultsTitle')}</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            {tExplore('noResultsDesc')}
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setLocationQuery('');
                                                setSelectedCategory(null);
                                            }}
                                        >
                                            {tExplore('clearFilters')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredBusinesses.map((business) => (
                                            <BusinessCard key={business.id} business={business} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
