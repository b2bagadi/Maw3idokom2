"use client";

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';
import { GlobalHeader } from '@/components/GlobalHeader';

export default function CustomerRegisterPage() {
    const router = useRouter();
    const t = useTranslations('client');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            toast.error(t('registerErrorRequired'));
            return;
        }

        if (formData.password.length < 8) {
            toast.error(t('registerErrorPasswordLength'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error(t('registerErrorPasswordMatch'));
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/client/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || t('registerErrorGeneric'));
                return;
            }

            toast.success(t('registerSuccess'));
            router.push('/auth/login');
        } catch (error) {
            toast.error(t('registerErrorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)]">
            <GlobalHeader />
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <Card className="shadow-2xl animate-fade-in backdrop-blur-sm bg-white/95">
                        <CardHeader className="text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] rounded-full flex items-center justify-center mb-4 animate-scale-in">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] bg-clip-text text-transparent">
                                {t('registerTitle')}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {t('registerSubtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('firstName')} *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                placeholder={t('firstNamePlaceholder')}
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>{t('lastName')} *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                placeholder={t('lastNamePlaceholder')}
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label>{t('email')} *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder={t('emailPlaceholder')}
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{t('phone')}</Label>
                                    <PhoneInput
                                        value={formData.phone}
                                        onChange={(value) => setFormData({ ...formData, phone: value })}
                                        placeholder={t('phonePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <Label>{t('password')} *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={t('passwordPlaceholder')}
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{t('confirmPassword')} *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder={t('confirmPasswordPlaceholder')}
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] py-6 text-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? t('registerSubmitting') : t('registerSubmit')}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    {t('registerHaveAccount')}{' '}
                                    <Link href="/auth/login" className="text-primary hover:underline font-medium">
                                        {t('registerLoginLink')}
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
