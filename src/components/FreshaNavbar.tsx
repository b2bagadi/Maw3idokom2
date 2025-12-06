"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FreshaNavbar() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('Maw3idokom');
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.siteName) setSiteName(data.siteName);
      }
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left on LTR, Right on RTL */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <span className="text-2xl font-bold text-gray-900">{siteName}</span>
          </Link>

          {/* Desktop Navigation - Right on LTR, Left on RTL */}
          <nav className="hidden lg:flex items-center gap-6">
            {/* For Business Link */}
            <Link
              href="/business/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              {t('forBusiness')}
            </Link>

            {/* Divider */}
            <div className="h-5 w-px bg-gray-300" />

            {/* Client Log In Link */}
            <Link
              href="/client/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              {tCommon('login')}
            </Link>

            {/* Sign Up Button */}
            <Link href="/client/register">
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium px-6 shadow-sm">
                {t('signUp')}
              </Button>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <Link
              href="/business/login"
              className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('forBusiness')}
            </Link>

            <Link
              href="/client/login"
              className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {tCommon('login')}
            </Link>

            <Link href="/client/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium">
                {t('signUp')}
              </Button>
            </Link>

            <div className="pt-4 border-t border-gray-200">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
