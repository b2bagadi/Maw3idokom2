"use client";

import { useTranslations } from 'next-intl';
import { Search, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '@/i18n/routing';

export default function HeroSearch() {
    const t = useTranslations('landing');
    const router = useRouter();
    const [service, setService] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = () => {
        // Navigate to explore page with search parameters
        const params = new URLSearchParams();
        if (service) params.set('service', service);
        if (location) params.set('location', location);

        router.push(`/explore${params.toString() ? '?' + params.toString() : ''}`);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 md:py-32">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                        {t('heroTitle')}
                    </h1>

                    {/* Search Pill */}
                    <div className="w-full max-w-3xl mx-auto">
                        {/* Desktop Search Pill */}
                        <div className="hidden md:flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 p-2">
                            {/* Service Input */}
                            <div className="flex items-center flex-1 px-4 py-2 border-r border-gray-200">
                                <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder={t('searchService')}
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                />
                            </div>

                            {/* Location Input */}
                            <div className="flex items-center flex-1 px-4 py-2">
                                <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder={t('searchLocation')}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:shadow-lg whitespace-nowrap"
                            >
                                {t('searchButton')}
                            </button>
                        </div>

                        {/* Mobile Stacked Search */}
                        <div className="md:hidden space-y-3">
                            {/* Service Input */}
                            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-4">
                                <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder={t('searchService')}
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                />
                            </div>

                            {/* Location Input */}
                            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-4">
                                <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder={t('searchLocation')}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-lg"
                            >
                                {t('searchButton')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
