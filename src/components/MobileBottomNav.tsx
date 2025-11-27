"use client";

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Home, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

export function MobileBottomNav() {
    const pathname = usePathname();
    const locale = useLocale();

    // Hide on auth pages and admin pages
    if (pathname.includes('/auth/') || pathname.includes('/admin') || pathname.includes('/dashboard')) {
        return null;
    }

    const navItems = [
        {
            label: 'Explore',
            href: '/explore',
            icon: Home
        },
        {
            label: 'Appointments',
            href: '/appointments',
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
