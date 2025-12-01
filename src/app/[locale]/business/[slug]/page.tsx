"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Loader2, MapPin, MessageSquare, Phone, Clock, Star, Check, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CalendarSlots } from '@/components/booking/CalendarSlots';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { AnimatedBackground } from '@/components/AnimatedBackground';

export default function BusinessDetailPage({ params }: { params: { slug: string } }) {
    const t = useTranslations('booking');
    const locale = useLocale();
    const router = useRouter();

    const [business, setBusiness] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);

    // Booking State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        loadBusinessData();
    }, [params.slug]);

    const loadBusinessData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/public/tenants?slug=${params.slug}`);
            const data = await response.json();

            if (response.ok && data.tenants && data.tenants.length > 0) {
                const tenant = data.tenants[0];
                setBusiness(tenant);
                setServices(tenant.services || []);
                setStaff(tenant.staff || []);
            } else {
                toast.error('Business not found');
                router.push(`/${locale}/explore`);
            }
        } catch (error) {
            toast.error('Failed to load business data');
        } finally {
            setIsLoading(false);
        }
    };

    const getLocalizedName = (obj: any) => {
        if (!obj) return '';
        if (locale === 'fr') return obj.nameFr || obj.nameEn;
        if (locale === 'ar') return obj.nameAr || obj.nameEn;
        return obj.nameEn || obj.name;
    };

    const getLocalizedDesc = (obj: any) => {
        if (!obj) return '';
        if (locale === 'fr') return obj.descriptionFr || obj.aboutFr;
        if (locale === 'ar') return obj.descriptionAr || obj.aboutAr;
        return obj.descriptionEn || obj.aboutEn;
    };

    const handleSlotSelect = (date: Date, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
    };

    const handleConfirmBooking = async () => {
        if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) return;

        setIsBooking(true);
        try {
            // Get customer info from local storage
            const userStr = localStorage.getItem('client_user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user) {
                toast.error('Please login to book an appointment');
                router.push(`/${locale}/auth/login`);
                return;
            }

            const [hours, minutes] = selectedTime.split(':');
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const response = await fetch('/api/public/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessSlug: params.slug,
                    serviceId: selectedService,
                    staffId: selectedStaff,
                    startTime: startDateTime.toISOString(),
                    customerId: user.id,
                    customerLanguage: locale,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Booking confirmed!');
                router.push(`/${locale}/booking/success?id=${data.appointment.id}`);
            } else {
                toast.error(data.error || 'Booking failed');
            }
        } catch (error) {
            toast.error('Failed to submit booking');
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!business) return null;

    const galleryImages = business.galleryImages ? JSON.parse(business.galleryImages) : [];
    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedStaffData = staff.find(s => s.id === selectedStaff);

    // Image carousel navigation functions
    const goToPrevious = () => {
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    const goToNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevIdx = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    const nextIdx = (currentImageIndex + 1) % galleryImages.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-orange-50/10 to-blue-50/10 dark:from-background dark:via-orange-950/5 dark:to-blue-950/5 pb-24 relative">
            {/* Animated Background */}
            <AnimatedBackground />

            <GlobalHeader showBackArrow />

            {/* Cover Image Carousel - Swipe Style with Preview */}
            <div className="relative w-full bg-gradient-to-b from-black/5 to-background border-b overflow-hidden">
                {galleryImages.length > 0 ? (
                    <div className="max-w-7xl mx-auto py-6">
                        <div className="relative">
                            {/* Image Display Area with Swipe Preview */}
                            <div className="relative flex items-center justify-center gap-4 px-4 md:px-8">
                                {/* Previous Image (Left) - Clickable */}
                                {galleryImages.length > 1 && (
                                    <button
                                        onClick={goToPrevious}
                                        className="hidden md:block w-32 lg:w-48 h-48 lg:h-64 flex-shrink-0 opacity-40 hover:opacity-70 transition-all duration-300 hover:scale-105 group"
                                    >
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/50">
                                            <img
                                                src={galleryImages[prevIdx]}
                                                alt="Previous"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            {/* Left arrow overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                                    <span className="text-2xl text-gray-800">‹</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )}

                                {/* Main/Current Image */}
                                <div className="relative flex-1 max-w-4xl">
                                    <div className="relative w-full bg-gradient-to-b from-muted/30 to-transparent rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80">
                                        <img
                                            src={galleryImages[currentImageIndex]}
                                            alt={`${getLocalizedName(business)} - Image ${currentImageIndex + 1}`}
                                            className="w-full h-full max-h-[500px] md:max-h-[600px] object-contain mx-auto transition-all duration-500"
                                        />
                                        {/* Subtle gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
                                    </div>
                                </div>

                                {/* Next Image (Right) - Clickable */}
                                {galleryImages.length > 1 && (
                                    <button
                                        onClick={goToNext}
                                        className="hidden md:block w-32 lg:w-48 h-48 lg:h-64 flex-shrink-0 opacity-40 hover:opacity-70 transition-all duration-300 hover:scale-105 group"
                                    >
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-2 border-white/50">
                                            <img
                                                src={galleryImages[nextIdx]}
                                                alt="Next"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            {/* Right arrow overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                                    <span className="text-2xl text-gray-800">›</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Mobile Navigation Buttons (Floating) */}
                            {galleryImages.length > 1 && (
                                <>
                                    <button
                                        onClick={goToPrevious}
                                        className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10"
                                    >
                                        <span className="text-2xl text-gray-800">‹</span>
                                    </button>
                                    <button
                                        onClick={goToNext}
                                        className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10"
                                    >
                                        <span className="text-2xl text-gray-800">›</span>
                                    </button>
                                </>
                            )}

                            {/* Animated Dots Indicator (Replacing Counter) */}
                            {galleryImages.length > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    {galleryImages.map((_: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`transition-all duration-300 rounded-full ${idx === currentImageIndex
                                                ? 'w-8 h-3 bg-gradient-to-r from-orange-500 to-blue-500'
                                                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                                                }`}
                                            aria-label={`Go to image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail navigation strip removed */}
                    </div>
                ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-primary/5">
                        <span className="text-muted-foreground">No images available</span>
                    </div>
                )}
            </div>

            <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl relative z-10">
                {/* Header Info - Enhanced */}
                <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/30 dark:from-card dark:to-orange-950/10 shadow-lg border border-orange-100/50 dark:border-orange-900/20">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                        {getLocalizedName(business)}
                    </h1>
                    <p className="text-muted-foreground text-lg">{getLocalizedDesc(business)}</p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {business.address && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(business.mapUrl, '_blank')}
                                className="hover:bg-orange-50 hover:border-orange-300 transition-all duration-300"
                            >
                                <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                                {business.address}
                            </Button>
                        )}
                        {business.whatsappUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-400 transition-all duration-300"
                                onClick={() => window.open(business.whatsappUrl, '_blank')}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                WhatsApp
                            </Button>
                        )}
                        {business.phone && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `tel:${business.phone}`}
                                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                            >
                                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                Call
                            </Button>
                        )}
                    </div>
                </div>

                {/* Services - Enhanced */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                        <span className="text-3xl">💼</span>
                        {t('selectService')}
                    </h2>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {services.map((service) => (
                            <AccordionItem
                                key={service.id}
                                value={service.id.toString()}
                                className="border-2 rounded-xl px-6 overflow-hidden data-[state=open]:bg-gradient-to-br data-[state=open]:from-orange-50/50 data-[state=open]:to-blue-50/50 dark:data-[state=open]:from-orange-950/20 dark:data-[state=open]:to-blue-950/20 data-[state=open]:border-orange-200 dark:data-[state=open]:border-orange-800 transition-all duration-500 hover:shadow-lg"
                            >
                                <AccordionTrigger className="hover:no-underline py-5">
                                    <div className="flex flex-1 items-center justify-between mr-4">
                                        <div className="text-left">
                                            <div className="font-bold text-lg">{getLocalizedName(service)}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                <Clock className="w-4 h-4 text-orange-500" />
                                                <span className="font-medium">{service.duration} min</span>
                                            </div>
                                        </div>
                                        <div className="font-bold text-xl bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
                                            {service.price} MAD
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-5">
                                    <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">{getLocalizedDesc(service)}</p>
                                    <Button
                                        className={cn(
                                            "w-full transition-all duration-300 font-semibold text-lg py-6",
                                            selectedService === service.id
                                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg scale-105"
                                                : "bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 hover:scale-105"
                                        )}
                                        onClick={() => setSelectedService(service.id)}
                                    >
                                        {selectedService === service.id ? (
                                            <><Check className="w-5 h-5 mr-2 animate-pulse" /> Selected</>
                                        ) : (
                                            "Select Service"
                                        )}
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Staff - Enhanced */}
                {selectedService && (
                    <div className="space-y-4 animate-fade-in">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                            <span className="text-3xl">👤</span>
                            {t('selectStaff')}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {staff.map((member) => (
                                <Card
                                    key={member.id}
                                    className={cn(
                                        "cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden group",
                                        selectedStaff === member.id
                                            ? "border-2 border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 scale-105 shadow-lg"
                                            : "border-2 hover:border-orange-300 hover:scale-105"
                                    )}
                                    onClick={() => setSelectedStaff(member.id)}
                                >
                                    {/* Gradient overlay */}
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-br from-orange-400/0 to-blue-400/0 transition-opacity duration-300",
                                        selectedStaff === member.id ? "opacity-0" : "group-hover:from-orange-400/5 group-hover:to-blue-400/5"
                                    )} />

                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-3 relative z-10">
                                        {/* Avatar with gradient ring */}
                                        <div className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300",
                                            selectedStaff === member.id
                                                ? "bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-200 dark:ring-green-800"
                                                : "bg-gradient-to-br from-orange-400 to-blue-400 text-white group-hover:scale-110"
                                        )}>
                                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                        </div>

                                        {/* Name */}
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg">{member.name}</p>
                                            {member.specialty && (
                                                <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                                    {member.specialty}
                                                </p>
                                            )}
                                        </div>

                                        {/* Selected checkmark */}
                                        {selectedStaff === member.id && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Fixed Action Button - Enhanced */}
            {selectedService && selectedStaff && (
                <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background via-background to-transparent p-4 pb-6 border-t border-orange-100 dark:border-orange-900/30 shadow-2xl backdrop-blur-sm">
                    <div className="container mx-auto max-w-4xl">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-blue-500 hover:from-orange-600 hover:via-orange-700 hover:to-blue-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Continue to Book Appointment
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] rounded-t-xl">
                                <SheetHeader className="mb-4">
                                    <SheetTitle>Select Date & Time</SheetTitle>
                                </SheetHeader>
                                <div className="h-full flex flex-col md:flex-row gap-6 pb-8 overflow-y-auto">
                                    <div className="flex-1">
                                        {selectedStaff && selectedServiceData && (
                                            <CalendarSlots
                                                staffId={selectedStaff}
                                                serviceDuration={selectedServiceData.duration}
                                                locale={locale}
                                                onSlotSelect={handleSlotSelect}
                                            />
                                        )}
                                    </div>
                                    <div className="md:w-80">
                                        {selectedServiceData && selectedStaffData && (
                                            <BookingSummary
                                                serviceName={getLocalizedName(selectedServiceData)}
                                                staffName={getLocalizedName(selectedStaffData)}
                                                date={selectedDate}
                                                time={selectedTime || undefined}
                                                price={selectedServiceData.price}
                                                duration={selectedServiceData.duration}
                                                onConfirm={handleConfirmBooking}
                                                isProcessing={isBooking}
                                                locale={locale}
                                            />
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            )}
        </div>
    );
}
