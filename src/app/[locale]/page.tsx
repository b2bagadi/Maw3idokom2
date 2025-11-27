"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Calendar, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

import BackgroundAnimation from '@/components/BackgroundAnimation';

export default function HomePage() {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('Maw3idokom');

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (link) {
            link.href = data.logoUrl;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = data.logoUrl;
            document.head.appendChild(newLink);
          }
        }
        if (data.siteName) setSiteName(data.siteName);
      }
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      <BackgroundAnimation />

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-16 w-16 object-contain animate-scale-in transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Text with Animations */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[oklch(0.25_0.08_250)] via-[oklch(0.65_0.12_190)] to-[oklch(0.65_0.15_25)] bg-clip-text text-transparent animate-[fade-in_1s_ease-out,scale-in_1s_ease-out] transition-transform duration-300 hover:scale-105">
              {t('landing.hero')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground animate-[fade-in_1s_ease-out_0.3s_backwards,slide-up_1s_ease-out_0.3s_backwards]">
              {t('landing.subtitle')}
            </p>
          </div>

          {/* Hero Buttons with Animations */}
          <div className="flex flex-col md:flex-row gap-12 justify-center items-start pt-10 animate-[fade-in_1s_ease-out_0.6s_backwards]">

            {/* Business Group */}
            <div className="flex flex-col gap-6 w-full md:w-auto items-center">
              <Link
                href="/business/signup"
                className="inline-flex items-center justify-center w-full md:w-auto text-lg px-12 py-7 font-bold rounded-lg bg-gradient-to-r from-[oklch(0.25_0.08_250)] via-[oklch(0.65_0.12_190)] to-[oklch(0.65_0.15_25)] text-white hover:shadow-2xl hover:opacity-90 transition-all duration-300 cursor-pointer group relative z-10 hover:scale-105"
                style={{ pointerEvents: 'auto' }}
              >
                <Sparkles className="h-6 w-6 animate-spin mr-3" style={{ animationDuration: '4s' }} />
                <span>{t('landing.joinButton')}</span>
                <Sparkles className="h-6 w-6 animate-spin ml-3" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
              </Link>

              {/* Business Login Button */}
              <Link
                href="/business/login"
                className="inline-flex items-center justify-center w-full md:w-auto text-base px-8 py-4 font-semibold rounded-lg border-2 border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 cursor-pointer z-10 hover:scale-105"
                style={{ pointerEvents: 'auto' }}
              >
                <span>{tCommon('businessLogin')}</span>
              </Link>
            </div>

            {/* Client Group */}
            <div className="flex flex-col gap-6 w-full md:w-auto items-center">
              <Link
                href="/client/register"
                className="inline-flex items-center justify-center w-full md:w-auto text-lg px-12 py-7 font-bold rounded-lg bg-gradient-to-r from-[oklch(0.65_0.12_190)] to-[oklch(0.65_0.15_25)] text-white hover:shadow-2xl hover:opacity-90 transition-all duration-300 cursor-pointer z-10 hover:scale-105"
                style={{ pointerEvents: 'auto' }}
              >
                <Calendar className="h-6 w-6 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                <span>{t('landing.getStarted')}</span>
              </Link>

              {/* Client Login Button */}
              <Link
                href="/client/login"
                className="inline-flex items-center justify-center w-full md:w-auto text-base px-8 py-4 font-semibold rounded-lg border-2 border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 cursor-pointer z-10 hover:scale-105"
                style={{ pointerEvents: 'auto' }}
              >
                <span>{tCommon('clientLogin')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
          {t('landing.features')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle>{t('landing.feature1Title')}</CardTitle>
              <CardDescription>{t('landing.feature1Description')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle>{t('landing.feature2Title')}</CardTitle>
              <CardDescription>{t('landing.feature2Description')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>{t('landing.feature3Title')}</CardTitle>
              <CardDescription>{t('landing.feature3Description')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <Card className="bg-gradient-to-r from-primary to-secondary border-0">
          <CardContent className="py-16 px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('landing.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/business/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('landing.joinButton')}
                </Button>
              </Link>
              <Link href="/client/register">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  <Calendar className="mr-2 h-5 w-5" />
                  {t('landing.getStarted')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}