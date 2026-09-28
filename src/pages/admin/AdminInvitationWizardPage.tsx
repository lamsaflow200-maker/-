/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { db } from '../../db';
import {
  Customer,
  Invitation,
  EventType,
  InvitationStatus,
  TemplateRecord,
} from '../../types/database';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { CustomerFormModal } from '../../components/admin/CustomerFormModal';
import { InvitationPreviewModal } from '../../components/admin/InvitationPreviewModal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
} from '../../utils/phone';
import {
  generateSlugCandidate,
  isValidSlug,
  sanitizeSlug,
} from '../../utils/slug';
import { uploadInvitationCover } from '../../utils/storage';
import {
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Globe,
  UploadCloud,
  Trash2,
  ExternalLink,
  Shield,
  Eye,
  Lock,
  Plus,
  Search,
  Check,
  HelpCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

const EVENT_TYPE_OPTIONS: Array<{ value: EventType; label: string; icon: string }> = [
  { value: 'wedding', label: 'حفل زفاف', icon: '💍' },
  { value: 'engagement', label: 'حفل خطوبة', icon: '✨' },
  { value: 'aqiqah', label: 'عقيقة ومولود', icon: '👶' },
  { value: 'graduation', label: 'حفل تخرج', icon: '🎓' },
  { value: 'birthday', label: 'عيد ميلاد', icon: '🎂' },
  { value: 'anniversary', label: 'ذكرى سنوية', icon: '🥂' },
  { value: 'family_event', label: 'مناسبة عائلية', icon: '🏡' },
  { value: 'private_event', label: 'مناسبة خاصة', icon: '👑' },
  { value: 'other', label: 'مناسبة أخرى', icon: '💌' },
];

const TEMPLATE_PRESETS = [
  { id: 'royal-gold', name: 'الذهب الملكي (Royal Gold)', color: '#D4AF37', bg: '#0E0E11' },
  { id: 'elegant-pearl', name: 'اللؤلؤ الأنيق (Elegant Pearl)', color: '#C9A45C', bg: '#FAF9F6' },
  { id: 'moroccan-palace', name: 'القصر المغربي (Moroccan Palace)', color: '#C5A059', bg: '#152C4D' },
  { id: 'black-luxury', name: 'الفخامة السوداء (Black Luxury)', color: '#F3C64F', bg: '#08080A' },
  { id: 'floral-romance', name: 'الزهور الرومانسية (Floral Romance)', color: '#D4818B', bg: '#FFFDFC' },
  { id: 'sapphire-night', name: 'ليلة الياقوت (Sapphire Night)', color: '#D4AF37', bg: '#0A1128' },
  { id: 'rose-romance', name: 'رومانسية الورد (Rose Romance)', color: '#E0A899', bg: '#FAF6F5' },
  { id: 'emerald-royal', name: 'الزمرد الملكي (Emerald Royal)', color: '#D4AF37', bg: '#06100B' },
  { id: 'minimal-white', name: 'البياض الناصع (Minimal White)', color: '#A38F78', bg: '#FAFAFA' },
  { id: 'golden-sunset', name: 'الغروب الذهبي (Golden Sunset)', color: '#FFD700', bg: '#1A0E05' },
];

export const AdminInvitationWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customer_id');

  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Wizard active step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Customer Data & Selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Form Fields - Step 1: Customer
  const [customerId, setCustomerId] = useState<string>(preselectedCustomerId || '');

  // Form Fields - Step 2: Event Details & Names
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState<string>('');
  const [firstCelebrantName, setFirstCelebrantName] = useState<string>('');
  const [secondCelebrantName, setSecondCelebrantName] = useState<string>('');
  const [hostNames, setHostNames] = useState<string>('');
  const [invitationText, setInvitationText] = useState<string>('');

  // Form Fields - Step 3: Date, Time, Venue, WhatsApp
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('ابتداءً من الساعة 8:00 مساءً');
  const [timezone, setTimezone] = useState<string>('Africa/Casablanca');
  const [venueName, setVenueName] = useState<string>('');
  const [venueCity, setVenueCity] = useState<string>('');
  const [venueAddress, setVenueAddress] = useState<string>('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [hostWhatsapp, setHostWhatsapp] = useState<string>('');

  // Form Fields - Step 4: Slug, Settings, Cover, Template
  const [slug, setSlug] = useState<string>('');
  const [isSlugAutoGenerated, setIsSlugAutoGenerated] = useState(!isEditing);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const [status, setStatus] = useState<InvitationStatus>('draft');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [rsvpEnabled, setRsvpEnabled] = useState<boolean>(true);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('classic-elegance');

  // Preview Foundation modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cover image upload state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [custList] = await Promise.all([
          db.customers.getAll(false),
        ]);
        setCustomers(custList);

        if (preselectedCustomerId) {
          setCustomerId(preselectedCustomerId);
          const found = custList.find((c) => c.id === preselectedCustomerId);
          if (found?.phone) {
            setHostWhatsapp(found.phone);
          }
        }

        if (id) {
          const inv = await db.invitations.getById(id);
          if (!inv) {
            toastError('الدعوة المطلوبة غير موجودة');
            navigate('/admin/invitations');
            return;
          }

          setCustomerId(inv.customer_id);
          setEventType(inv.event_type);
          setTitle(inv.title);
          setSlug(inv.slug);
          setIsSlugAutoGenerated(false);
          setStatus(inv.status);
          setEventDate(inv.event_date || inv.content?.date_iso || '');
          setEventTime(inv.event_time || inv.content?.time_text || '');
          setTimezone(inv.timezone || 'Africa/Casablanca');
          setVenueName(inv.venue_name || inv.content?.venue_name || '');
          setVenueCity(inv.content?.venue_city || '');
          setVenueAddress(inv.venue_address || inv.content?.venue_address || '');
          setGoogleMapsUrl(inv.google_maps_url || inv.content?.google_maps_url || '');
          setHostWhatsapp(inv.host_whatsapp || '');
          setCoverImageUrl(inv.cover_image_url || '');
          setTemplateId(inv.template_id || 'classic-elegance');
          setRsvpEnabled(inv.rsvp_enabled ?? true);
          setExpiresAt(inv.expires_at || '');

          if (inv.content) {
            setHostNames(inv.content.host_names || '');
            setFirstCelebrantName(inv.content.first_celebrant_name || '');
            setSecondCelebrantName(inv.content.second_celebrant_name || '');
            setInvitationText(inv.content.invitation_text || '');
          }
        }
      } catch {
        toastError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, preselectedCustomerId]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === customerId) || null;
  }, [customers, customerId]);

  // Combined Celebrant Names
  const combinedCelebrantNames = useMemo(() => {
    if (firstCelebrantName && secondCelebrantName) {
      return `${firstCelebrantName.trim()} & ${secondCelebrantName.trim()}`;
    }
    return firstCelebrantName.trim() || secondCelebrantName.trim() || '';
  }, [firstCelebrantName, secondCelebrantName]);

  // Auto-fill title if empty when names change
  useEffect(() => {
    if (!isEditing && !title.trim() && combinedCelebrantNames) {
      const typeLabel = EVENT_TYPE_OPTIONS.find((t) => t.value === eventType)?.label || 'دعوة';
      setTitle(`${typeLabel} ${combinedCelebrantNames}`);
      setIsDirty(true);
    }
  }, [combinedCelebrantNames, eventType, isEditing]);

  // Auto-generate slug candidate when names or title change in create mode
  useEffect(() => {
    if (isSlugAutoGenerated && (combinedCelebrantNames || title)) {
      const base = combinedCelebrantNames || title;
      const candidate = generateSlugCandidate(base);
      if (candidate) {
        setSlug(candidate);
        checkSlugLive(candidate);
      }
    }
  }, [combinedCelebrantNames, title, isSlugAutoGenerated]);

  // Check slug availability in DB
  const checkSlugLive = async (candidateSlug: string) => {
    if (!candidateSlug || !isValidSlug(candidateSlug)) {
      setIsSlugAvailable(false);
      return;
    }
    try {
      setIsCheckingSlug(true);
      const available = await db.invitations.checkSlugAvailable(candidateSlug.trim(), id);
      setIsSlugAvailable(available);
    } catch {
      // ignore
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Unsaved changes alert
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Validate current step before proceeding
  const validateStep = (stepNumber: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!customerId) {
        stepErrors.customerId = 'يجب اختيار العميل صاحب المناسبة أو إضافة عميل جديد';
      }
    }

    if (stepNumber === 2) {
      if (!title.trim()) {
        stepErrors.title = 'عنوان الدعوة مطلوب للتعريف بها في النظام';
      }
      if (!firstCelebrantName.trim()) {
        stepErrors.firstCelebrantName = 'يرجى إدخال اسم صاحب المناسبة (الشخص الأول)';
      }
    }

    if (stepNumber === 3) {
      if (!eventDate) {
        stepErrors.eventDate = 'يرجى تحديد تاريخ المناسبة';
      }
      if (googleMapsUrl.trim()) {
        try {
          new URL(googleMapsUrl.trim());
        } catch {
          stepErrors.googleMapsUrl = 'صيغة رابط Google Maps غير صحيحة، يرجى إدخال رابط يبدأ بـ https://';
        }
      }
      if (hostWhatsapp.trim() && !isValidMoroccanPhone(hostWhatsapp.trim())) {
        stepErrors.hostWhatsapp = 'رقم الواتساب غير صالح، يرجى إدخال رقم مغربي صحيح (مثال: 0661234567)';
      }
    }

    if (stepNumber === 4) {
      if (!slug.trim()) {
        stepErrors.slug = 'الرابط المخصص (Slug) مطلوب';
      } else if (!isValidSlug(slug.trim())) {
        stepErrors.slug = 'الرابط يجب أن يحتوي على أحرف لاتينية وأرقام وشرطات فقط بدون مسافات (مثال: sara-ahmed)';
      } else if (isSlugAvailable === false) {
        stepErrors.slug = 'هذا الرابط مستخدم بالفعل لدعوة أخرى، يرجى تعديله أو الضغط على اقتراح بديل';
      }

      if (expiresAt && eventDate && new Date(expiresAt) < new Date(eventDate)) {
        stepErrors.expiresAt = 'تاريخ انتهاء الدعوة يجب أن يكون بعد تاريخ المناسبة';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Suggest unique slug
  const handleAutoSuggestSlug = async () => {
    const base = combinedCelebrantNames || title || 'invitation';
    const suggested = await db.invitations.generateUniqueSlug(base, id);
    setSlug(suggested);
    setIsSlugAutoGenerated(false);
    setIsSlugAvailable(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.slug;
      return next;
    });
  };

  // Cover image file change
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const result = await uploadInvitationCover(file);
      setCoverImageUrl(result.url);
      setIsDirty(true);
      success('تم رفع وتجهيز صورة الغلاف بنجاح');
    } catch (err: any) {
      toastError(err.message || 'فشل رفع صورة الغلاف');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Save (Draft or Final)
  const handleSave = async (targetStatus?: InvitationStatus) => {
    // Check required minimal fields for draft
    if (!customerId) {
      toastError('يرجى اختيار العميل صاحب المناسبة');
      setCurrentStep(1);
      return;
    }
    if (!title.trim()) {
      toastError('يرجى إدخال عنوان الدعوة');
      setCurrentStep(2);
      return;
    }
    if (!slug.trim()) {
      toastError('يرجى تحديد الرابط المخصص (Slug)');
      setCurrentStep(4);
      return;
    }

    // Check slug availability
    const available = await db.invitations.checkSlugAvailable(slug.trim(), id);
    if (!available) {
      toastError('الرابط المخصص (Slug) مستخدم بالفعل، يرجى اختيار رابط بديل');
      setCurrentStep(4);
      return;
    }

    setIsSaving(true);
    const effectiveStatus = targetStatus || status;

    const payload = {
      customer_id: customerId,
      template_id: templateId,
      event_type: eventType,
      title: title.trim(),
      slug: sanitizeSlug(slug),
      status: effectiveStatus,
      event_date: eventDate || undefined,
      event_time: eventTime.trim() || undefined,
      timezone: timezone.trim() || 'Africa/Casablanca',
      venue_name: venueName.trim() || undefined,
      venue_address: venueAddress.trim() || undefined,
      google_maps_url: googleMapsUrl.trim() || undefined,
      host_whatsapp: hostWhatsapp.trim() ? normalizeWhatsAppNumber(hostWhatsapp) : undefined,
      cover_image_url: coverImageUrl || undefined,
      rsvp_enabled: rsvpEnabled,
      expires_at: expiresAt || undefined,
      content: {
        host_names: hostNames.trim() || undefined,
        celebrant_names: combinedCelebrantNames,
        first_celebrant_name: firstCelebrantName.trim() || undefined,
        second_celebrant_name: secondCelebrantName.trim() || undefined,
        event_title: title.trim(),
        invitation_text: invitationText.trim(),
        date_iso: eventDate,
        time_text: eventTime.trim(),
        venue_name: venueName.trim(),
        venue_city: venueCity.trim(),
        venue_address: venueAddress.trim(),
        google_maps_url: googleMapsUrl.trim() || undefined,
      },
      theme: {
        primary_color: '#5A1020',
        accent_color: '#C9A45C',
        background_color: '#FAF7F2',
        text_color: '#171316',
        font_family_arabic: 'Amiri, serif',
        font_family_latin: 'Cinzel, serif',
      },
      settings: {
        allow_rsvp: rsvpEnabled,
        rsvp_deadline: undefined,
        max_party_size: 4,
        enable_music: true,
        enable_gallery: true,
        enable_countdown: true,
        enable_guest_messages: true,
        is_password_protected: false,
        show_qr_code: true,
      },
    };

    try {
      if (isEditing && id) {
        await db.invitations.update(id, payload);
        success('تم تحديث بيانات الدعوة بنجاح!');
      } else {
        await db.invitations.create(payload as any);
        success(
          effectiveStatus === 'active'
            ? 'تم نشر وتفعيل الدعوة بنجاح!'
            : 'تم حفظ مسودة الدعوة بنجاح!'
        );
      }
      setIsDirty(false);
      navigate('/admin/invitations');
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ الدعوة في قاعدة البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6F6668]">جاري تجهيز محرر الدعوة وقاعدة البيانات...</p>
      </div>
    );
  }

  // Prepared draft invitation object for Preview Foundation
  const previewDraftObject: Invitation = {
    id: id || 'preview-id',
    customer_id: customerId,
    template_id: templateId,
    event_type: eventType,
    title: title || 'معاينة الدعوة',
    slug: slug || 'preview-slug',
    status: status,
    event_date: eventDate,
    event_time: eventTime,
    timezone: timezone,
    venue_name: venueName,
    venue_address: venueAddress,
    google_maps_url: googleMapsUrl,
    host_whatsapp: hostWhatsapp,
    cover_image_url: coverImageUrl,
    rsvp_enabled: rsvpEnabled,
    expires_at: expiresAt,
    content: {
      host_names: hostNames,
      celebrant_names: combinedCelebrantNames,
      first_celebrant_name: firstCelebrantName,
      second_celebrant_name: secondCelebrantName,
      event_title: title,
      invitation_text: invitationText,
      date_iso: eventDate,
      time_text: eventTime,
      venue_name: venueName,
      venue_city: venueCity,
      venue_address: venueAddress,
      google_maps_url: googleMapsUrl,
    },
    theme: {
      primary_color: '#5A1020',
      accent_color: '#C9A45C',
      background_color: '#FAF7F2',
      text_color: '#171316',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    settings: {
      allow_rsvp: rsvpEnabled,
      rsvp_deadline: undefined,
      max_party_size: 4,
      enable_music: true,
      enable_gallery: true,
      enable_countdown: true,
      enable_guest_messages: true,
      is_password_protected: false,
      show_qr_code: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6 text-right motion-fade-in max-w-6xl mx-auto pb-16">
      {/* Top Header & Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED8]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/invitations"
            className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] text-[#6F6668] hover:text-[#5A1020] hover:border-[#C9A45C]/60 transition cursor-pointer"
            title="العودة لقائمة الدعوات"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
              {isEditing ? `تعديل الدعوة: ${title || 'بدون عنوان'}` : 'إنشاء دعوة رقمية جديدة'}
            </h1>
            <p className="text-xs text-[#6F6668] mt-0.5">
              نظام المراحل المترابط لإنشاء وتجهيز الدعوات الفاخرة وربطها بالعميل
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            icon={<Eye className="w-3.5 h-3.5 text-[#C9A45C]" />}
          >
            معاينة الأساس
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isSaving}
            onClick={() => handleSave('draft')}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            حفظ كمسودة
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={() => handleSave()}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {isEditing ? 'حفظ التعديلات' : 'نشر واعتماد'}
          </Button>
        </div>
      </div>

      {/* Step Progress Navigation Ribbon */}
      <div className="p-2 sm:p-3 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { step: 1, title: 'اختيار العميل', desc: 'ربط بصاحب المناسبة' },
            { step: 2, title: 'معلومات المناسبة', desc: 'العنوان وأصحاب الحفل' },
            { step: 3, title: 'المكان والتوقيت', desc: 'التاريخ، القاعة، والموقع' },
            { step: 4, title: 'الرابط والإعدادات', desc: 'الـ Slug، القالب، والغلاف' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step < currentStep || validateStep(currentStep)) {
                    setCurrentStep(item.step);
                  }
                }}
                className={`p-2.5 sm:p-3 rounded-xl text-right transition flex items-center gap-2.5 cursor-pointer border ${
                  isActive
                    ? 'bg-[#5A1020] text-[#FAF7F2] border-[#5A1020] shadow-xs'
                    : isCompleted
                    ? 'bg-[#EDF7EE] text-[#175E27] border-[#BFE4C6]'
                    : 'bg-[#FAF7F2] text-[#6F6668] border-[#E8DED8] hover:bg-[#F4ECE4]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#C9A45C] text-[#171316]'
                      : isCompleted
                      ? 'bg-[#218739] text-[#FFFFFF]'
                      : 'bg-[#E8DED8] text-[#6F6668]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-[11px] sm:text-xs">{item.title}</p>
                  <p className={`text-[10px] truncate ${isActive ? 'text-[#FAF7F2]/80' : 'text-[#9A8F92]'}`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Layout (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Multi-step Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* ======================================================== */}
          {/* STEP 1: SELECT CUSTOMER                                  */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-5 motion-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DED8]">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#171316] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#C9A45C]" />
                    المرحلة 1 — اختيار العميل صاحب المناسبة
                  </h3>
                  <p className="text-xs text-[#6F6668] mt-0.5">
                    اختر صاحب المناسبة من قاعدة البيانات أو أضف عميلاً جديداً لربطه بالدعوة
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsNewCustomerModalOpen(true)}
                >
                  + إضافة عميل جديد
                </Button>
              </div>

              {/* Customer Search Filter */}
              <div className="relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="ابحث عن العميل بالاسم أو رقم الهاتف..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] focus:border-[#C9A45C] focus:bg-[#FFFFFF] outline-none transition"
                />
                <Search className="w-4 h-4 text-[#9A8F92] absolute left-3 top-3 pointer-events-none" />
              </div>

              {/* Customer Selection Cards */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {customers
                  .filter((c) => {
                    if (!customerSearch.trim()) return true;
                    const query = customerSearch.trim().toLowerCase();
                    return (
                      c.full_name.toLowerCase().includes(query) ||
                      c.phone.includes(query) ||
                      (c.city && c.city.toLowerCase().includes(query))
                    );
                  })
                  .map((cust) => {
                    const isSelected = customerId === cust.id;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setCustomerId(cust.id);
                          if (!hostWhatsapp && cust.phone) {
                            setHostWhatsapp(cust.phone);
                          }
                          setIsDirty(true);
                          if (errors.customerId) {
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.customerId;
                              return next;
                            });
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#F6ECF0] border-[#5A1020] ring-1 ring-[#5A1020] shadow-2xs'
                            : 'bg-[#FAF7F2]/60 border-[#E8DED8] hover:border-[#C9A45C]/60 hover:bg-[#FFFFFF]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold text-sm ${
                              isSelected
                                ? 'bg-[#5A1020] text-[#C9A45C]'
                                : 'bg-[#E8DED8] text-[#171316]'
                            }`}
                          >
                            {cust.full_name[0]}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#171316]">{cust.full_name}</h4>
                            <div className="flex items-center gap-3 text-[10px] text-[#6F6668] mt-0.5">
                              <span dir="ltr" className="font-mono">
                                {cust.phone}
                              </span>
                              {cust.city && <span>• {cust.city}</span>}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#5A1020] text-[#FAF7F2] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {errors.customerId && (
                <p className="text-xs text-[#B42318] flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.customerId}
                </p>
              )}

              {/* Selected Customer Details Box */}
              {selectedCustomer && (
                <div className="p-4 rounded-xl bg-[#EDF7EE] border border-[#BFE4C6] text-xs text-[#175E27] space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#218739]" />
                    تم ربط الدعوة بالعميل: {selectedCustomer.full_name}
                  </p>
                  <p className="text-[11px] text-[#175E27]/80">
                    رقم الهاتف: <span dir="ltr" className="font-mono">{selectedCustomer.phone}</span>
                    {selectedCustomer.city && ` | المدينة: ${selectedCustomer.city}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: EVENT DETAILS & NAMES                            */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-5 motion-fade-in">
              <div className="pb-3 border-b border-[#E8DED8]">
                <h3 className="text-base font-serif font-bold text-[#171316]">
                  المرحلة 2 — نوع المناسبة والمعلومات الأساسية
                </h3>
                <p className="text-xs text-[#6F6668] mt-0.5">
                  حدد تصنيف الحدث وأسماء أصحاب المناسبة وعنوان الدعوة الإداري
                </p>
              </div>

              {/* Event Type Grid */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-2">
                  نوع المناسبة <span className="text-[#B42318]">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {EVENT_TYPE_OPTIONS.map((opt) => {
                    const isSelected = eventType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setEventType(opt.value);
                          setIsDirty(true);
                        }}
                        className={`p-3 rounded-xl border text-right transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#5A1020] text-[#FAF7F2] border-[#5A1020] shadow-xs'
                            : 'bg-[#FAF7F2] text-[#171316] border-[#E8DED8] hover:border-[#C9A45C]'
                        }`}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Celebrant Names (Person 1 & Person 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    اسم صاحب المناسبة (الشخص الأول) <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstCelebrantName}
                    onChange={(e) => {
                      setFirstCelebrantName(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="مثال: سارة الفاسي أو أحمد المنصوري"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                  />
                  {errors.firstCelebrantName && (
                    <p className="text-[11px] text-[#B42318] mt-1">{errors.firstCelebrantName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    الشخص الثاني <span className="text-[10px] text-[#6F6668] font-normal">(لحفلات الزفاف والخطوبة)</span>
                  </label>
                  <input
                    type="text"
                    value={secondCelebrantName}
                    onChange={(e) => {
                      setSecondCelebrantName(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="مثال: أحمد المنصوري (اختياري)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                  />
                </div>
              </div>

              {/* Host Family Names */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-1">
                  عائلات أصحاب الدعوة <span className="text-[10px] text-[#6F6668] font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={hostNames}
                  onChange={(e) => {
                    setHostNames(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="مثال: عائلتا المنصوري والفاسي"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-1">
                  عنوان الدعوة الإداري <span className="text-[#B42318]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="مثال: حفل زفاف سارة وأحمد"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                />
                {errors.title && (
                  <p className="text-[11px] text-[#B42318] mt-1">{errors.title}</p>
                )}
              </div>

              {/* Invitation Welcome Text */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-1">
                  نص الترحيب وديباجة الدعوة
                </label>
                <Textarea
                  rows={3}
                  value={invitationText}
                  onChange={(e) => {
                    setInvitationText(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="تتشرف عائلاتنا بدعوة سيادتكم الكريمة لمشاركتنا فرحة العمر بمناسبة..."
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: DATE, TIME, VENUE & WHATSAPP                     */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-5 motion-fade-in">
              <div className="pb-3 border-b border-[#E8DED8]">
                <h3 className="text-base font-serif font-bold text-[#171316]">
                  المرحلة 3 — تاريخ ووقت ومكان المناسبة
                </h3>
                <p className="text-xs text-[#6F6668] mt-0.5">
                  تفاصيل موعد الحفل وموقع القاعة ورقم التواصل المعتمد
                </p>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    تاريخ المناسبة (Event Date) <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => {
                      setEventDate(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] font-mono focus:border-[#C9A45C] outline-none"
                  />
                  {errors.eventDate && (
                    <p className="text-[11px] text-[#B42318] mt-1">{errors.eventDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    وقت المناسبة (Event Time)
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => {
                      setEventTime(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="مثال: ابتداءً من الساعة الثامنة مساءً"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-1">
                  المنطقة الزمنية (Timezone)
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] font-mono focus:border-[#C9A45C] outline-none"
                />
                <p className="text-[10px] text-[#6F6668] mt-1">
                  الافتراضي للمغرب: Africa/Casablanca (GMT+1)
                </p>
              </div>

              {/* Venue Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    اسم القاعة أو المكان (Venue Name)
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => {
                      setVenueName(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="مثال: قصر الفردوس للأفراح"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    المدينة (Venue City)
                  </label>
                  <input
                    type="text"
                    value={venueCity}
                    onChange={(e) => {
                      setVenueCity(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="مثال: الرباط، الدار البيضاء..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-1">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => {
                    setVenueAddress(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="مثال: شارع النخيل، حي الرياض، قرب فندق..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none"
                />
              </div>

              {/* Google Maps URL with Test Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#171316]">
                    رابط خرائط جوجل (Google Maps URL)
                  </label>
                  {googleMapsUrl.trim() && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#5A1020] hover:text-[#C9A45C] flex items-center gap-1 underline font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      اختبار الرابط
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    dir="ltr"
                    value={googleMapsUrl}
                    onChange={(e) => {
                      setGoogleMapsUrl(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] font-mono focus:border-[#C9A45C] outline-none"
                  />
                  <MapPin className="w-4 h-4 text-[#9A8F92] absolute left-3 top-3 pointer-events-none" />
                </div>
                {errors.googleMapsUrl && (
                  <p className="text-[11px] text-[#B42318] mt-1">{errors.googleMapsUrl}</p>
                )}
              </div>

              {/* WhatsApp Number (Moroccan validation) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#171316]">
                    رقم WhatsApp الخاص بصاحب المناسبة (Host WhatsApp)
                  </label>
                  <span className="text-[10px] text-[#6F6668]">للتواصل والربط المستقبلي</span>
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={hostWhatsapp}
                    onChange={(e) => {
                      setHostWhatsapp(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="0661234567 أو +212 661-234567"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] font-mono focus:border-[#C9A45C] outline-none"
                  />
                  <Phone className="w-4 h-4 text-[#218739] absolute left-3 top-3 pointer-events-none" />
                </div>
                {errors.hostWhatsapp && (
                  <p className="text-[11px] text-[#B42318] mt-1">{errors.hostWhatsapp}</p>
                )}
                {hostWhatsapp.trim() && (
                  <div className="text-[11px] font-mono flex items-center gap-1.5 pt-1">
                    {isValidWhatsAppNumber(hostWhatsapp) ? (
                      <span className="text-[#175E27] bg-[#EDF7EE] px-2 py-0.5 rounded border border-[#BFE4C6] flex items-center gap-1">
                        <span>الصيغة الموحدة لـ WhatsApp:</span>
                        <strong dir="ltr">{normalizeWhatsAppNumber(hostWhatsapp)}</strong>
                      </span>
                    ) : (
                      <span className="text-[#B42318] bg-[#FEECEB] px-2 py-0.5 rounded border border-[#F8B6B2]">
                        رقم هاتف غير صالح
                      </span>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-[#6F6668] mt-1">
                  🔒 يتم توحيد الرقم تلقائياً بالصيغة الدولية المعتمدة لفتح محادثة WhatsApp مباشرة.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: SLUG, COVER, TEMPLATE & SETTINGS                 */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-6 motion-fade-in">
              <div className="pb-3 border-b border-[#E8DED8]">
                <h3 className="text-base font-serif font-bold text-[#171316]">
                  المرحلة 4 — الرابط العام، القالب، وصورة الغلاف
                </h3>
                <p className="text-xs text-[#6F6668] mt-0.5">
                  إعداد عنوان URL العام واختيار القالب الأساسي ورفع صورة الغلاف
                </p>
              </div>

              {/* Slug Configuration with Live Availability & Suggestion */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#171316]">
                    رابط الدعوة المخصص (Slug) <span className="text-[#B42318]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestSlug}
                    className="text-[11px] text-[#5A1020] hover:text-[#C9A45C] flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    اقتراح رابط فريد
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      dir="ltr"
                      value={slug}
                      onChange={(e) => {
                        const cleaned = sanitizeSlug(e.target.value);
                        setSlug(cleaned);
                        setIsSlugAutoGenerated(false);
                        setIsDirty(true);
                        checkSlugLive(cleaned);
                      }}
                      placeholder="sara-ahmed-wedding"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] font-mono focus:border-[#C9A45C] outline-none"
                    />
                  </div>
                  <span className="text-xs text-[#6F6668] font-mono bg-[#FAF7F2] px-3 py-2.5 rounded-lg border border-[#E8DED8]" dir="ltr">
                    mnasbati.ma/i/
                  </span>
                </div>

                {/* Slug Feedback */}
                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  {isCheckingSlug ? (
                    <span className="text-[#9A8F92]">جاري التحقق من توفر الرابط...</span>
                  ) : isSlugAvailable === true ? (
                    <span className="text-[#218739] flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      الرابط متاح وصالح للاستخدام
                    </span>
                  ) : isSlugAvailable === false ? (
                    <span className="text-[#B42318] flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      الرابط مستخدم مسبقاً لدعوة أخرى
                    </span>
                  ) : null}
                </div>
                {errors.slug && (
                  <p className="text-[11px] text-[#B42318] mt-1">{errors.slug}</p>
                )}
              </div>

              {/* Status & Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    حالة الدعوة (Invitation Status)
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as InvitationStatus);
                      setIsDirty(true);
                    }}
                    className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] outline-none cursor-pointer"
                  >
                    <option value="draft">مسودة (Draft) — غير منشورة للزوار</option>
                    <option value="active">نشطة (Active) — منشورة ومتاحة</option>
                    <option value="paused">متوقفة مؤقتاً (Paused)</option>
                    <option value="expired">منتهية (Expired)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171316] mb-1">
                    تاريخ انتهاء الدعوة (expires_at) <span className="text-[10px] text-[#6F6668] font-normal">(اختياري)</span>
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => {
                      setExpiresAt(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] font-mono focus:border-[#C9A45C] outline-none"
                  />
                  {errors.expiresAt && (
                    <p className="text-[11px] text-[#B42318] mt-1">{errors.expiresAt}</p>
                  )}
                </div>
              </div>

              {/* RSVP Toggle */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#171316]">تأكيد الحضور (RSVP Enabled)</p>
                  <p className="text-[10px] text-[#6F6668] mt-0.5">
                    تفعيل نموذج تأكيد الحضور الرقمي للضيوف
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rsvpEnabled}
                    onChange={(e) => {
                      setRsvpEnabled(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E8DED8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A1020]"></div>
                </label>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-1.5">
                  الصورة الرئيسية (Cover Image)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {coverImageUrl ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#E8DED8] shadow-2xs">
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingCover}
                      >
                        تغيير الصورة
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setCoverImageUrl('');
                          setIsDirty(true);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-[#E8DED8] hover:border-[#C9A45C] rounded-xl flex flex-col items-center justify-center cursor-pointer transition bg-[#FAF7F2]/60 hover:bg-[#FFFFFF]"
                  >
                    <UploadCloud className="w-8 h-8 text-[#C9A45C] mb-2" />
                    <p className="text-xs font-bold text-[#171316]">
                      {isUploadingCover ? 'جاري رفع الصورة وتحسينها...' : 'انقر لرفع صورة الغلاف'}
                    </p>
                    <p className="text-[10px] text-[#6F6668] mt-1 font-mono">
                      JPG, PNG, WEBP (الحد الأقصى 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Template Foundation Picker */}
              <div>
                <label className="block text-xs font-bold text-[#171316] mb-2">
                  القالب المعتمد (Template Foundation)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {TEMPLATE_PRESETS.map((t) => {
                    const isSelected = templateId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setTemplateId(t.id);
                          setIsDirty(true);
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#F6ECF0] border-[#5A1020] ring-1 ring-[#5A1020] shadow-2xs'
                            : 'bg-[#FFFFFF] border-[#E8DED8] hover:border-[#C9A45C]/60'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg border border-[#E8DED8] shrink-0"
                          style={{ backgroundColor: t.bg }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#171316] truncate">{t.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8DED8]">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handlePrevStep}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                السابق
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleSave('draft')}
                isLoading={isSaving}
              >
                حفظ كمسودة
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNextStep}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  المتابعة للخطوة التالية
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  onClick={() => handleSave()}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isEditing ? 'حفظ التعديلات' : 'نشر واعتماد الدعوة'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Live Summary & Preview Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="sticky top-24 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DED8]">
              <h3 className="text-sm font-serif font-bold text-[#171316]">
                ملخص الدعوة المباشر
              </h3>
              <StatusBadge status={status} size="sm" />
            </div>

            {/* Live Cover Preview */}
            <div className="w-full h-32 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] overflow-hidden relative flex items-center justify-center">
              {coverImageUrl ? (
                <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-3 text-[#9A8F92]">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 text-[#C9A45C]" />
                  <span className="text-[10px]">بدون صورة غلاف بعد</span>
                </div>
              )}
            </div>

            {/* Quick Summary Info */}
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">العميل صاحب المناسبة:</span>
                <strong className="text-[#171316] truncate block">
                  {selectedCustomer ? selectedCustomer.full_name : 'لم يتم تحديده بعد'}
                </strong>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">عنوان الدعوة:</span>
                <strong className="text-[#171316] block truncate">
                  {title || 'بدون عنوان بعد'}
                </strong>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">تاريخ المناسبة:</span>
                <span className="font-mono text-[#171316]">
                  {eventDate || 'غير محدد'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">الرابط العام (Slug):</span>
                <span dir="ltr" className="font-mono text-[11px] text-[#C9A45C] block truncate">
                  /i/{slug || '...'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-[#E8DED8] space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsPreviewOpen(true)}
                icon={<Eye className="w-3.5 h-3.5 text-[#C9A45C]" />}
              >
                معاينة الأساس (Foundation)
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                isLoading={isSaving}
                onClick={() => handleSave('draft')}
              >
                حفظ كمسودة
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Quick Add Customer Modal */}
      {isNewCustomerModalOpen && (
        <CustomerFormModal
          isOpen={isNewCustomerModalOpen}
          onClose={() => setIsNewCustomerModalOpen(false)}
          onSuccess={(newCust) => {
            setCustomers((prev) => [newCust, ...prev]);
            setCustomerId(newCust.id);
            if (newCust.phone) {
              setHostWhatsapp(newCust.phone);
            }
            setIsNewCustomerModalOpen(false);
          }}
        />
      )}

      {/* Modal 2: Preview Foundation Modal */}
      {isPreviewOpen && (
        <InvitationPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          invitation={previewDraftObject}
          customerName={selectedCustomer?.full_name}
          template={TEMPLATE_PRESETS.find((t) => t.id === templateId) as any}
        />
      )}
    </div>
  );
};
