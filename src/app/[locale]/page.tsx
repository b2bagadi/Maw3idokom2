"use client";
// Force rebuild for translations

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Calendar, Sparkles, TrendingUp, Building2, User, ArrowRight, LogIn } from 'lucide-react';
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

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Icon Elements - Moving across entire screen */}
        <div className="absolute top-[10%] left-[15%] text-primary/10 animate-float-slow">
          <Calendar className="w-12 h-12" />
        </div>
        <div className="absolute top-[25%] right-[20%] text-secondary/10 animate-float-medium" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="absolute bottom-[30%] left-[25%] text-primary/10 animate-float-fast" style={{ animationDelay: '2s' }}>
          <Building2 className="w-14 h-14" />
        </div>
        <div className="absolute top-[60%] right-[15%] text-accent/10 animate-float-slow" style={{ animationDelay: '0.5s' }}>
          <User className="w-11 h-11" />
        </div>
        <div className="absolute bottom-[15%] right-[40%] text-secondary/10 animate-float-medium" style={{ animationDelay: '1.5s' }}>
          <TrendingUp className="w-13 h-13" />
        </div>
        <div className="absolute top-[40%] left-[10%] text-primary/10 animate-float-fast" style={{ animationDelay: '3s' }}>
          <Calendar className="w-9 h-9" />
        </div>
        <div className="absolute bottom-[45%] right-[30%] text-accent/10 animate-float-slow" style={{ animationDelay: '2.5s' }}>
          <Sparkles className="w-12 h-12" />
        </div>
        <div className="absolute top-[70%] left-[35%] text-secondary/10 animate-float-medium" style={{ animationDelay: '1.2s' }}>
          <Building2 className="w-10 h-10" />
        </div>

        {/* Grid Pattern with Animation */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] animate-grid opacity-50" />
      </div>
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

          {/* Portal Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-12 animate-[fade-in_1s_ease-out_0.6s_backwards]">

            {/* Business Portal Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-8 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:rotate-3">
                  <Building2 className="w-10 h-10 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    {t('landing.businessPortal')}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {t('landing.businessDesc')}
                  </p>
                </div>

                <div className="flex flex-col w-full gap-4 pt-4">
                  <Link href="/business/signup" className="w-full">
                    <Button className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group/btn">
                      <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                      {t('landing.joinButton')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  <Link href="/business/login" className="w-full">
                    <Button variant="outline" className="w-full h-12 text-base border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all duration-300">
                      <LogIn className="mr-2 h-4 w-4" />
                      {tCommon('businessLogin')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Client Portal Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-8 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-teal-500/50 transition-all duration-500 group-hover:-rotate-3">
                  <User className="w-10 h-10 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">
                    {t('landing.clientPortal')}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {t('landing.clientDesc')}
                  </p>
                </div>

                <div className="flex flex-col w-full gap-4 pt-4">
                  <Link href="/client/register" className="w-full">
                    <Button className="w-full h-14 text-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg hover:shadow-teal-500/25 transition-all duration-300 group/btn">
                      <Calendar className="mr-2 h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
                      {t('landing.getStarted')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  <Link href="/client/login" className="w-full">
                    <Button variant="outline" className="w-full h-12 text-base border-teal-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-all duration-300">
                      <LogIn className="mr-2 h-4 w-4" />
                      {tCommon('clientLogin')}
                    </Button>
                  </Link>
                </div>
              </div>
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

          <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle>{t('landing.feature4Title')}</CardTitle>
              <CardDescription>{t('landing.feature4Description')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle>{t('landing.feature5Title')}</CardTitle>
              <CardDescription>{t('landing.feature5Description')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>{t('landing.feature6Title')}</CardTitle>
              <CardDescription>{t('landing.feature6Description')}</CardDescription>
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
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('landing.ctaButton')}
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