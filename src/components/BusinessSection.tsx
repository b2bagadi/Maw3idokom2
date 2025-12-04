"use client";

import { useTranslations } from 'next-intl';
import { Star, MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

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

interface BusinessSectionProps {
    title: string;
    businesses: Business[];
    loading?: boolean;
    showViewAll?: boolean;
    viewAllLink?: string;
}

export default function BusinessSection({
    title,
    businesses,
    loading = false,
    showViewAll = false,
    viewAllLink = '/explore'
}: BusinessSectionProps) {
    const t = useTranslations('landing');
    const tBooking = useTranslations('booking');

    const getBusinessName = (business: Business) => {
        return business.nameEn || business.nameFr || business.nameAr || 'Business';
    };

    const getBusinessLocation = (business: Business) => {
        return business.addressEn || business.addressFr || business.addressAr || 'Location';
    };

    const getBusinessImage = (business: Business) => {
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
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                <div className="h-48 bg-gray-200 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (businesses.length === 0) {
        return null;
    }

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {title}
                    </h2>
                    {showViewAll && (
                        <Link href={viewAllLink} className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2 transition-colors">
                            {t('viewAll')}
                            <span>→</span>
                        </Link>
                    )}
                </div>

                {/* Business Grid */}
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
