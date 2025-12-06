"use client";

import { useTranslations } from 'next-intl';
import { MapPin, Calendar } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessImageCarousel } from '@/components/BusinessImageCarousel';
import { StarRating } from '@/components/reviews/StarRating';

export interface Business {
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
    averageRating?: number;
    reviewCount?: number;
    serviceCount?: number;
    galleryImages?: string;
}

interface BusinessCardProps {
    business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
    const t = useTranslations('landing');
    const tBooking = useTranslations('booking');
    const router = useRouter();

    const getBusinessName = (business: Business) => {
        return business.nameEn || business.nameFr || business.nameAr || 'Business';
    };

    const getBusinessLocation = (business: Business) => {
        return business.addressEn || business.addressFr || business.addressAr || 'Location';
    };

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
    const displayImages = (business.images && business.images.length > 0)
        ? business.images
        : (galleryImages.length > 0 ? galleryImages : (business.logoUrl ? [business.logoUrl] : []));

    const handleCardClick = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('client_token');

        if (token) {
            router.push(path);
        } else {
            // Redirect to login with callback URL
            // @ts-ignore - callbackUrl might not be typed in i18n router but works for query params
            router.push(`/client/login?callbackUrl=${encodeURIComponent(path)}`);
        }
    };

    return (
        <Card
            className="group relative cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-orange-950/20 dark:via-background dark:to-blue-950/20 shadow-lg hover:shadow-2xl transition-all duration-500"
            onClick={(e) => handleCardClick(e, `/business/${business.slug}`)}
        >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-blue-400/0 to-orange-400/0 group-hover:from-orange-400/10 group-hover:via-blue-400/10 group-hover:to-orange-400/10 transition-all duration-700" />

            {/* Image Carousel */}
            <div className="relative">
                <BusinessImageCarousel
                    images={displayImages}
                    businessName={getBusinessName(business)}
                    businessType={business.type || 'Business'}
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

                {/* Rating */}
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
                    <span className="line-clamp-1">{getBusinessLocation(business)}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
                {/* Service count */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-950/30 dark:to-orange-950/30 border border-orange-100 dark:border-orange-900/30">
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <div className="p-1.5 rounded-full bg-white dark:bg-background shadow-sm">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-muted-foreground">
                            {business.serviceCount || 0} {tBooking('servicesCount')}
                        </span>
                    </span>
                </div>

                {/* Book button */}
                <Button
                    onClick={(e) => handleCardClick(e, `/book/${business.slug}`)}
                    className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold shadow-md hover:shadow-xl transform transition-all duration-300 group-hover:scale-105 border-0"
                >
                    <span className="flex items-center gap-2">
                        {t('bookNow')}
                        <Calendar className="w-4 h-4 animate-pulse" />
                    </span>
                </Button>
            </CardContent>

            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-blue-400/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-400/20 to-orange-400/20 rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Card>
    );
}
