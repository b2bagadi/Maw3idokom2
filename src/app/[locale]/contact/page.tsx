"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { GlobalHeader } from '@/components/GlobalHeader';
import { Link } from '@/i18n/routing';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    businessName: z.string().optional(),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }),
    preferredContact: z.enum(["email", "whatsapp"], {
        required_error: "You need to select a preferred contact method.",
    }),
});

export default function ContactPage() {
    const t = useTranslations('contact');
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            businessName: "",
            message: "",
            preferredContact: "email",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error('Failed to submit contact request');
            }

            // After successful save, open WhatsApp or email based on preference
            if (values.preferredContact === 'whatsapp') {
                // Format phone number for WhatsApp (remove non-digits)
                const phone = values.phone.replace(/[^\d+]/g, '');
                const message = `Hello, my name is ${values.name}.${values.businessName ? ` I'm from ${values.businessName}.` : ''}\n\n${values.message}\n\nYou can reach me at: ${values.email}`;
                const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            } else {
                // Open email client
                const subject = values.businessName
                    ? `Contact Request from ${values.name} - ${values.businessName}`
                    : `Contact Request from ${values.name}`;
                const body = `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}${values.businessName ? `\nBusiness: ${values.businessName}` : ''}\n\nMessage:\n${values.message}`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }

            toast.success("Contact request submitted successfully!");
            // Reset form
            form.reset();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[oklch(0.55_0.15_145)] to-[oklch(0.70_0.12_75)]">
            <GlobalHeader />
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-center">Contact Us</CardTitle>
                        <CardDescription className="text-center">
                            Ready to get started? Fill out the form below and we'll be in touch.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <PhoneInput
                                                        placeholder="+212 6..."
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="My Awesome Business" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us about your business needs..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preferredContact"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Preferred Contact Method</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="email" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Email
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="whatsapp" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            WhatsApp
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Message"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
