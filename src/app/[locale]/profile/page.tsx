"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Lock, LogOut, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { GlobalHeader } from '@/components/GlobalHeader';
import { PhoneInput } from '@/components/ui/phone-input';
import { PasswordInputWithStrength } from '@/components/ui/PasswordInputWithStrength';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
    const router = useRouter();
    const t = useTranslations('client');
    const locale = useLocale();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const checkAuth = () => {
        const token = localStorage.getItem('client_token');
        const userData = localStorage.getItem('client_user');

        if (!token || !userData) {
            router.push(`/${locale}/client/login`);
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch (error) {
            console.error('Error parsing user data:', error);
            router.push(`/${locale}/client/login`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('client_token');
            const response = await fetch('/api/client/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });

            if (response.ok) {
                toast.success('Profile updated successfully!');
                const userData = JSON.parse(localStorage.getItem('client_user') || '{}');
                localStorage.setItem('client_user', JSON.stringify({
                    ...userData,
                    ...profileForm
                }));
                setUser({ ...user, ...profileForm });
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsUpdating(true);
        try {
            const token = localStorage.getItem('client_token');
            const response = await fetch('/api/client/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            if (response.ok) {
                toast.success('Password changed successfully!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to change password');
            }
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
        toast.success(t('logoutSuccess'));
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] pb-20 md:pb-8">
            <GlobalHeader />

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Header */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {t('dashboardWelcome')}, {user?.firstName}!
                    </h1>
                    <p className="text-white/80">{t('dashboardSubtitle')}</p>
                </div>

                {/* Profile & Settings Tabs */}
                <Tabs defaultValue="profile" className="w-full max-w-3xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10 backdrop-blur-sm">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                            <Lock className="h-4 w-4 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card className="shadow-2xl backdrop-blur-sm bg-white/95">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-4">
                                        {/* Email (Read-only) */}
                                        <div>
                                            <Label className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {t('email')}
                                            </Label>
                                            <Input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>

                                        {/* First Name */}
                                        <div>
                                            <Label>{t('firstName')}</Label>
                                            <Input
                                                value={profileForm.firstName}
                                                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                                placeholder={t('firstNamePlaceholder')}
                                            />
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <Label>{t('lastName')}</Label>
                                            <Input
                                                value={profileForm.lastName}
                                                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                                placeholder={t('lastNamePlaceholder')}
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <Label className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {t('phone')}
                                            </Label>
                                            <PhoneInput
                                                value={profileForm.phone}
                                                onChange={(value) => setProfileForm({ ...profileForm, phone: value })}
                                                placeholder={t('phonePlaceholder')}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] hover:opacity-90"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <Card className="shadow-2xl backdrop-blur-sm bg-white/95">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="space-y-4">
                                        {/* Current Password */}
                                        <div>
                                            <Label>Current Password</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                placeholder="Enter current password"
                                                autoComplete="current-password"
                                            />
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <Label>New Password</Label>
                                            <PasswordInputWithStrength
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <Label>Confirm New Password</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)] hover:opacity-90"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Changing Password...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                Change Password
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Logout Button */}
                <div className="max-w-3xl mx-auto mt-6">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('logout')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
