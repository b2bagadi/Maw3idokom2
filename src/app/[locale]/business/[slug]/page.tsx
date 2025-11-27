"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Loader2, MapPin, MessageSquare, Phone, Clock, Star, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlobalHeader } from '@/components/GlobalHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CalendarSlots } from '@/components/booking/CalendarSlots';
import { BookingSummary } from '@/components/booking/BookingSummary';

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

    return (
        <div className="min-h-screen bg-background pb-24">
            <GlobalHeader showBackArrow />

            {/* Cover Image Carousel */}
            <div className="relative h-64 md:h-96 w-full bg-muted">
                {galleryImages.length > 0 ? (
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {galleryImages.map((img: string, idx: number) => (
                                <CarouselItem key={idx} className="h-64 md:h-96">
                                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                    </Carousel>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <span className="text-muted-foreground">No images available</span>
                    </div>
                )}
            </div>

            <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
                {/* Header Info */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">{getLocalizedName(business)}</h1>
                    <p className="text-muted-foreground">{getLocalizedDesc(business)}</p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        {business.address && (
                            <Button variant="outline" size="sm" onClick={() => window.open(business.mapUrl, '_blank')}>
                                <MapPin className="w-4 h-4 mr-2" />
                                {business.address}
                            </Button>
                        )}
                        {business.whatsappUrl && (
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => window.open(business.whatsappUrl, '_blank')}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                WhatsApp
                            </Button>
                        )}
                        {business.phone && (
                            <Button variant="outline" size="sm" onClick={() => window.location.href = `tel:${business.phone}`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                            </Button>
                        )}
                    </div>
                </div>

                {/* Services */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">{t('selectService')}</h2>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {services.map((service) => (
                            <AccordionItem key={service.id} value={service.id.toString()} className="border rounded-lg px-4 data-[state=open]:bg-primary/5 transition-colors">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-1 items-center justify-between mr-4">
                                        <div className="text-left">
                                            <div className="font-semibold">{getLocalizedName(service)}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3" /> {service.duration} min
                                            </div>
                                        </div>
                                        <div className="font-bold text-primary">
                                            {service.price} MAD
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <p className="text-sm text-muted-foreground mb-4">{getLocalizedDesc(service)}</p>
                                    <Button
                                        className={cn("w-full", selectedService === service.id && "bg-green-600 hover:bg-green-700")}
                                        variant={selectedService === service.id ? "default" : "secondary"}
                                        onClick={() => setSelectedService(service.id)}
                                    >
                                        {selectedService === service.id ? (
                                            <><Check className="w-4 h-4 mr-2" /> Selected</>
                                        ) : (
                                            "Select Service"
                                        )}
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Staff */}
                {selectedService && (
                    <div className="space-y-4 animate-fade-in">
                        <h2 className="text-xl font-semibold">{t('selectStaff')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {staff.map((member) => (
                                <Card
                                    key={member.id}
                                    className={cn(
                                        "cursor-pointer transition-all hover:border-primary",
                                        selectedStaff === member.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : ""
                                    )}
                                    onClick={() => setSelectedStaff(member.id)}
                                >
                                    <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                                            {member.photoUrl ? (
                                                <img src={member.photoUrl} alt={getLocalizedName(member)} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                                                    {getLocalizedName(member).charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{getLocalizedName(member)}</div>
                                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span>4.9</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Footer & Sheet */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50">
                <div className="container mx-auto max-w-4xl">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                className="w-full h-12 text-lg shadow-lg"
                                size="lg"
                                disabled={!selectedService || !selectedStaff}
                            >
                                Continue
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
        </div>
    );
}
