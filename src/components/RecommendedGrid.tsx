"use client";

import { useTranslations } from 'next-intl';
import { Star, MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface Business {
    id: number;
    slug: string;
    nameEn: string;
    nameFr: string;
    nameAr: string;
    aboutEn: string | null;
    aboutFr: string | null;
    aboutAr: string | null;
    logoUrl: string | null;
    type: string;
    addressEn: string | null;
    addressFr: string | null;
    addressAr: string | null;
    images?: string[];
}

export default function RecommendedGrid() {
    const t = useTranslations('landing');
    const tBooking = useTranslations('booking');
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const response = await fetch('/api/businesses');
            if (response.ok) {
                const data = await response.json();
                // Get first 8 businesses
                setBusinesses(data.slice(0, 8));
            }
        } catch (error) {
            console.error('Failed to fetch businesses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBusinessName = (business: Business) => {
        return business.nameEn || business.nameFr || business.nameAr || 'Business';
    };

    const getBusinessLocation = (business: Business) => {
        return business.addressEn || business.addressFr || business.addressAr || 'Location';
    };

    const getBusinessImage = (business: Business) => {
        // Try to get first gallery image, fallback to logo, then placeholder
        if (business.images && business.images.length > 0) {
            return business.images[0];
        }
        if (business.logoUrl) {
            return business.logoUrl;
        }
        return `https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent(getBusinessName(business))}`;
    };

    if (loading) {
        return (
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center text-gray-500">
                        {tBooking('loading')}
                    </div>
                </div>
            </section>
        );
    }

    if (businesses.length === 0) {
        return null; // Don't show section if no businesses
    }

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    {t('recommended')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {businesses.map((business) => (
                        <div
                            key={business.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                        >
                            {/* Cover Image */}
                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                                <img
                                    src={getBusinessImage(business)}
                                    alt={getBusinessName(business)}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.src = `https://placehold.co/400x300/e5e7eb/6b7280?text=${encodeURIComponent(getBusinessName(business))}`;
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                {/* Name and Rating */}
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-gray-900 truncate">
                                        {getBusinessName(business)}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-semibold text-gray-900">5.0</span>
                                        <span className="text-sm text-gray-500">(New)</span>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm truncate">
                                        {getBusinessLocation(business)}
                                    </span>
                                </div>

                                {/* Book Button */}
                                <Link href={`/book/${business.slug}`} className="block">
                                    <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium">
                                        {t('bookNow')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
