"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Loader2, Store, MapPin } from 'lucide-react';
import FreshaNavbar from '@/components/FreshaNavbar';
import HeroSearch from '@/components/HeroSearch';
import CategoryRail from '@/components/CategoryRail';
import BusinessSection from '@/components/BusinessSection';
import AppointmentStats from '@/components/AppointmentStats';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BusinessCard } from '@/components/BusinessCard';
import { toast } from 'sonner';

const BusinessMap = dynamic(() => import('@/components/maps/BusinessMap'), {
  loading: () => <div className="h-[500px] w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>,
  ssr: false
});

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
  businessType?: string;
  averageRating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
}

export default function HomePage() {
  const t = useTranslations('landing');
  const tExplore = useTranslations('explore');
  const locale = useLocale();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [isMapView, setIsMapView] = useState(false);

  // Business State
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Categorized businesses (for default view)
  const [recommended, setRecommended] = useState<Business[]>([]);
  const [newBusinesses, setNewBusinesses] = useState<Business[]>([]);
  const [trending, setTrending] = useState<Business[]>([]);

  useEffect(() => {
    fetchAndCategorizeBusinesses();
  }, []);

  // Filtering Effect
  useEffect(() => {
    filterBusinesses();
  }, [searchQuery, locationQuery, allBusinesses]);

  const fetchAndCategorizeBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/tenants');
      if (response.ok) {
        const responseData = await response.json();
        const data: Business[] = responseData.tenants || [];

        console.log('Fetched businesses:', data.length);
        setAllBusinesses(data);
        setFilteredBusinesses(data); // Initial set

        // Categorize for default view
        const shuffled = [...data];
        setRecommended(shuffled.slice(0, 8));
        setNewBusinesses(shuffled.slice(8, 16));
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

  const filterBusinesses = () => {
    let filtered = allBusinesses;

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
      (b.addressEn?.toLowerCase().includes(loc) ||
        b.addressFr?.toLowerCase().includes(loc) ||
        b.addressAr?.toLowerCase().includes(loc))
      );
    }

    setFilteredBusinesses(filtered);
  };

  const handleSearch = (service: string, location: string) => {
    setSearchQuery(service);
    setLocationQuery(location);
    // If searching, likely want to show list initially unless map was already toggled, 
    // but user didn't specify. We'll keep current view or default to list if coming from specific actions.
    // However, if user searches, they expect results.
  };

  const handleToggleView = (view: 'list' | 'map') => {
    setIsMapView(view === 'map');
  };

  // Determine if we are in "Search/Result Mode" or "Landing Mode"
  // We use search query or isMapView to trigger result mode
  // OR if the user just clicked "List View" (which sets isMapView=false), we might want to show list of all?
  // Current logic: If search/location is active OR map view is active -> Result Mode.
  // Exception: What if user wants to see "List View" of ALL businesses? 
  // We can add a state `showResults` that toggles when user interacts with search/view buttons.
  const [showResults, setShowResults] = useState(false);

  // Update showResults when search or view changes via interaction
  const onSearchInteraction = (s: string, l: string) => {
    setSearchQuery(s);
    setLocationQuery(l);
    setShowResults(true);
  };

  const onViewInteraction = (view: 'list' | 'map') => {
    setIsMapView(view === 'map');
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fresha-Style Navbar */}
      <FreshaNavbar />

      {/* Hero Section with Search */}
      <HeroSearch
        onSearch={onSearchInteraction}
        onToggleView={onViewInteraction}
        currentView={isMapView ? 'map' : 'list'}
        initialService={searchQuery}
        initialLocation={locationQuery}
      />

      {/* Category Rail - Always Visible */}
      <CategoryRail
        selectedCategory={searchQuery}
        onCategorySelect={(cat) => {
          if (cat === '') {
            // Clear search
            setSearchQuery('');
            if (!locationQuery) setShowResults(false);
          } else {
            onSearchInteraction(cat, '');
          }
        }}
      />

      {/* Conditional Rendering: Results vs Default Landing */}
      {showResults ? (
        <main className="container mx-auto px-4 py-8 animate-fade-in-up">



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

          {isMapView ? (
            <div className="h-[600px] w-full border rounded-xl overflow-hidden shadow-sm relative z-0">
              {/* @ts-ignore - Business type mismatch with Map props, safe to ignore for now or cast */}
              <BusinessMap businesses={filteredBusinesses as any} />
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
                      setShowResults(false); // Go back to landing mode if filters cleared? Or just show all?
                    }}
                  >
                    {tExplore('clearFilters')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBusinesses.map((business) => (
                    // @ts-ignore - Business type mismatch
                    <BusinessCard key={business.id} business={business as any} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      ) : (
        <>
          {/* Appointment Stats Banner */}
          <AppointmentStats />

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
        </>
      )}

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