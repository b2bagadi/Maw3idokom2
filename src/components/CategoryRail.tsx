"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Scissors, CircleUserRound, Dumbbell, Car, Stethoscope, GraduationCap, Tag, Loader2, Navigation } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

interface Category {
    id: number;
    nameEn: string;
    nameFr: string;
    nameAr: string;
    slug: string;
    icon: string;
    isActive: boolean;
}

interface CategoryRailProps {
    onCategorySelect?: (categorySlug: string) => void;
    selectedCategory?: string;
}

// Icon mapping - map icon names to Lucide components
const iconMap: Record<string, any> = {
    'Scissors': Scissors,
    'CircleUserRound': CircleUserRound,
    'Dumbbell': Dumbbell,
    'Car': Car,
    'Stethoscope': Stethoscope,
    'GraduationCap': GraduationCap,
    'Tag': Tag,
};

export default function CategoryRail({ onCategorySelect, selectedCategory }: CategoryRailProps) {
    const t = useTranslations('landing');
    const router = useRouter();
    const locale = useLocale();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/public/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (category: Category) => {
        if (onCategorySelect) {
            // Toggle logic: If currently selected, clear it.
            // Using nameEn as the filter value as per previous step logic
            const valueToToggle = category.nameEn;

            if (selectedCategory === valueToToggle) {
                onCategorySelect(''); // Deselect
            } else {
                onCategorySelect(valueToToggle);
            }
        } else {
            router.push(`/explore?category=${category.slug}`);
        }
    };

    const handleNearMe = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                router.push(`/explore?lat=${latitude}&lng=${longitude}`);
                toast.success('Finding businesses near you');
                setIsLocating(false);
            },
            (error) => {
                setIsLocating(false);
                toast.error('Unable to retrieve your location');
                console.error('Geolocation error:', error);
            }
        );
    };

    const getCategoryName = (category: Category) => {
        switch (locale) {
            case 'fr': return category.nameFr;
            case 'ar': return category.nameAr;
            default: return category.nameEn;
        }
    };

    if (isLoading) {
        return (
            <section className="bg-white py-12 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {t('categories')}
                    </h2>
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white py-12 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t('categories')}
                </h2>

                {/* Horizontal Scrolling Container */}
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 min-w-max pb-2">
                        {/* Near Me Button - Clean White Style */}
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
                                Near Me
                            </span>
                        </button>

                        {/* Category Buttons - Same Clean White Style */}
                        {categories.map((category) => {
                            const isImageUrl = category.icon?.startsWith('http://') || category.icon?.startsWith('https://');
                            const IconComponent = iconMap[category.icon] || Tag;
                            const isSelected = selectedCategory === category.nameEn;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`flex items-center gap-3 border rounded-xl px-5 py-3 transition-all duration-200 hover:shadow-md min-w-fit
                                        ${isSelected
                                            ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' // Active State
                                            : 'bg-white border-gray-200 hover:border-gray-300' // Default State
                                        }
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden
                                        ${isSelected ? 'bg-teal-100/50' : 'bg-gray-100'}
                                    `}>
                                        {isImageUrl ? (
                                            <img src={category.icon} alt={getCategoryName(category)} className="w-full h-full object-cover" />
                                        ) : (
                                            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-teal-700' : 'text-gray-600'}`} />
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium whitespace-nowrap ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>
                                        {getCategoryName(category)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
