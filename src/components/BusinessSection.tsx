"use client";

import { useTranslations } from 'next-intl';
import { MapPin, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BusinessCard, Business } from '@/components/BusinessCard';

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
                        <BusinessCard key={business.id} business={business} />
                    ))}
                </div>
            </div>
        </section>
    );
}
