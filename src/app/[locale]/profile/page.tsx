"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, LogOut, Phone, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import { toast } from 'sonner';

export default function ProfilePage() {
    const t = useTranslations('booking');
    const locale = useLocale();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('client_user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            router.push(`/${locale}/auth/login`);
        }
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
        toast.success('Logged out successfully');
        router.push(`/${locale}/auth/login`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pb-24">
            <GlobalHeader showBackArrow />

            <main className="container mx-auto px-4 py-8 max-w-md">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                            {user.firstName?.charAt(0)}
                        </div>
                        <div>
                            <CardTitle>{user.firstName} {user.lastName}</CardTitle>
                            <p className="text-sm text-muted-foreground">Customer</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
