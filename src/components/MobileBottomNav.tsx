"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Home, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';

export function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        const clientToken = localStorage.getItem('client_token');
        setIsLoggedIn(!!clientToken);
    }, [pathname]);

    // Hide on landing page, auth pages, and admin pages
    // Only show if user is logged in
    const isLandingPage = pathname === `/${locale}` || pathname === '/';
    const isAuthPage = pathname.includes('/auth/') || pathname.includes('/admin') || pathname.includes('/client/login') || pathname.includes('/client/register');

    if (isLandingPage || isAuthPage || !isLoggedIn) {
        return null;
    }

    const handleNavClick = (href: string, e: React.MouseEvent) => {
        // Check if clicking on explore and user is not logged in
        if (href === '/explore') {
            const clientToken = localStorage.getItem('client_token');
            if (!clientToken) {
                e.preventDefault();
                router.push(`/${locale}/client/login`);
                return;
            }
        }
    };

    const navItems = [
        {
            label: 'Explore',
            href: '/explore',
            icon: Home
        },
        {
            label: 'Appointments',
            href: '/client/dashboard',
            icon: Calendar
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: User
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname.includes(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleNavClick(item.href, e)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
