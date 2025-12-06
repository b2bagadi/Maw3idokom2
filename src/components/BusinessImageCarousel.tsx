'use client';

import { useState } from 'react';
import { Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BusinessImageCarouselProps {
    images: string[];
    businessName: string;
    businessType?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export function BusinessImageCarousel({
    images,
    businessName,
    businessType,
    onClick
}: BusinessImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const displayImages = images.length > 0 ? images : [];

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    };

    const handleDotClick = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    return (
        <div className="relative h-56 bg-muted group" onClick={onClick}>
            {displayImages.length > 0 ? (
                <>
                    <img
                        src={displayImages[currentIndex]}
                        alt={`${businessName} - Image ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                    />

                    {/* Navigation Arrows - Only show if multiple images */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 text-xl font-bold"
                                aria-label="Previous image"
                            >
                                ‹
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 text-xl font-bold"
                                aria-label="Next image"
                            >
                                ›
                            </button>

                            {/* Image dots indicator */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                {displayImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => handleDotClick(index, e)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                                ? 'bg-white w-6'
                                                : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center h-full bg-primary/5">
                    <Store className="h-16 w-16 text-primary/20" />
                </div>
            )}

            <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground shadow-sm">
                {businessType || 'Business'}
            </Badge>
        </div>
    );
}
