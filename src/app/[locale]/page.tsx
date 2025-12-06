"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar } from 'lucide-react';
import FreshaNavbar from '@/components/FreshaNavbar';
import HeroSearch from '@/components/HeroSearch';
import CategoryRail from '@/components/CategoryRail';
import BusinessSection from '@/components/BusinessSection';
import AppointmentStats from '@/components/AppointmentStats';
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
  createdAt?: string;
}

export default function HomePage() {
  const t = useTranslations('landing');
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Categorized businesses
  const [recommended, setRecommended] = useState<Business[]>([]);
  const [newBusinesses, setNewBusinesses] = useState<Business[]>([]);
  const [trending, setTrending] = useState<Business[]>([]);

  useEffect(() => {
    fetchAndCategorizeBusinesses();
  }, []);

  const fetchAndCategorizeBusinesses = async () => {
    try {
      // Use the correct API endpoint
      const response = await fetch('/api/public/tenants');
      if (response.ok) {
        const responseData = await response.json();
        // The API returns { tenants: [...], total: number }
        const data: Business[] = responseData.tenants || [];

        console.log('Fetched businesses:', data.length);
        setAllBusinesses(data);

        // Categorize businesses
        // Since we might not have metadata, we'll use simple logic:
        // - Recommended: First 8 businesses
        // - New: Next 8 businesses
        // - Trending: Random/remaining businesses

        const shuffled = [...data];

        // Recommended (first 8)
        setRecommended(shuffled.slice(0, 8));

        // New to Maw3idokom (next 8)
        setNewBusinesses(shuffled.slice(8, 16));

        // Trending (next 8 or remaining)
        setTrending(shuffled.slice(16, 24));
      } else {
        console.error('Failed to fetch businesses, status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fresha-Style Navbar */}
      <FreshaNavbar />

      {/* Hero Section with Search */}
      <HeroSearch />

      {/* Appointment Stats Banner */}
      <AppointmentStats />

      {/* Category Rail */}
      <CategoryRail />

      {/* Recommended Businesses */}
      <BusinessSection
        title={t('recommended')}
        businesses={recommended}
        loading={loading}
        showViewAll={allBusinesses.length > 8}
        viewAllLink="/explore"
      />

      {/* New to Maw3idokom */}
      {newBusinesses.length > 0 && (
        <BusinessSection
          title={t('newToMaw3idokom')}
          businesses={newBusinesses}
          showViewAll={allBusinesses.length > 16}
          viewAllLink="/explore"
        />
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <BusinessSection
          title={t('trending')}
          businesses={trending}
          showViewAll={allBusinesses.length > 24}
          viewAllLink="/explore"
        />
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-500 to-emerald-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {t('ctaTitle')}
            </h2>
            <p className="text-xl text-white/90">
              {t('ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('ctaButton')}
                </Button>
              </Link>
              <Link href="/client/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {t('getStarted')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            {t('footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}