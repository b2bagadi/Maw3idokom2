"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Calendar as CalendarIcon, Clock, DollarSign, User, ArrowLeft, Loader2, MapPin, MessageSquare, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { StarRating } from '@/components/reviews/StarRating';
import { CalendarSlots } from '@/components/booking/CalendarSlots';
import { LocationDialog } from '@/components/maps/LocationDialog';

export default function BookingPage({ params }: { params: { businessSlug: string } }) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [countryCode, setCountryCode] = useState('+212'); // Default to Morocco
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Data states
  const [business, setBusiness] = useState<any>(null);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<any[]>([]);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  const [staff, setStaff] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // mockTimeSlots removed

  useEffect(() => {
    loadBusinessData();
    checkClientLogin();
  }, [params.businessSlug]);

  const checkClientLogin = () => {
    try {
      const token = localStorage.getItem('client_token');
      const userDataStr = localStorage.getItem('client_user');

      if (token && userDataStr) {
        const userData = JSON.parse(userDataStr);
        setIsLoggedIn(true);
        setClientId(userData.id);

        // Pre-fill customer info
        setCustomerInfo({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone ? userData.phone.replace(/^\+\d+/, '') : '', // Remove country code if present
          notes: '',
        });

        // Extract country code if phone has it
        if (userData.phone) {
          const match = userData.phone.match(/^(\+\d+)/);
          if (match) {
            setCountryCode(match[1]);
          }
        }
      } else {
        // Not logged in - redirect to login with return URL
        const currentPath = window.location.pathname;
        router.push(`/client/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    } catch (error) {
      console.error('Error checking client login:', error);
      // On error, also redirect to login
      const currentPath = window.location.pathname;
      router.push(`/client/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  };

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);

      // Fetch business data
      const businessRes = await fetch(`/api/public/tenants?slug=${params.businessSlug}`);

      if (businessRes.ok) {
        const businessData = await businessRes.json();

        if (businessData.tenants && businessData.tenants.length > 0) {
          setBusiness(businessData.tenants[0]);

          // Fetch services for this business
          // Note: using the same endpoint as above, but maybe we should optimize or just use the data we have if services are included
          const servicesRes = await fetch(`/api/public/tenants?slug=${params.businessSlug}`);
          if (servicesRes.ok) {
            const data = await servicesRes.json();
            if (data.tenants && data.tenants.length > 0) {
              setServices(data.tenants[0].services || []);
              setStaff(data.tenants[0].staff || []);
            }
          }

          // Fetch reviews
          const reviewsRes = await fetch(`/api/public/reviews?slug=${params.businessSlug}`);
          if (reviewsRes.ok) {
            const data = await reviewsRes.json();
            setReviews(data.reviews || []);

            // Calculate average rating
            if (data.reviews && data.reviews.length > 0) {
              const total = data.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
              setAverageRating(total / data.reviews.length);
            }
          }

          // Fetch all businesses for the map (nearby)
          const allRes = await fetch('/api/public/tenants');
          if (allRes.ok) {
            const allData = await allRes.json();
            setNearbyBusinesses(allData.tenants || []);
          }

        } else {
          toast.error(t('errorBusinessNotFound'));
          router.push('/');
        }
      } else {
        toast.error(t('errorLoadBusiness'));
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to load business data:', error);
      toast.error(t('errorLoadBusiness'));
    } finally {
      setIsLoading(false);
    }
  };


  const getServiceName = (service: any) => {
    if (locale === 'fr') return service.nameFr;
    if (locale === 'ar') return service.nameAr;
    return service.nameEn;
  };

  const getServiceDescription = (service: any) => {
    if (locale === 'fr') return service.descriptionFr;
    if (locale === 'ar') return service.descriptionAr;
    return service.descriptionEn;
  };

  const getStaffName = (staffMember: any) => {
    if (locale === 'fr') return staffMember.nameFr;
    if (locale === 'ar') return staffMember.nameAr;
    return staffMember.nameEn;
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedStaffData = staff.find(s => s.id === selectedStaff);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      toast.error(t('errorCompleteDetails'));
      return;
    }

    if (!isLoggedIn) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
        toast.error(t('errorCompleteDetails'));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessSlug: params.businessSlug,
          serviceId: selectedService,
          staffId: selectedStaff || null,
          startTime: startDateTime.toISOString(),
          customerId: isLoggedIn ? clientId : null, // Link to client account if logged in
          guestName: isLoggedIn ? null : `${customerInfo.firstName} ${customerInfo.lastName}`,
          guestEmail: isLoggedIn ? null : customerInfo.email,
          guestPhone: isLoggedIn ? null : customerInfo.phone,
          notes: customerInfo.notes,
          customerLanguage: locale,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('bookingSuccess'));
        toast.success(t('successMessage'));

        // Reset form after short delay
        setTimeout(() => {
          router.push('/client/dashboard');
        }, 2000);
      } else {
        toast.error(data.error || t('errorBookingFailed'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(t('errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link href="/" className="font-semibold hover:opacity-80 transition-opacity">
              {business?.nameEn || business?.name}
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <StarRating rating={averageRating} size="lg" />
              <span className="text-muted-foreground">({reviews.length} reviews)</span>
            </div>
            <p className="text-muted-foreground">{business?.aboutEn || business?.aboutFr || business?.aboutAr}</p>
          </div>

          {/* Business Info Section */}
          <div className="mb-8 space-y-6">
            {/* Image Gallery */}
            {business?.galleryImages && (() => {
              try {
                const images = JSON.parse(business.galleryImages);
                if (Array.isArray(images) && images.length > 0) {
                  const nextImage = () => {
                    setCurrentImageIndex((prev) => (prev + 1) % images.length);
                  };

                  const prevImage = () => {
                    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                  };

                  return (
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        {/* Main Carousel */}
                        <div className="relative aspect-video bg-muted group">
                          <img
                            src={images[currentImageIndex]}
                            alt={`${business?.nameEn} - Image ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Navigation Arrows */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                                aria-label="Previous image"
                              >
                                <ArrowLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                                aria-label="Next image"
                              >
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </div>

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                          <div className="p-4 bg-muted/30">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                              {images.map((imageUrl: string, index: number) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${index === currentImageIndex
                                    ? 'border-primary ring-2 ring-primary/20 scale-105'
                                    : 'border-transparent hover:border-primary/50'
                                    }`}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              } catch (e) {
                return null;
              }
              return null;
            })()}

            {/* Location & Contact */}
            {(business?.address || business?.mapUrl || business?.whatsappUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('locationContact')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  {business?.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{t('address')}</p>
                        <p className="text-muted-foreground">{business.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {business?.mapUrl && (
                      <Button
                        variant="outline"
                        onClick={() => setIsLocationDialogOpen(true)}
                        className="flex-1 sm:flex-none"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {t('viewOnMap')}
                      </Button>
                    )}

                    {business?.whatsappUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(business.whatsappUrl, '_blank')}
                        className="flex-1 sm:flex-none border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t('whatsapp')}
                      </Button>
                    )}

                    {!business?.whatsappUrl && business?.phone && (() => {
                      // Format phone for WhatsApp
                      const formatPhoneForWhatsApp = (phone: string) => {
                        let cleaned = phone.replace(/[^\d+]/g, '');
                        cleaned = cleaned.replace(/^\+/, '');
                        return cleaned;
                      };
                      const whatsappNumber = formatPhoneForWhatsApp(business.phone);

                      return (
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
                          className="flex-1 sm:flex-none border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {t('whatsapp')}
                        </Button>
                      );
                    })()}

                    {business?.phone && (
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = `tel:${business.phone}`}
                        className="flex-1 sm:flex-none"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t('call')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Select Service */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant={step >= 1 ? "default" : "secondary"}>1</Badge>
                    <CardTitle>{t('selectService')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t('noServices')}</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${selectedService === service.id ? 'border-primary border-2 bg-primary/5' : ''
                            }`}
                          onClick={() => {
                            setSelectedService(service.id);
                            if (step === 1) setStep(2);
                          }}
                        >
                          <CardHeader>
                            <CardTitle className="text-base">{getServiceName(service)}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {getServiceDescription(service)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {service.duration} min
                              </div>
                              <div className="flex items-center gap-1 font-semibold">
                                {service.price} MAD
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Select Staff */}
              {step >= 2 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant={step >= 2 ? "default" : "secondary"}>2</Badge>
                      <CardTitle>{t('selectStaff')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={selectedStaff?.toString()}
                      onValueChange={(value) => {
                        setSelectedStaff(parseInt(value));
                        if (step === 2) setStep(3);
                      }}
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="0" id="any-staff" />
                        <Label htmlFor="any-staff" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{t('anyStaff')}</span>
                          </div>
                        </Label>
                      </div>
                      {staff.map((staffMember) => (
                        <div
                          key={staffMember.id}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <RadioGroupItem value={staffMember.id.toString()} id={`staff-${staffMember.id}`} />
                          <Label htmlFor={`staff-${staffMember.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              {staffMember.photoUrl ? (
                                <img
                                  src={staffMember.photoUrl}
                                  alt={getStaffName(staffMember)}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <span className="font-medium">{getStaffName(staffMember)}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Select Date & Time */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('selectDate')}</CardTitle>
                      <CardDescription>{t('selectDateDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CalendarSlots
                        businessSlug={params.businessSlug}
                        staffId={selectedStaff}
                        serviceDuration={selectedServiceData?.duration || 30}
                        locale={locale}
                        onSlotSelect={(date, time) => {
                          setSelectedDate(date);
                          setSelectedTime(time);
                          // Optional: Automatically advance or just let user click Next
                        }}
                      />

                      {selectedDate && selectedTime && (
                        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between animate-in fade-in zoom-in duration-300">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                {selectedDate.toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                at {selectedTime}
                              </p>
                            </div>
                          </div>
                          <Button onClick={() => setStep(4)}>
                            {t('continue')}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      {t('back')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Customer Information */}
              {step >= 4 && selectedTime && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant={step >= 4 ? "default" : "secondary"}>4</Badge>
                      <CardTitle>{t('customerInfo')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Inline Summary for Confirmation */}
                    <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3 text-sm border">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {selectedDate?.toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US', {
                          weekday: 'short', day: 'numeric', month: 'short'
                        })} at {selectedTime}
                      </span>
                      <Button variant="link" size="sm" className="ml-auto h-auto p-0" onClick={() => setStep(3)}>
                        {tCommon('edit')}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t('firstName')}</Label>
                        <Input
                          id="firstName"
                          value={customerInfo.firstName}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t('lastName')}</Label>
                        <Input
                          id="lastName"
                          value={customerInfo.lastName}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">{tCommon('email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{tCommon('phone')}</Label>
                      <PhoneInput
                        value={customerInfo.phone}
                        onChange={(value) => setCustomerInfo({ ...customerInfo, phone: value })}
                        placeholder={t('phonePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">{t('notes')}</Label>
                      <Textarea
                        id="notes"
                        value={customerInfo.notes}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleBooking}
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('bookingProcessing')}
                        </>
                      ) : (
                        t('confirmBooking')
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{tCommon('summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedServiceData && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{tCommon('service')}</p>
                        <p className="font-semibold">{getServiceName(selectedServiceData)}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{selectedServiceData.duration} min</span>
                          <span>{selectedServiceData.price} MAD</span>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {selectedStaffData && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{tCommon('staff')}</p>
                        <p className="font-semibold">{getStaffName(selectedStaffData)}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {selectedStaff === 0 && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{tCommon('staff')}</p>
                        <p className="font-semibold">{t('anyStaff')}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {selectedDate && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t('date')}</p>
                        <p className="font-semibold">
                          {selectedDate.toLocaleDateString(locale, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {selectedTime && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t('time')}</p>
                        <p className="font-semibold font-mono">{selectedTime}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {selectedServiceData && (
                    <div className="pt-2">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>{tCommon('total')}</span>
                        <span>{selectedServiceData.price} MAD</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>


      <LocationDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        businesses={nearbyBusinesses}
        selectedBusinessSlug={params.businessSlug}
        businessName={business?.nameEn || business?.name}
      />
    </div >
  );
}