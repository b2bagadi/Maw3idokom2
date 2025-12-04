"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ContactSuccessPage() {
    const t = useTranslations('contact');

    return (
        <div className="container mx-auto px-4 py-24 flex justify-center items-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
                    <CardDescription className="text-xl mt-2">
                        We've received your message and will be in touch soon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                        In the meantime, feel free to explore our platform or create an account.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button asChild size="lg">
                            <Link href="/">Back to Home</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/business/signup">Create Account</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
