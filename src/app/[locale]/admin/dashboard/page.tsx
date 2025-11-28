"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  LogOut,
  Building2,
  Users,
  Briefcase,
  UserCog,
  Calendar,
  Settings,
  Languages,
  Key,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ImageIcon,
  MessageCircle,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Menu,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Download,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AppointmentsView } from '@/components/dashboard/AppointmentsView';

type Section = 'businesses' | 'services' | 'staff' | 'appointments' | 'contacts' | 'i18n' | 'settings' | 'password' | 'customers';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('businesses');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Data states
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [i18nStrings, setI18nStrings] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({});

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Appointment Action States
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'whatsapp'>('email');
  const [cancellationReason, setCancellationReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
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
        setGlobalSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      switch (activeSection) {
        case 'businesses':
          const bizRes = await fetch('/api/admin/tenants', { headers });
          if (bizRes.ok) {
            const data = await bizRes.json();
            setBusinesses(data.tenants || []);
          }
          break;

        case 'services':
          const servRes = await fetch('/api/admin/services', { headers });
          if (servRes.ok) {
            const data = await servRes.json();
            setServices(data.services || []);
          }
          break;
        case 'staff':
          const staffRes = await fetch('/api/admin/staff', { headers });
          if (staffRes.ok) {
            const data = await staffRes.json();
            setStaff(data.staff || []);
          }
          break;

        case 'contacts':
          const contactsRes = await fetch('/api/admin/contacts', { headers });
          if (contactsRes.ok) {
            const data = await contactsRes.json();
            setContacts(data.requests || []);
          }
          break;
        case 'i18n':
          const i18nRes = await fetch('/api/admin/i18n', { headers });
          if (i18nRes.ok) {
            const data = await i18nRes.json();
            setI18nStrings(data.strings || []);
          }
          break;
        case 'settings':
          const settingsRes = await fetch('/api/admin/settings', { headers });
          if (settingsRes.ok) {
            const data = await settingsRes.json();
            setGlobalSettings(data);
            setFormData(data);
          }
          break;
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedAppointment) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');

      const phone = selectedAppointment.guestPhone;
      const email = selectedAppointment.guestEmail;
      const name = selectedAppointment.guestName || 'Guest';
      const serviceName = selectedAppointment.service?.nameEn || 'Service';
      const date = new Date(selectedAppointment.startTime).toLocaleDateString();
      const time = new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let redirectUrl = '';

      if (notificationMethod === 'whatsapp' && phone) {
        const message = encodeURIComponent(
          `Hello ${name}, your appointment for ${serviceName} on ${date} at ${time} is confirmed.`
        );
        redirectUrl = `https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`;
      } else if (notificationMethod === 'email' && email) {
        const subject = encodeURIComponent(`Appointment Confirmation - ${serviceName}`);
        const body = encodeURIComponent(
          `Dear ${name},\n\nYour appointment for ${serviceName} on ${date} at ${time} has been confirmed.\n\nBest regards,\nMaw3idokom Admin`
        );
        redirectUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      }

      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notifyVia: 'none' })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('✅ Appointment confirmed!');
        setConfirmDialogOpen(false);
        loadData();

        // Redirect after a brief delay to allow state updates
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        }
      } else {
        toast.error('Failed to confirm');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAction = async () => {
    if (!selectedAppointment || !cancellationReason) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');

      const phone = selectedAppointment.guestPhone;
      const email = selectedAppointment.guestEmail;
      const name = selectedAppointment.guestName || 'Guest';
      const serviceName = selectedAppointment.service?.nameEn || 'Service';
      const date = new Date(selectedAppointment.startTime).toLocaleDateString();
      const time = new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let redirectUrl = '';

      if (notificationMethod === 'whatsapp' && phone) {
        const message = encodeURIComponent(
          `Hello ${name}, your appointment for ${serviceName} on ${date} at ${time} has been cancelled.\nReason: ${cancellationReason}`
        );
        redirectUrl = `https://wa.me/${phone.replace(/\+/g, '')}?text=${message}`;
      } else if (notificationMethod === 'email' && email) {
        const subject = encodeURIComponent(`Appointment Cancelled - ${serviceName}`);
        const body = encodeURIComponent(
          `Dear ${name},\n\nYour appointment for ${serviceName} on ${date} at ${time} has been cancelled.\n\nReason: ${cancellationReason}\n\nBest regards,\nMaw3idokom Admin`
        );
        redirectUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      }

      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: cancellationReason,
          notifyVia: 'none'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('❌ Appointment cancelled');
        setCancelDialogOpen(false);
        setCancellationReason('');
        loadData();

        // Redirect after a brief delay to allow state updates
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        }
      } else {
        toast.error('Failed to cancel');
      }
    } catch (error) {
      toast.error('An error occurred');
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

      const token = localStorage.getItem('admin_token');

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
          `Dear ${name},\n\nYour appointment for ${serviceName} has been rescheduled.\n\nNew Date: ${newDateStr}\nNew Time: ${newTimeStr}\nReason: ${rescheduleReason || 'Schedule adjustment'}\n\nBest regards,\nMaw3idokom Admin`
        );
        redirectUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      }

      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}/reschedule`, {
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
        toast.success('📅 Appointment rescheduled!');
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
        toast.error('Failed to reschedule');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const handleToggleActivation = async (business: any, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/tenants/${business.id}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        toast.success(`Business ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        // Update local state
        setBusinesses(businesses.map(b =>
          b.id === business.id ? { ...b, isActive: !currentStatus } : b
        ));
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({});
    setIsEditDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      let endpoint = '';

      switch (activeSection) {
        case 'businesses':
          endpoint = `/api/admin/tenants/${selectedItem.id}`;
          break;
        case 'services':
          endpoint = `/api/admin/services/${selectedItem.id}`;
          break;
        case 'staff':
          endpoint = `/api/admin/staff/${selectedItem.id}`;
          break;
        case 'i18n':
          endpoint = `/api/admin/i18n/${selectedItem.id}`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('✅ Deleted successfully');
        loadData();
        setIsDeleteDialogOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      let endpoint = '';
      let method = selectedItem ? 'PUT' : 'POST';
      let body: any = { ...formData };

      switch (activeSection) {
        case 'businesses':
          endpoint = selectedItem
            ? `/api/admin/tenants/${selectedItem.id}`
            : '/api/admin/tenants';
          // Ensure password is included for new businesses
          if (!selectedItem && !body.password) {
            toast.error('Password is required for new businesses');
            setIsLoading(false);
            return;
          }
          break;
        case 'services':
          endpoint = selectedItem
            ? `/api/admin/services/${selectedItem.id}`
            : '/api/admin/services';
          // Ensure tenantId exists
          if (!body.tenantId) {
            toast.error('Business is required');
            setIsLoading(false);
            return;
          }
          break;
        case 'staff':
          endpoint = selectedItem
            ? `/api/admin/staff/${selectedItem.id}`
            : '/api/admin/staff';
          // Ensure tenantId exists
          if (!body.tenantId) {
            toast.error('Business is required');
            setIsLoading(false);
            return;
          }
          break;
        case 'i18n':
          endpoint = selectedItem
            ? `/api/admin/i18n/${selectedItem.id}`
            : '/api/admin/i18n';
          break;
        case 'settings':
          endpoint = '/api/admin/settings/global';
          method = 'PUT';
          break;
        case 'password':
          endpoint = '/api/admin/password';
          method = 'PUT';
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(selectedItem ? '✅ Updated successfully' : '✅ Created successfully');
        loadData();
        setIsEditDialogOpen(false);
        setFormData({});
        if (activeSection === 'settings') {
          fetchGlobalSettings();
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBusinessForm = () => {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
          </TabsList>
          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>Business Name (EN) *</Label>
              <Input
                value={formData.nameEn || ''}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Business name in English"
              />
            </div>
            <div>
              <Label>About (EN)</Label>
              <Textarea
                value={formData.aboutEn || ''}
                onChange={(e) => setFormData({ ...formData, aboutEn: e.target.value })}
                placeholder="About business in English"
                rows={3}
              />
            </div>
          </TabsContent>
          <TabsContent value="fr" className="space-y-4">
            <div>
              <Label>Business Name (FR) *</Label>
              <Input
                value={formData.nameFr || ''}
                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                placeholder="Business name in French"
              />
            </div>
            <div>
              <Label>About (FR)</Label>
              <Textarea
                value={formData.aboutFr || ''}
                onChange={(e) => setFormData({ ...formData, aboutFr: e.target.value })}
                placeholder="About business in French"
                rows={3}
              />
            </div>
          </TabsContent>
          <TabsContent value="ar" className="space-y-4" dir="rtl">
            <div>
              <Label>اسم العمل (AR) *</Label>
              <Input
                value={formData.nameAr || ''}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="اسم العمل بالعربية"
                dir="rtl"
              />
            </div>
            <div>
              <Label>عن العمل (AR)</Label>
              <Textarea
                value={formData.aboutAr || ''}
                onChange={(e) => setFormData({ ...formData, aboutAr: e.target.value })}
                placeholder="عن العمل بالعربية"
                rows={3}
                dir="rtl"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Owner Name *</Label>
            <Input
              value={formData.ownerName || ''}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              placeholder="Owner name"
            />
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="business@example.com"
            />
          </div>
          <div>
            <Label>Phone *</Label>
            <div className="flex gap-2">
              <Select
                value={(() => {
                  // Extract country code from phone if it exists
                  const phone = formData.phone || '';
                  if (phone.startsWith('+212')) return '+212';
                  if (phone.startsWith('+213')) return '+213';
                  if (phone.startsWith('+33')) return '+33';
                  if (phone.startsWith('+34')) return '+34';
                  if (phone.startsWith('+1')) return '+1';
                  if (phone.startsWith('+44')) return '+44';
                  if (phone.startsWith('+49')) return '+49';
                  if (phone.startsWith('+971')) return '+971';
                  if (phone.startsWith('+966')) return '+966';
                  return '+212'; // default
                })()}
                onValueChange={(code) => {
                  // Get current phone number without country code
                  const currentPhone = formData.phone || '';
                  const phoneWithoutCode = currentPhone.replace(/^\+\d+/, '');
                  setFormData({ ...formData, phone: code + phoneWithoutCode });
                }}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+212">🇲🇦 +212</SelectItem>
                  <SelectItem value="+213">🇩🇿 +213</SelectItem>
                  <SelectItem value="+33">🇫🇷 +33</SelectItem>
                  <SelectItem value="+34">🇪🇸 +34</SelectItem>
                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                  <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                  <SelectItem value="+971">🇦🇪 +971</SelectItem>
                  <SelectItem value="+966">🇸🇦 +966</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                placeholder="612345678"
                value={(() => {
                  const phone = formData.phone || '';
                  return phone.replace(/^\+\d+/, '');
                })()}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  const currentCode = (() => {
                    const phone = formData.phone || '';
                    if (phone.startsWith('+212')) return '+212';
                    if (phone.startsWith('+213')) return '+213';
                    if (phone.startsWith('+33')) return '+33';
                    if (phone.startsWith('+34')) return '+34';
                    if (phone.startsWith('+1')) return '+1';
                    if (phone.startsWith('+44')) return '+44';
                    if (phone.startsWith('+49')) return '+49';
                    if (phone.startsWith('+971')) return '+971';
                    if (phone.startsWith('+966')) return '+966';
                    return '+212';
                  })();
                  setFormData({ ...formData, phone: currentCode + value });
                }}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter phone number without country code
            </p>
          </div>
          <div>
            <Label>Business Type *</Label>
            <Input
              value={formData.businessType || ''}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              placeholder="Salon, Barbershop, etc."
            />
          </div>
          {!selectedItem && (
            <div className="md:col-span-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Business owner password"
                autoComplete="off"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : selectedItem ? 'Update Business' : 'Create Business'}
        </Button>
      </div>
    );
  };

  const renderServiceForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <Label>Business *</Label>
          <Select
            value={formData.tenantId?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, tenantId: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((biz) => (
                <SelectItem key={biz.id} value={biz.id.toString()}>
                  {biz.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
          </TabsList>
          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>Service Name (EN) *</Label>
              <Input
                value={formData.nameEn || ''}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Haircut, Massage, etc."
              />
            </div>
            <div>
              <Label>Description (EN)</Label>
              <Textarea
                value={formData.descriptionEn || ''}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="Service description"
                rows={2}
              />
            </div>
          </TabsContent>
          <TabsContent value="fr" className="space-y-4">
            <div>
              <Label>Service Name (FR) *</Label>
              <Input
                value={formData.nameFr || ''}
                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                placeholder="Coupe de cheveux, Massage, etc."
              />
            </div>
            <div>
              <Label>Description (FR)</Label>
              <Textarea
                value={formData.descriptionFr || ''}
                onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                placeholder="Description du service"
                rows={2}
              />
            </div>
          </TabsContent>
          <TabsContent value="ar" className="space-y-4" dir="rtl">
            <div>
              <Label>اسم الخدمة (AR) *</Label>
              <Input
                value={formData.nameAr || ''}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="قص شعر، مساج، إلخ"
                dir="rtl"
              />
            </div>
            <div>
              <Label>الوصف (AR)</Label>
              <Textarea
                value={formData.descriptionAr || ''}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                placeholder="وصف الخدمة"
                rows={2}
                dir="rtl"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (minutes) *</Label>
            <Input
              type="number"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              placeholder="30"
            />
          </div>
          <div>
            <Label>Price (MAD) *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              placeholder="100.00"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : selectedItem ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    );
  };

  const renderStaffForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <Label>Business *</Label>
          <Select
            value={formData.tenantId?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, tenantId: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((biz) => (
                <SelectItem key={biz.id} value={biz.id.toString()}>
                  {biz.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
          </TabsList>
          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>Staff Name (EN) *</Label>
              <Input
                value={formData.nameEn || ''}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="John Smith"
              />
            </div>
          </TabsContent>
          <TabsContent value="fr" className="space-y-4">
            <div>
              <Label>Staff Name (FR) *</Label>
              <Input
                value={formData.nameFr || ''}
                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
          </TabsContent>
          <TabsContent value="ar" className="space-y-4" dir="rtl">
            <div>
              <Label>اسم الموظف (AR) *</Label>
              <Input
                value={formData.nameAr || ''}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="أحمد محمد"
                dir="rtl"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Role *</Label>
            <Input
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Barber, Therapist, etc."
            />
          </div>
          <div>
            <Label>Photo URL</Label>
            <Input
              value={formData.photoUrl || ''}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : selectedItem ? 'Update Staff' : 'Create Staff'}
        </Button>
      </div>
    );
  };

  const renderTranslationForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <Label>Translation Key *</Label>
          <Input
            value={formData.key || ''}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="landing.welcome"
            disabled={!!selectedItem}
          />
        </div>

        <div>
          <Label>Category</Label>
          <Input
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="landing, common, etc."
          />
        </div>

        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
          </TabsList>
          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>English Text *</Label>
              <Textarea
                value={formData.textEn || ''}
                onChange={(e) => setFormData({ ...formData, textEn: e.target.value })}
                placeholder="Welcome to our platform"
                rows={3}
              />
            </div>
          </TabsContent>
          <TabsContent value="fr" className="space-y-4">
            <div>
              <Label>French Text *</Label>
              <Textarea
                value={formData.textFr || ''}
                onChange={(e) => setFormData({ ...formData, textFr: e.target.value })}
                placeholder="Bienvenue sur notre plateforme"
                rows={3}
              />
            </div>
          </TabsContent>
          <TabsContent value="ar" className="space-y-4" dir="rtl">
            <div>
              <Label>Arabic Text *</Label>
              <Textarea
                value={formData.textAr || ''}
                onChange={(e) => setFormData({ ...formData, textAr: e.target.value })}
                placeholder="مرحباً بك في منصتنا"
                rows={3}
                dir="rtl"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : selectedItem ? 'Update Translation' : 'Create Translation'}
        </Button>
      </div>
    );
  };

  const renderSettingsForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Logo/Favicon URL
          </Label>
          <Input
            value={formData.logoUrl || globalSettings.logoUrl || ''}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
          {(formData.logoUrl || globalSettings.logoUrl) && (
            <img
              src={formData.logoUrl || globalSettings.logoUrl}
              alt="Logo preview"
              className="mt-2 h-16 w-16 object-contain border rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <p className="text-sm text-muted-foreground mt-1">
            This logo appears site-wide (header, favicon, etc.)
          </p>
        </div>

        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
          </TabsList>
          <TabsContent value="en" className="space-y-4">
            <div>
              <Label>Landing Hero Text (EN)</Label>
              <Input
                value={formData.heroTextEn || globalSettings.heroTextEn || ''}
                onChange={(e) => setFormData({ ...formData, heroTextEn: e.target.value })}
                placeholder="Welcome To Maw3id"
              />
            </div>
          </TabsContent>
          <TabsContent value="fr" className="space-y-4">
            <div>
              <Label>Landing Hero Text (FR)</Label>
              <Input
                value={formData.heroTextFr || globalSettings.heroTextFr || ''}
                onChange={(e) => setFormData({ ...formData, heroTextFr: e.target.value })}
                placeholder="Bienvenue À Maw3id"
              />
            </div>
          </TabsContent>
          <TabsContent value="ar" className="space-y-4" dir="rtl">
            <div>
              <Label>نص الصفحة الرئيسية (AR)</Label>
              <Input
                value={formData.heroTextAr || globalSettings.heroTextAr || ''}
                onChange={(e) => setFormData({ ...formData, heroTextAr: e.target.value })}
                placeholder="مرحباً بك في موعد"
                dir="rtl"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Update Settings'}
        </Button>
      </div>
    );
  };

  const renderPasswordForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <Label>Current Password</Label>
          <Input
            type="password"
            value={formData.currentPassword || ''}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            placeholder="Current password"
            autoComplete="off"
          />
        </div>
        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            value={formData.newPassword || ''}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="New password"
            autoComplete="off"
          />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            value={formData.confirmPassword || ''}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
            autoComplete="off"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading && businesses.length === 0 && customers.length === 0 && services.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground animate-pulse">Loading...</div>
        </div>
      );
    }

    switch (activeSection) {
      case 'businesses':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <Input
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Business
              </Button>
            </div>
            {businesses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No businesses found. Click "Add Business" to create one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {businesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle>{business.nameEn || business.name}</CardTitle>
                            {!business.isActive && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                          <CardDescription>
                            {business.email} • {business.phone}
                          </CardDescription>
                          <CardDescription className="mt-1">
                            Type: {business.businessType} • Slug: {business.slug}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center gap-2 mr-4 border-r pr-4">
                            <Label htmlFor={`active-${business.id}`} className="text-xs cursor-pointer">
                              {business.isActive ? 'Active' : 'Inactive'}
                            </Label>
                            <Switch
                              id={`active-${business.id}`}
                              checked={business.isActive}
                              onCheckedChange={() => handleToggleActivation(business, business.isActive)}
                            />
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(business)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(business)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-4">
            {customers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No customers found yet. Customers will appear here after they make bookings.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {customers.map((customer) => (
                  <Card key={customer.id}>
                    <CardHeader>
                      <CardTitle>{customer.firstName} {customer.lastName}</CardTitle>
                      <CardDescription>
                        {customer.email} • {customer.phone || 'No phone'}
                      </CardDescription>
                      <CardDescription className="mt-1">
                        Total Bookings: {customer.bookingCount || 0}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'services':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
            {services.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No services found. Click "Add Service" to create one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <CardTitle>{service.nameEn}</CardTitle>
                          <CardDescription>
                            {service.tenantName} • {service.duration} min • {service.price} MAD
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(service)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>
            {staff.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <UserCog className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No staff found. Click "Add Staff" to create one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {staff.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <CardTitle>{member.nameEn}</CardTitle>
                          <CardDescription>
                            {member.tenantName} • {member.role}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(member)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'appointments':
        return <AppointmentsView />;

      case 'contacts':
        return (
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No contact requests found.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <CardTitle>{contact.name}</CardTitle>
                          <CardDescription>
                            {new Date(contact.createdAt).toLocaleString()} • {contact.businessName || 'General Inquiry'}
                          </CardDescription>
                          <div className="mt-2 space-y-1 text-sm">
                            <div><strong>Email:</strong> {contact.email}</div>
                            <div><strong>Phone:</strong> {contact.phone}</div>
                            <div><strong>Preferred Contact:</strong> {contact.preferredContact}</div>
                          </div>
                          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                            {contact.message}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'i18n':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <Input
                placeholder="Search translations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Translation
              </Button>
            </div>
            {i18nStrings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No translations found. Click "Add Translation" to create one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {i18nStrings.map((string) => (
                  <Card key={string.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <CardTitle className="text-sm font-mono">{string.key}</CardTitle>
                          <CardDescription className="mt-2 space-y-1">
                            <div><strong>EN:</strong> {string.textEn}</div>
                            <div><strong>FR:</strong> {string.textFr}</div>
                            <div><strong>AR:</strong> {string.textAr}</div>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(string)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(string)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Configure site-wide settings (logo, favicon, hero text)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Logo/Favicon URL
                  </Label>
                  <Input
                    value={formData.logoUrl || globalSettings.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  {(formData.logoUrl || globalSettings.logoUrl) && (
                    <img
                      src={formData.logoUrl || globalSettings.logoUrl}
                      alt="Logo preview"
                      className="mt-2 h-16 w-16 object-contain border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    This logo appears site-wide (header, favicon, etc.)
                  </p>
                </div>

                <Tabs defaultValue="en">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="fr">Français</TabsTrigger>
                    <TabsTrigger value="ar">العربية</TabsTrigger>
                  </TabsList>
                  <TabsContent value="en" className="space-y-4">
                    <div>
                      <Label>Landing Hero Text (EN)</Label>
                      <Input
                        value={formData.heroTextEn || globalSettings.heroTextEn || ''}
                        onChange={(e) => setFormData({ ...formData, heroTextEn: e.target.value })}
                        placeholder="Welcome To Maw3id"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="fr" className="space-y-4">
                    <div>
                      <Label>Landing Hero Text (FR)</Label>
                      <Input
                        value={formData.heroTextFr || globalSettings.heroTextFr || ''}
                        onChange={(e) => setFormData({ ...formData, heroTextFr: e.target.value })}
                        placeholder="Bienvenue À Maw3id"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="ar" className="space-y-4" dir="rtl">
                    <div>
                      <Label>نص الصفحة الرئيسية (AR)</Label>
                      <Input
                        value={formData.heroTextAr || globalSettings.heroTextAr || ''}
                        onChange={(e) => setFormData({ ...formData, heroTextAr: e.target.value })}
                        placeholder="مرحباً بك في موعد"
                        dir="rtl"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Update Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'password':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your super admin password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={formData.currentPassword || ''}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Current password"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={formData.newPassword || ''}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="New password"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword || ''}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    autoComplete="off"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Section under development
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r flex flex-col animate-slide-in-left max-md:hidden">
        <div className="p-6 border-b">
          {logoUrl && (
            <Link href="/">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-10 w-10 mb-3 object-contain cursor-pointer transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          )}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
            Super Admin
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Button
            variant={activeSection === 'businesses' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('businesses')}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Businesses
          </Button>
          <Button
            variant={activeSection === 'customers' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('customers')}
          >
            <Users className="w-4 h-4 mr-2" />
            Customers
          </Button>
          <Button
            variant={activeSection === 'services' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('services')}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Services
          </Button>
          <Button
            variant={activeSection === 'staff' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('staff')}
          >
            <UserCog className="w-4 h-4 mr-2" />
            Staff
          </Button>
          <Button
            variant={activeSection === 'appointments' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('appointments')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Appointments
          </Button>
          <Button
            variant={activeSection === 'contacts' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('contacts')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Requests
          </Button>
          <Button
            variant={activeSection === 'i18n' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('i18n')}
          >
            <Languages className="w-4 h-4 mr-2" />
            Translations
          </Button>
          <Button
            variant={activeSection === 'settings' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </Button>
          <Button
            variant={activeSection === 'password' ? 'default' : 'ghost'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('password')}
          >
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
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
          <h2 className="text-xl font-bold">Super Admin</h2>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
                Super Admin
              </h2>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Button
                variant={activeSection === 'businesses' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('businesses')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Businesses
              </Button>
              <Button
                variant={activeSection === 'customers' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('customers')}
              >
                <Users className="w-4 h-4 mr-2" />
                Customers
              </Button>
              <Button
                variant={activeSection === 'services' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('services')}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Services
              </Button>
              <Button
                variant={activeSection === 'staff' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('staff')}
              >
                <UserCog className="w-4 h-4 mr-2" />
                Staff
              </Button>
              <Button
                variant={activeSection === 'appointments' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('appointments')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Appointments
              </Button>
              <Button
                variant={activeSection === 'i18n' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('i18n')}
              >
                <Languages className="w-4 h-4 mr-2" />
                Translations
              </Button>
              <Button
                variant={activeSection === 'settings' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Global Settings
              </Button>
              <Button
                variant={activeSection === 'password' ? 'default' : 'ghost'}
                className="w-full justify-start transition-all duration-300"
                onClick={() => setActiveSection('password')}
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto md:p-8 p-4 pt-24 md:pt-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent animate-fade-in">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </h1>
        {renderContent()}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              How would you like to notify the customer?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button
              variant={notificationMethod === 'email' ? 'default' : 'outline'}
              className="flex flex-col h-24 gap-2"
              onClick={() => setNotificationMethod('email')}
            >
              <Mail className="w-6 h-6" />
              Email
            </Button>
            <Button
              variant={notificationMethod === 'whatsapp' ? 'default' : 'outline'}
              className="flex flex-col h-24 gap-2"
              onClick={() => setNotificationMethod('whatsapp')}
            >
              <MessageCircle className="w-6 h-6" />
              WhatsApp
            </Button>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAction} disabled={isLoading}>
              {isLoading ? 'Confirming...' : 'Confirm Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="e.g., Unforeseen conflict, Staff unavailable..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notification Method</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={notificationMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('email')}
                >
                  Email
                </Button>
                <Button
                  size="sm"
                  variant={notificationMethod === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('whatsapp')}
                >
                  WhatsApp
                </Button>

              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancelAction} disabled={isLoading || !cancellationReason}>
              {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Date</Label>
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
                      {rescheduleDate ? format(rescheduleDate, "PPP") : <span>Pick a date</span>}
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
                <Label>New Time</Label>
                <Input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                placeholder="Reason for rescheduling..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notification Method</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={notificationMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('email')}
                >
                  Email
                </Button>
                <Button
                  size="sm"
                  variant={notificationMethod === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setNotificationMethod('whatsapp')}
                >
                  WhatsApp
                </Button>

              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRescheduleAction} disabled={isLoading || !rescheduleDate || !rescheduleTime}>
              {isLoading ? 'Rescheduling...' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit' : 'Create'} {
                activeSection === 'businesses' ? 'Business' :
                  activeSection === 'services' ? 'Service' :
                    activeSection === 'staff' ? 'Staff' :
                      activeSection === 'i18n' ? 'Translation' :
                        activeSection.charAt(0).toUpperCase() + activeSection.slice(1)
              }
            </DialogTitle>
          </DialogHeader>
          {activeSection === 'businesses' && renderBusinessForm()}
          {activeSection === 'services' && renderServiceForm()}
          {activeSection === 'staff' && renderStaffForm()}
          {activeSection === 'i18n' && renderTranslationForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}