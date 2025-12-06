"use client";

import { useTranslations } from 'next-intl';
import { Scissors, CircleUserRound, Dumbbell, Car, Stethoscope, GraduationCap } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

const categories = [
    { id: 'hair', icon: Scissors, label: 'Hair' },
    { id: 'barbers', icon: CircleUserRound, label: 'Barbers' },
    { id: 'gym', icon: Dumbbell, label: 'Gym' },
    { id: 'automotive', icon: Car, label: 'Automotive' },
    { id: 'medical', icon: Stethoscope, label: 'Medical' },
    { id: 'tutors', icon: GraduationCap, label: 'Tutors' },
];

export default function CategoryRail() {
    const t = useTranslations('landing');
    const router = useRouter();

    const handleCategoryClick = (categoryId: string) => {
        router.push(`/explore?category=${categoryId}`);
    };

    return (
        <section className="bg-white py-12 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t('categories')}
                </h2>

                {/* Horizontal Scrolling Container */}
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 min-w-max pb-2">
                        {categories.map((category) => {
                            const Icon = category.icon;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl px-6 py-4 transition-all duration-200 hover:shadow-md group min-w-fit"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-base font-semibold text-gray-900 whitespace-nowrap">
                                        {category.label}
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
