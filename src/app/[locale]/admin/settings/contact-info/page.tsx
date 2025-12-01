"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ContactSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        adminWhatsapp: '',
        adminEmail: '',
        autoReplyTemplateEn: '',
        autoReplyTemplateFr: '',
        autoReplyTemplateAr: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/settings/contact-info');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch contact settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/settings/contact-info', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                toast.success('Settings saved successfully');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Contact Settings</h1>
                <p className="text-muted-foreground">Manage admin contact info and auto-reply templates.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Admin Contact Info</CardTitle>
                    <CardDescription>
                        These details are used for receiving notifications and as sender info.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="adminWhatsapp">Admin WhatsApp Number</Label>
                            <Input
                                id="adminWhatsapp"
                                placeholder="+212..."
                                value={settings.adminWhatsapp}
                                onChange={(e) => setSettings({ ...settings, adminWhatsapp: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adminEmail">Admin Email</Label>
                            <Input
                                id="adminEmail"
                                placeholder="admin@maw3idokom.com"
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Auto-Reply Templates</CardTitle>
                    <CardDescription>
                        Message sent to users when they submit a contact request.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>English Template</Label>
                        <Textarea
                            className="min-h-[100px]"
                            placeholder="Thank you for contacting us..."
                            value={settings.autoReplyTemplateEn}
                            onChange={(e) => setSettings({ ...settings, autoReplyTemplateEn: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>French Template</Label>
                        <Textarea
                            className="min-h-[100px]"
                            placeholder="Merci de nous avoir contacté..."
                            value={settings.autoReplyTemplateFr}
                            onChange={(e) => setSettings({ ...settings, autoReplyTemplateFr: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Arabic Template</Label>
                        <Textarea
                            className="min-h-[100px]"
                            placeholder="شكرا لتواصلكم معنا..."
                            dir="rtl"
                            value={settings.autoReplyTemplateAr}
                            onChange={(e) => setSettings({ ...settings, autoReplyTemplateAr: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
