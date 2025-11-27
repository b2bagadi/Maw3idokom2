"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Calendar, Sparkles, TrendingUp, Clock, CheckCircle, Zap } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Calendars */}
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <Calendar className="w-32 h-32 text-indigo-600" strokeWidth={1} />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed opacity-15" style={{ animationDelay: '1s' }}>
          <Calendar className="w-40 h-40 text-purple-600" strokeWidth={1} />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-float opacity-10" style={{ animationDelay: '2s' }}>
          <Calendar className="w-36 h-36 text-pink-600" strokeWidth={1} />
        </div>

        {/* Floating Clocks */}
        <div className="absolute top-1/3 right-10 animate-spin-slow opacity-20">
          <Clock className="w-28 h-28 text-blue-600" strokeWidth={1} />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-spin-slow opacity-15" style={{ animationDelay: '1.5s' }}>
          <Clock className="w-32 h-32 text-indigo-600" strokeWidth={1} />
        </div>

        {/* Floating Checkmarks */}
        <div className="absolute top-1/2 left-20 animate-bounce-slow opacity-25">
          <CheckCircle className="w-24 h-24 text-green-600" strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-bounce-slow opacity-20" style={{ animationDelay: '0.8s' }}>
          <CheckCircle className="w-28 h-28 text-emerald-600" strokeWidth={1.5} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 animate-fade-in sticky top-0 z-50 shadow-sm">
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
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200 animate-fade-in">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Save Time, Book Smart</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-[fade-in_1s_ease-out,scale-in_1s_ease-out] leading-tight">
              {t('landing.hero')}
            </h1>

            <p className="text-2xl md:text-3xl font-semibold text-gray-700 animate-[fade-in_1s_ease-out_0.3s_backwards,slide-up_1s_ease-out_0.3s_backwards]">
              {t('landing.subtitle')}
            </p>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-[fade-in_1s_ease-out_0.5s_backwards]">
              ⚡ Instant Booking • 📅 Real-Time Availability • ✅ No More Waiting
            </p>
          </div>

          {/* Hero Buttons with Animations */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center pt-8 animate-[fade-in_1s_ease-out_0.7s_backwards]">

            {/* Business Group */}
            <div className="flex flex-col gap-4 w-full md:w-auto items-center">
              <Link
                href="/business/signup"
                className="group inline-flex items-center justify-center w-full md:w-auto text-lg px-10 py-6 font-bold rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer relative z-10 hover:scale-105 hover:-translate-y-1"
                style={{ pointerEvents: 'auto' }}
              >
                <Sparkles className="h-6 w-6 mr-3 group-hover:animate-spin" />
                <span className="text-white drop-shadow-lg">{t('landing.joinButton')}</span>
                <Sparkles className="h-6 w-6 ml-3 group-hover:animate-spin" />
              </Link>

              {/* Business Login Button */}
              <Link
                href="/business/login"
                className="inline-flex items-center justify-center w-full md:w-auto text-base px-8 py-3 font-semibold rounded-xl bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 cursor-pointer z-10 hover:scale-105"
                style={{ pointerEvents: 'auto' }}
              >
                <span>{tCommon('businessLogin')}</span>
              </Link>
            </div>

            {/* Client Group */}
            <div className="flex flex-col gap-4 w-full md:w-auto items-center">
              <Link
                href="/client/register"
                className="group inline-flex items-center justify-center w-full md:w-auto text-lg px-10 py-6 font-bold rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 cursor-pointer z-10 hover:scale-105 hover:-translate-y-1"
                style={{ pointerEvents: 'auto' }}
              >
                <Calendar className="h-6 w-6 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-white drop-shadow-lg">{t('landing.getStarted')}</span>
              </Link>

              {/* Client Login Button */}
              <Link
                href="/client/login"
                className="inline-flex items-center justify-center w-full md:w-auto text-base px-8 py-3 font-semibold rounded-xl bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 cursor-pointer z-10 hover:scale-105"
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
        <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
          {t('landing.features')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">{t('landing.feature1Title')}</CardTitle>
              <CardDescription className="text-base text-gray-600">{t('landing.feature1Description')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">{t('landing.feature2Title')}</CardTitle>
              <CardDescription className="text-base text-gray-600">{t('landing.feature2Description')}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-pink-100 hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">{t('landing.feature3Title')}</CardTitle>
              <CardDescription className="text-base text-gray-600">{t('landing.feature3Description')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl shadow-purple-500/50">
          <CardContent className="py-16 px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('landing.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/business/signup">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-bold shadow-xl hover:scale-105 transition-all">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('landing.joinButton')}
                </Button>
              </Link>
              <Link href="/client/register">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl font-bold hover:scale-105 transition-all">
                  <Calendar className="mr-2 h-5 w-5" />
                  {t('landing.getStarted')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          </Card>

          <Card className="transition-all duration-300 hover:shadow-2xl animate-slide-up border-2 hover:border-primary/50" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src="/images/landing/icon-clock.png"
                  alt="Clock icon"
                  fill
                  className="object-contain"
                />
              </div>
              <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('landing.availabilityTitle')}
              </CardTitle>
              <CardDescription>
                {t('landing.availabilityDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-2xl animate-slide-up border-2 hover:border-secondary/50" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src="/images/landing/icon-check.png"
                  alt="Check circle icon"
                  fill
                  className="object-contain"
                />
              </div>
              <CardTitle className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                {t('landing.bookingTitle')}
              </CardTitle>
              <CardDescription>
                {t('landing.bookingDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-2xl animate-slide-up border-2 hover:border-accent/50" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <TrendingUp className="h-12 w-12 mb-4 text-accent" />
              <CardTitle className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                {t('landing.analyticsTitle')}
              </CardTitle>
              <CardDescription>
                {t('landing.analyticsDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <Card className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground transition-all duration-300 hover:shadow-2xl overflow-hidden">
          <div className="absolute inset-0 animate-shimmer"></div>
          <CardHeader className="text-center space-y-4 relative z-10">
            <CardTitle className="text-3xl md:text-4xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-primary-foreground/90 text-lg">
              <strong>Contact us</strong> and we’ll set everything up for you.
            </CardDescription>
            <div className="pt-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="transition-colors duration-200 hover:shadow-xl">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20 bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t('landing.footer')}</p>
        </div>
      </footer>
    </div>
  );
}