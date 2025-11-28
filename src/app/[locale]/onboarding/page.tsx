"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  LogOut,
  Calendar,
  Settings,
  MessageCircle,
  Mail,
  CheckCircle,
  XCircle,
  MapPin,
  Briefcase,
  UserCog,
  Save,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  Menu,
  AlertTriangle,
  Clock,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { FilterRibbon } from "@/components/appointments/FilterRibbon";
import { MoneyCard } from "@/components/appointments/MoneyCard";
import { BulkActionBar } from "@/components/appointments/BulkActionBar";
import { DateRange } from "react-day-picker";

import { ReviewsManagement } from '@/components/reviews/ReviewsManagement';

type Section = 'appointments' | 'profile' | 'services' | 'staff' | 'gallery' | 'reviews';

export default function BusinessDashboardPage() {
  const router = useRouter();
  const t = useTranslations('business');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'en' | 'fr' | 'ar';
  const [activeSection, setActiveSection] = useState<Section>('appointments');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState('');

  // Data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [serviceForm, setServiceForm] = useState<any>({});
  const [staffForm, setStaffForm] = useState<any>({});
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);

  // Email form
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Action Dialog States
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'whatsapp'>('email');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Shared Appointments Module State
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [status, setStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);


  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('business_token');
    if (!token) {
      router.push('/business/login');
      return;
    }
    loadData();
    fetchGlobalSettings();
  }, [activeSection]);

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.logoUrl) setLogoUrl(data.logoUrl);
      }
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      switch (activeSection) {
        case 'appointments':
          const apptRes = await fetch('/api/business/appointments', { headers });
          if (apptRes.ok) {
            const data = await apptRes.json();
            setAppointments(data.appointments || []);
          }
          break;
        case 'profile':
          const profileRes = await fetch('/api/business/profile', { headers });
          if (profileRes.ok) {
            const data = await profileRes.json();
            setProfile(data);
            setGalleryUrls(data.galleryImages ? JSON.parse(data.galleryImages) : []);
          }
          break;
        case 'services':
          const servRes = await fetch('/api/business/services', { headers });
          if (servRes.ok) {
            const data = await servRes.json();
            setServices(data.services || []);
          }
          break;
        case 'staff':
          const staffRes = await fetch('/api/business/staff', { headers });
          if (staffRes.ok) {
            const data = await staffRes.json();
            setStaff(data.staff || []);
          }
          break;
        case 'gallery':
          const galRes = await fetch('/api/business/profile', { headers });
          if (galRes.ok) {
            const data = await galRes.json();
            setGalleryUrls(data.galleryImages ? JSON.parse(data.galleryImages) : []);
          }
          break;
        case 'reviews':
          const reviewsRes = await fetch('/api/business/reviews', { headers });
          if (reviewsRes.ok) {
            const data = await reviewsRes.json();
            setReviews(data.reviews || []);
          }
          break;
      }
    } catch (error) {
      toast.error(t('errorLoadData') || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('business_token');
    toast.success(tCommon('logoutSuccess') || 'Logged out successfully');
    router.push('/business/login');
  };

  const handleConfirmAction = async () => {
    if (!selectedAppointment) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');

      // Handle client-side redirection before or after API call? 
      // Better after success to ensure state is updated, but browser might block popups if async.
      // However, user interaction (click) started this, so it might be okay if fast.
      // Let's prepare the links first.

      const phone = selectedAppointment.guestPhone;
      const email = selectedAppointment.guestEmail;
      const name = selectedAppointment.guestName || 'Guest';
      const serviceName = selectedAppointment.service?.nameEn || 'Service';
      const date = new Date(selectedAppointment.startTime).toLocaleDateString();
      const time = new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let redirectUrl = '';
      console.log('[Confirm] Starting with notification method:', notificationMethod, 'Phone:', phone, 'Email:', email);

      if (notificationMethod === 'whatsapp' && phone) {
        const message = encodeURIComponent(
          `Hello ${name}, your appointment for ${serviceName} on ${date} at ${time} is confirmed. Looking forward to seeing you!`
        );
        redirectUrl = `https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`;
      } else if (notificationMethod === 'email' && email) {
        const subject = encodeURIComponent(`Appointment Confirmation - ${serviceName}`);
        const body = encodeURIComponent(
          `Dear ${name},\n\nYour appointment for ${serviceName} on ${date} at ${time} has been confirmed.\n\nWe look forward to seeing you!\n\nBest regards,\n${profile.nameEn || 'Your Business'}`
        );
        redirectUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      }

      console.log('[Confirm] Sending API request to:', `/api/business/appointments/${selectedAppointment.id}/confirm`);
      const response = await fetch(`/api/business/appointments/${selectedAppointment.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // We handle notification client-side, so tell backend not to send any
        body: JSON.stringify({ notifyVia: 'none' })
      });

      console.log('[Confirm] Response status:', response.status, 'OK:', response.ok);
      if (response.ok) {
        const data = await response.json();
        toast.success('✅ ' + t('appointmentConfirmed'));
        setConfirmDialogOpen(false);
        loadData();

        // Redirect after a brief delay to allow state updates
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        }
      } else {
        const data = await response.json();
        console.error('[Confirm] API Error:', data);
        toast.error(data.error || t('confirmFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAction = async () => {
    if (!selectedAppointment || !rejectionReason) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');

      const phone = selectedAppointment.guestPhone;
      const email = selectedAppointment.guestEmail;
      const name = selectedAppointment.guestName || 'Guest';
      const serviceName = selectedAppointment.service?.nameEn || 'Service';
      const date = new Date(selectedAppointment.startTime).toLocaleDateString();
      const time = new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let redirectUrl = '';

      if (notificationMethod === 'whatsapp' && phone) {
        const message = encodeURIComponent(
          `Hello ${name}, unfortunately we cannot proceed with your appointment for ${serviceName} on ${date} at ${time}.\nReason: ${rejectionReason}`
        );
        redirectUrl = `https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`;
      } else if (notificationMethod === 'email' && email) {
        const subject = encodeURIComponent(`Appointment Update - ${serviceName}`);
        const body = encodeURIComponent(
          `Dear ${name},\n\nUnfortunately we cannot proceed with your appointment for ${serviceName} on ${date} at ${time}.\n\nReason: ${rejectionReason}\n\nBest regards,\n${profile.nameEn || 'Your Business'}`
        );
        redirectUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      }

      const response = await fetch(`/api/business/appointments/${selectedAppointment.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: rejectionReason,
          notifyVia: 'none'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('❌ ' + t('appointmentRejected'));
        setRejectDialogOpen(false);
        setRejectionReason('');
        loadData();

        // Redirect after a brief delay to allow state updates
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || t('rejectFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescheduleAction = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return;
    setIsLoading(true);
    try {
      // Combine date and time
      const dateTime = new Date(rescheduleDate);
      const [hours, minutes] = rescheduleTime.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      const token = localStorage.getItem('business_token');

      const phone = selectedAppointment.guestPhone;
      const email = selectedAppointment.guestEmail;
      const name = selectedAppointment.guestName || 'Guest';
      const serviceName = selectedAppointment.service?.nameEn || 'Service';
      const newDateStr = dateTime.toLocaleDateString();
      const newTimeStr = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let redirectUrl = '';

      if (notificationMethod === 'whatsapp' && phone) {
        const message = encodeURIComponent(
          `Hello ${name}, your appointment for ${serviceName} has been rescheduled to ${newDateStr} at ${newTimeStr}.\nReason: ${rescheduleReason || 'Schedule adjustment'}`
        );
        redirectUrl = `https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`;
      } else if (notificationMethod === 'email' && email) {
        const subject = encodeURIComponent(`Appointment Rescheduled - ${serviceName}`);
        const body = encodeURIComponent(
          `Dear ${name},\n\nYour appointment for ${serviceName} has been rescheduled.\n\nNew Date: ${newDateStr}\nNew Time: ${newTimeStr}\nReason: ${rescheduleReason || 'Schedule adjustment'}\n\nBest regards,\n${profile.nameEn || 'Your Business'}`
        );
        redirectUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      }

      const response = await fetch(`/api/business/appointments/${selectedAppointment.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newStartTime: dateTime.toISOString(),
          reason: rescheduleReason,
          notifyVia: 'none'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('📅 ' + t('appointmentRescheduled'));
        setRescheduleDialogOpen(false);
        setRescheduleDate(undefined);
        setRescheduleTime('');
        setRescheduleReason('');
        loadData();

        // Redirect after a brief delay to allow state updates
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || t('rescheduleFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const { to, subject, body } = emailForm;
      const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      toast.success('✉️ ' + (tCommon('openingEmail') || 'Opening email client...'));
      setIsEmailDialogOpen(false);
      setEmailForm({ to: '', subject: '', body: '' });

      // Redirect to email client
      window.location.href = mailtoLink;
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const token = localStorage.getItem('business_token');
      const response = await fetch('/api/business/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...profile, galleryImages: JSON.stringify(galleryUrls) })
      });

      if (response.ok) {
        toast.success('✅ ' + t('profileUpdated'));
      } else {
        const data = await response.json();
        toast.error(data.error || t('profileUpdateFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveService = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');
      const endpoint = selectedService
        ? `/api/business/services/${selectedService.id}?id=${selectedService.id}`
        : '/api/business/services';
      const method = selectedService ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });

      if (response.ok) {
        toast.success(selectedService ? '✅ ' + t('serviceUpdated') : '✅ ' + t('serviceCreated'));
        setIsServiceDialogOpen(false);
        setServiceForm({});
        loadData();
      } else {
        const data = await response.json();
        toast.error(data.error || t('serviceSaveFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm(t('deleteServiceConfirm'))) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');
      const response = await fetch(`/api/business/services/${serviceId}?id=${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('❌ ' + t('serviceDeleted'));
        loadData();
      } else {
        const data = await response.json();
        toast.error(data.error || t('deleteFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStaff = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');
      const endpoint = selectedStaff
        ? `/api/business/staff/${selectedStaff.id}?id=${selectedStaff.id}`
        : '/api/business/staff';
      const method = selectedStaff ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffForm)
      });

      if (response.ok) {
        toast.success(selectedStaff ? '✅ ' + t('staffUpdated') : '✅ ' + t('staffAdded'));
        setIsStaffDialogOpen(false);
        setStaffForm({});
        loadData();
      } else {
        const data = await response.json();
        toast.error(data.error || t('staffSaveFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm(t('deleteStaffConfirm'))) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('business_token');
      const response = await fetch(`/api/business/staff/${staffId}?id=${staffId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('❌ ' + t('staffDeleted'));
        loadData();
      } else {
        const data = await response.json();
        toast.error(data.error || t('deleteFailed'));
      }
    } catch (error) {
      toast.error(tCommon('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) {
      toast.error(t('enterImageUrl'));
      return;
    }

    if (galleryUrls.length >= 6) {
      toast.error(t('maxImagesReached'));
      return;
    }

    if (!newGalleryUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      toast.error(t('invalidImageUrl'));
      return;
    }

    setGalleryUrls([...galleryUrls, newGalleryUrl]);
    setNewGalleryUrl('');
    toast.success(t('imageAdded'));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
    toast.success(t('imageRemoved'));
  };

  const openWhatsApp = (appointment: any) => {
    const phone = appointment.guestPhone;
    const name = appointment.guestName || 'Guest';
    const service = appointment.service?.nameEn || 'service';
    const date = new Date(appointment.startTime).toLocaleDateString();

    const message = encodeURIComponent(
      `Hello ${name}, your appointment for ${service} on ${date} is confirmed. Looking forward to seeing you!`
    );

    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  };

  const openEmailDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEmailForm({
      to: appointment.guestEmail || '',
      subject: `Appointment Confirmation - ${appointment.service?.nameEn}`,
      body: `Dear ${appointment.guestName || 'Customer'},\n\nYour appointment for ${appointment.service?.nameEn} on ${new Date(appointment.startTime).toLocaleString()} has been confirmed.\n\nWe look forward to seeing you!\n\nBest regards,\n${profile.nameEn || 'Your Business'}`
    });
    setIsEmailDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'CONFIRMED': return 'bg-green-500';
      case 'RESCHEDULED': return 'bg-purple-500';
      case 'REJECTED': return 'bg-red-500';
      case 'COMPLETED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

  const handleBulkAction = async (action: 'CONFIRM' | 'REJECT' | 'EXPORT') => {
    if (action === 'EXPORT') {
      const queryParams = new URLSearchParams();
      // queryParams.append('tenantId', 'me'); // Handled by cookie/token usually, or API implies it
      if (dateRange?.from) queryParams.append('from', dateRange.from.toISOString());
      if (dateRange?.to) queryParams.append('to', dateRange.to.toISOString());
      if (status !== 'ALL') queryParams.append('status', status);
      if (selectedIds.length > 0) {
        queryParams.append('ids', selectedIds.join(','));
      }

      window.open(`/api/appointments/export?${queryParams.toString()}`, '_blank');
      return;
    }

    const response = await fetch('/api/appointments/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('business_token')}`
      },
      body: JSON.stringify({
        ids: selectedIds,
        action
      }),
    });

    if (response.ok) {
      toast.success(`${action} successful`);
      setSelectedIds([]);
      // Trigger refresh - ideally via a callback prop to Table, but for now:
      // We can force a re-render or refetch if we lift state up or use a context.
      // Since AppointmentTable fetches its own data based on props, changing a prop (like a timestamp) could work.
      // Or just reload.
      window.location.reload();
    } else {
      toast.error("Bulk action failed");
    }
  };

  const handleTableAction = (action: string, appointment: any) => {
    switch (action) {
      case 'confirm':
        setSelectedAppointment(appointment);
        setConfirmDialogOpen(true);
        break;
      case 'reject':
        setSelectedAppointment(appointment);
        setRejectDialogOpen(true);
        break;
      case 'whatsapp':
        openWhatsApp(appointment);
        break;
      case 'email':
        openEmailDialog(appointment);
        break;
    }
  };

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MoneyCard
          // tenantId is implicit for business view (handled by API/Token)
          dateRange={dateRange}
          status={status}
        />
      </div>

      <FilterRibbon
        dateRange={dateRange}
        setDateRange={setDateRange}
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        locale={locale} // Ensure this is passed correctly
      />

      <AppointmentTable
        scope="business"
        // tenantId is implicit
        locale={locale}
        dateRange={dateRange}
        status={status}
        search={search}
        onSelectionChange={setSelectedIds}
        onAction={handleTableAction}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onAction={handleBulkAction}
      />
    </div>
  );

  const renderProfile = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('profileTitle')}</CardTitle>
        <CardDescription>{t('profileDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
          </TabsList>
          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>{t('nameEn')}</Label>
              <Input
                value={profile.nameEn || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, nameEn: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('aboutEn')}</Label>
              <Textarea
                value={profile.aboutEn || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfile({ ...profile, aboutEn: e.target.value })}
                rows={3}
              />
            </div>
          </TabsContent>
          <TabsContent value="fr" className="space-y-4">
            <div>
              <Label>{t('nameFr')}</Label>
              <Input
                value={profile.nameFr || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, nameFr: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('aboutFr')}</Label>
              <Textarea
                value={profile.aboutFr || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfile({ ...profile, aboutFr: e.target.value })}
                rows={3}
              />
            </div>
          </TabsContent>
          <TabsContent value="ar" className="space-y-4" dir="rtl">
            <div>
              <Label>{t('nameAr')}</Label>
              <Input
                value={profile.nameAr || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, nameAr: e.target.value })}
                dir="rtl"
              />
            </div>
            <div>
              <Label>{t('aboutAr')}</Label>
              <Textarea
                value={profile.aboutAr || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfile({ ...profile, aboutAr: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t('logoUrl')}</Label>
            <Input
              value={profile.logo || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, logo: e.target.value })}
              placeholder="https://..."
            />
            {profile.logo && (
              <img src={profile.logo} alt="Logo preview" className="mt-2 h-20 w-20 object-contain border rounded" />
            )}
          </div>
          <div>
            <Label>{t('type')}</Label>
            <Input
              value={profile.businessType || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, businessType: e.target.value })}
              placeholder="Salon, Barbershop, Clinic..."
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t('mapsUrl')}
            </Label>
            <Input
              value={profile.mapUrl || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, mapUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {t('whatsappUrl')}
            </Label>
            <Input
              value={profile.whatsappUrl || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, whatsappUrl: e.target.value })}
              placeholder="https://wa.me/..."
            />
          </div>
        </div>

        {/* Password Change Section */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={passwordData.confirmPassword || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            variant="outline"
            className="mt-4"
            disabled={!passwordData.currentPassword || !passwordData.newPassword}
          >
            Update Password
          </Button>
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? t('saving') : t('saveProfile')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderServices = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedService(null);
            setServiceForm({});
            setIsServiceDialogOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addService')}
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('noServices')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>{service.nameEn || service.nameFr || service.nameAr}</CardTitle>
                <CardDescription>
                  MAD {service.price} • {service.duration} minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.descriptionEn || service.descriptionFr || service.descriptionAr}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedService(service);
                      setServiceForm(service);
                      setIsServiceDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {tCommon('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {tCommon('delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedStaff(null);
            setStaffForm({});
            setIsStaffDialogOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addStaff')}
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <UserCog className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('noStaff')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {staff.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>{member.nameEn || member.nameFr || member.nameAr}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedStaff(member);
                      setStaffForm(member);
                      setIsStaffDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {tCommon('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteStaff(member.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {tCommon('delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderGallery = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {t('galleryTitle')}
        </CardTitle>
        <CardDescription>
          {t('galleryDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-32 object-cover rounded border"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                }}
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveGalleryImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {galleryUrls.length < 6 && (
          <div className="space-y-2">
            <Label>{t('addImageUrl')}</Label>
            <div className="flex gap-2">
              <Input
                value={newGalleryUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGalleryUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button onClick={handleAddGalleryImage}>
                <Plus className="w-4 h-4 mr-2" />
                {t('add')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('imagesRemaining', { count: 6 - galleryUrls.length })}
            </p>
          </div>
        )}

        <Button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? t('saving') : t('saveGallery')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (isLoading && (appointments.length === 0 && !profile.id)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground animate-pulse">{tCommon('loading')}</div>
        </div>
      );
    }

    switch (activeSection) {
      case 'appointments':
        return renderAppointments();
      case 'profile':
        return renderProfile();
      case 'services':
        return renderServices();
      case 'staff':
        return renderStaff();
      case 'gallery':
        return renderGallery();
      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
                <p className="text-muted-foreground">Manage and reply to customer reviews</p>
              </div>
            </div>
            <ReviewsManagement
              reviews={reviews}
              onUpdate={loadData}
              userRole="business"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r flex flex-col max-md:hidden">
        <div className="p-6 border-b">
          {logoUrl && (
            <Link href="/">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-10 w-10 mb-3 object-contain cursor-pointer transition-transform duration-300 hover:scale-110"
              />
            </Link>
          )}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('dashboardTitle')}
          </h2>
          {profile.nameEn && (
            <p className="text-sm text-muted-foreground mt-1">{profile.nameEn}</p>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeSection === 'appointments' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('appointments')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t('appointments')}
            {pendingCount > 0 && (
              <Badge className="ml-auto bg-red-500">{pendingCount}</Badge>
            )}
          </Button>
          <Button
            variant={activeSection === 'profile' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('profile')}
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('profile')}
          </Button>
          <Button
            variant={activeSection === 'services' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('services')}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            {t('services')}
          </Button>
          <Button
            variant={activeSection === 'staff' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('staff')}
          >
            <UserCog className="w-4 h-4 mr-2" />
            {t('staff')}
          </Button>
          <Button
            variant={activeSection === 'gallery' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('gallery')}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {t('gallery')}
          </Button>
          <Button
            variant={activeSection === 'reviews' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('reviews')}
          >
            <Star className="w-4 h-4 mr-2" />
            Reviews
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <Link href="/">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-8 w-8 object-contain cursor-pointer"
              />
            </Link>
          )}
          <h2 className="text-xl font-bold">{t('dashboardTitle')}</h2>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('dashboardTitle')}
                </h2>
                {profile.nameEn && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.nameEn}</p>
                )}
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <Button
                  variant={activeSection === 'appointments' ? 'default' : 'ghost'}
                  className="w-full justify-start transition-all duration-300"
                  onClick={() => setActiveSection('appointments')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('appointments')}
                  {pendingCount > 0 && (
                    <Badge className="ml-auto bg-red-500">{pendingCount}</Badge>
                  )}
                </Button>
                <Button
                  variant={activeSection === 'profile' ? 'default' : 'ghost'}
                  className="w-full justify-start transition-all duration-300"
                  onClick={() => setActiveSection('profile')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t('profile')}
                </Button>
                <Button
                  variant={activeSection === 'services' ? 'default' : 'ghost'}
                  className="w-full justify-start transition-all duration-300"
                  onClick={() => setActiveSection('services')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  {t('services')}
                </Button>
                <Button
                  variant={activeSection === 'staff' ? 'default' : 'ghost'}
                  className="w-full justify-start transition-all duration-300"
                  onClick={() => setActiveSection('staff')}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  {t('staff')}
                </Button>
                <Button
                  variant={activeSection === 'gallery' ? 'default' : 'ghost'}
                  className="w-full justify-start transition-all duration-300"
                  onClick={() => setActiveSection('gallery')}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {t('gallery')}
                </Button>
              </nav>
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto md:p-8 p-4 pt-24 md:pt-8">
        {!profile.isActive && !isLoading && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Account Pending Approval</h3>
              <p className="text-sm mt-1">
                Your business account is currently pending admin approval. Your profile will not be visible to clients until approved.
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
        </div>
        {renderContent()}
      </div>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sendEmail')}</DialogTitle>
            <DialogDescription>
              Send an email to {selectedAppointment?.guestName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('to')}</Label>
              <Input
                value={emailForm.to}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label>{t('subject')}</Label>
              <Input
                value={emailForm.subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailForm({ ...emailForm, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('message')}</Label>
              <Textarea
                value={emailForm.body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailForm({ ...emailForm, body: e.target.value })}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSendEmail} disabled={isLoading}>
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? t('sending') : t('sendEmail')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedService ? t('editService') : t('createService')}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="en">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
            </TabsList>
            <TabsContent value="en" className="space-y-4">
              <div>
                <Label>{t('serviceNameEn')}</Label>
                <Input
                  value={serviceForm.nameEn || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceForm({ ...serviceForm, nameEn: e.target.value })}
                  placeholder="Haircut"
                />
              </div>
              <div>
                <Label>{t('descEn')}</Label>
                <Textarea
                  value={serviceForm.descriptionEn || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                  placeholder="Professional haircut with styling"
                  rows={3}
                />
              </div>
            </TabsContent>
            <TabsContent value="fr" className="space-y-4">
              <div>
                <Label>{t('serviceNameFr')}</Label>
                <Input
                  value={serviceForm.nameFr || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceForm({ ...serviceForm, nameFr: e.target.value })}
                  placeholder="Coupe de cheveux"
                />
              </div>
              <div>
                <Label>{t('descFr')}</Label>
                <Textarea
                  value={serviceForm.descriptionFr || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setServiceForm({ ...serviceForm, descriptionFr: e.target.value })}
                  placeholder="Coupe professionnelle avec coiffage"
                  rows={3}
                />
              </div>
            </TabsContent>
            <TabsContent value="ar" className="space-y-4" dir="rtl">
              <div>
                <Label>{t('serviceNameAr')}</Label>
                <Input
                  value={serviceForm.nameAr || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceForm({ ...serviceForm, nameAr: e.target.value })}
                  placeholder="قص شعر"
                  dir="rtl"
                />
              </div>
              <div>
                <Label>{t('descAr')}</Label>
                <Textarea
                  value={serviceForm.descriptionAr || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                  placeholder="قص شعر احترافي مع تصفيف"
                  rows={3}
                  dir="rtl"
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>{t('price')}</Label>
              <Input
                type="number"
                value={serviceForm.price || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                placeholder="50"
              />
            </div>
            <div>
              <Label>{t('duration')}</Label>
              <Input
                type="number"
                value={serviceForm.duration || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 30 })}
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSaveService} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? t('saving') : t('saveService')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStaff ? t('editStaff') : t('addStaffMember')}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="en">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
            </TabsList>
            <TabsContent value="en" className="space-y-4">
              <div>
                <Label>{t('staffNameEn')}</Label>
                <Input
                  value={staffForm.nameEn || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffForm({ ...staffForm, nameEn: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
            </TabsContent>
            <TabsContent value="fr" className="space-y-4">
              <div>
                <Label>{t('staffNameFr')}</Label>
                <Input
                  value={staffForm.nameFr || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffForm({ ...staffForm, nameFr: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>
            </TabsContent>
            <TabsContent value="ar" className="space-y-4" dir="rtl">
              <div>
                <Label>{t('staffNameAr')}</Label>
                <Input
                  value={staffForm.nameAr || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffForm({ ...staffForm, nameAr: e.target.value })}
                  placeholder="أحمد محمد"
                  dir="rtl"
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t('role')}</Label>
              <Input
                value={staffForm.role || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffForm({ ...staffForm, role: e.target.value })}
                placeholder="Hairstylist, Barber, etc."
              />
            </div>
            <div>
              <Label>{t('photoUrl')}</Label>
              <Input
                value={staffForm.photoUrl || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStaffForm({ ...staffForm, photoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSaveStaff} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? t('saving') : t('saveStaff')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('notifyCustomer')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button
              variant={notificationMethod === 'email' ? 'default' : 'outline'}
              className="flex flex-col h-24 gap-2"
              onClick={() => setNotificationMethod('email')}
            >
              <Mail className="w-6 h-6" />
              {t('email')}
            </Button>
            <Button
              variant={notificationMethod === 'whatsapp' ? 'default' : 'outline'}
              className="flex flex-col h-24 gap-2"
              onClick={() => setNotificationMethod('whatsapp')}
            >
              <MessageCircle className="w-6 h-6" />
              {t('whatsapp')}
            </Button>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>{tCommon('cancel')}</Button>
            <Button onClick={handleConfirmAction} disabled={isLoading}>
              {isLoading ? t('confirming') : t('confirmTitle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectTitle')}</DialogTitle>
            <DialogDescription>
              {t('rejectReason')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('reason')}</Label>
              <Textarea
                placeholder="e.g., Unforeseen conflict, Staff unavailable..."
                value={rejectionReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('notificationMethod')}</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={notificationMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('email')}
                >
                  {t('email')}
                </Button>
                <Button
                  size="sm"
                  variant={notificationMethod === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('whatsapp')}
                >
                  {t('whatsapp')}
                </Button>

              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>{tCommon('back')}</Button>
            <Button variant="destructive" onClick={handleRejectAction} disabled={isLoading || !rejectionReason}>
              {isLoading ? t('rejecting') : t('rejectTitle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rescheduleTitle')}</DialogTitle>
            <DialogDescription>
              {t('selectNewDateTime')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('newDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !rescheduleDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {rescheduleDate ? format(rescheduleDate, "PPP") : <span>{t('pickDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={setRescheduleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('newTime')}</Label>
                <Input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRescheduleTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('reasonOptional')}</Label>
              <Textarea
                placeholder="Reason for rescheduling..."
                value={rescheduleReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRescheduleReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('notificationMethod')}</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={notificationMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('email')}
                >
                  {t('email')}
                </Button>
                <Button
                  size="sm"
                  variant={notificationMethod === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('whatsapp')}
                >
                  {t('whatsapp')}
                </Button>

              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>{tCommon('cancel')}</Button>
            <Button onClick={handleRescheduleAction} disabled={isLoading || !rescheduleDate || !rescheduleTime}>
              {isLoading ? t('rescheduling') : t('reschedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}