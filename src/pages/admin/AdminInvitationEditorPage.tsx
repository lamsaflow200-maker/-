/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file AdminInvitationEditorPage component.
 * Centralized Luxury Invitation Editor (Prompt 14 requirement 23).
 * Organizes the editor into 7 collapsible, focused sections:
 * 1. Basic Information (المعلومات الأساسية)
 * 2. Event Details (تفاصيل المناسبة والمكان)
 * 3. Design (التصميم والقالب)
 * 4. Cover (صورة الغلاف)
 * 5. Gallery (معرض الصور)
 * 6. Video (فيديو المناسبة)
 * 7. Music (الموسيقى والخلفية الصوتية)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { db } from '../../db';
import { Customer, EventType, InvitationStatus } from '../../types/database';
import { getAllTemplates } from '../../templates/registry';
import { normalizeWhatsAppNumber, isValidWhatsAppNumber } from '../../utils/phone';
import { useToast } from '../../components/ui/Toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { AdminGalleryManager } from '../../components/admin/media/AdminGalleryManager';
import { AdminVideoManager } from '../../components/admin/media/AdminVideoManager';
import { AdminMusicSelector } from '../../components/admin/media/AdminMusicSelector';
import { InvitationQRCodeCard } from '../../components/admin/qr/InvitationQRCodeCard';
import { isValidGoogleMapsUrl, isValidDateString } from '../../utils/datetime';
import {
  Save,
  ArrowRight,
  ExternalLink,
  Sparkles,
  MapPin,
  Users,
  Palette,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Calendar,
  Layers,
  Check,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CollapsedSectionsState {
  basic: boolean;
  eventDetails: boolean;
  design: boolean;
  cover: boolean;
  gallery: boolean;
  video: boolean;
  music: boolean;
}

export const AdminInvitationEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateFromQuery = searchParams.get('template');
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Accordion Sections Open/Closed State (Prompt 14 requirement 23: each section can be opened/closed)
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSectionsState>({
    basic: true,
    eventDetails: true,
    design: true,
    cover: true,
    gallery: true,
    video: true,
    music: true,
  });

  const toggleSection = (sectionKey: keyof CollapsedSectionsState) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedSections({
      basic: true,
      eventDetails: true,
      design: true,
      cover: true,
      gallery: true,
      video: true,
      music: true,
    });
  };

  const handleCollapseAll = () => {
    setCollapsedSections({
      basic: false,
      eventDetails: false,
      design: false,
      cover: false,
      gallery: false,
      video: false,
      music: false,
    });
  };

  // Section 1: Basic Information
  const [customerId, setCustomerId] = useState('');
  const [templateId, setTemplateId] = useState(templateFromQuery || 'royal-gold');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [status, setStatus] = useState<InvitationStatus>('draft');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  // Section 2: Event Details
  const [hostNames, setHostNames] = useState('');
  const [celebrantNames, setCelebrantNames] = useState('');
  const [firstCelebrantName, setFirstCelebrantName] = useState('');
  const [secondCelebrantName, setSecondCelebrantName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [invitationText, setInvitationText] = useState('');
  const [dateIso, setDateIso] = useState('2026-10-15');
  const [hijriDate, setHijriDate] = useState('');
  const [timeText, setTimeText] = useState('ابتداءً من الساعة 8:00 مساءً');
  const [timezone, setTimezone] = useState('Africa/Casablanca');
  const [venueName, setVenueName] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [hostWhatsapp, setHostWhatsapp] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Section 3: Design
  const [primaryColor, setPrimaryColor] = useState('#5A1020');
  const [accentColor, setAccentColor] = useState('#C9A45C');
  const [backgroundColor, setBackgroundColor] = useState('#FAF7F2');
  const [textColor, setTextColor] = useState('#171316');
  const [fontFamilyArabic, setFontFamilyArabic] = useState('Amiri, Georgia, serif');
  const [fontFamilyLatin, setFontFamilyLatin] = useState('Cinzel, serif');

  // Section 4: Cover
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // Section 7: Music
  const [musicId, setMusicId] = useState<string | null>(null);

  // Settings
  const [allowRsvp, setAllowRsvp] = useState(true);
  const [rsvpDeadline, setRsvpDeadline] = useState('');
  const [maxPartySize, setMaxPartySize] = useState(4);
  const [enableMusic, setEnableMusic] = useState(true);
  const [enableGallery, setEnableGallery] = useState(true);
  const [enableCountdown, setEnableCountdown] = useState(true);
  const [enableGuestMessages, setEnableGuestMessages] = useState(true);

  const templates = getAllTemplates();

  // Load Customers & Invitation data if editing
  useEffect(() => {
    async function init() {
      try {
        const custList = await db.customers.getAll();
        setCustomers(custList);
        if (custList.length > 0 && !customerId) {
          setCustomerId(custList[0].id);
        }

        if (id) {
          const inv = await db.invitations.getById(id);
          if (inv) {
            setCustomerId(inv.customer_id);
            setTemplateId(inv.template_id);
            setEventType(inv.event_type);
            setStatus(inv.status);
            setTitle(inv.title);
            setSlug(inv.slug);
            setCoverImageUrl(inv.cover_image_url || '');
            setMusicId(inv.music_id || null);
            setHostWhatsapp(inv.host_whatsapp || '');
            setTimezone(inv.timezone || 'Africa/Casablanca');

            // Content
            if (inv.content) {
              setHostNames(inv.content.host_names || '');
              setCelebrantNames(inv.content.celebrant_names || '');
              setFirstCelebrantName(inv.content.first_celebrant_name || '');
              setSecondCelebrantName(inv.content.second_celebrant_name || '');
              setEventTitle(inv.content.event_title || '');
              setInvitationText(inv.content.invitation_text || '');
              setDateIso(inv.content.date_iso || inv.event_date || '');
              setHijriDate(inv.content.hijri_date || '');
              setTimeText(inv.content.time_text || inv.event_time || '');
              setVenueName(inv.content.venue_name || inv.venue_name || '');
              setVenueCity(inv.content.venue_city || '');
              setVenueAddress(inv.content.venue_address || inv.venue_address || '');
              setGoogleMapsUrl(inv.content.google_maps_url || inv.google_maps_url || '');
              setDressCode(inv.content.dress_code || '');
              setAdditionalNotes(inv.content.additional_notes || '');
            }

            // Theme
            if (inv.theme) {
              setPrimaryColor(inv.theme.primary_color || '#5A1020');
              setAccentColor(inv.theme.accent_color || '#C9A45C');
              setBackgroundColor(inv.theme.background_color || '#FAF7F2');
              setTextColor(inv.theme.text_color || '#171316');
              setFontFamilyArabic(inv.theme.font_family_arabic || 'Amiri, Georgia, serif');
              setFontFamilyLatin(inv.theme.font_family_latin || 'Cinzel, serif');
            }

            // Settings
            if (inv.settings) {
              setAllowRsvp(inv.settings.allow_rsvp ?? inv.rsvp_enabled ?? true);
              setRsvpDeadline(inv.settings.rsvp_deadline || '');
              setMaxPartySize(inv.settings.max_party_size || 4);
              setEnableMusic(inv.settings.enable_music ?? true);
              setEnableGallery(inv.settings.enable_gallery ?? true);
              setEnableCountdown(inv.settings.enable_countdown ?? true);
              setEnableGuestMessages(inv.settings.enable_guest_messages ?? true);
            }
          }
        }
      } catch (err) {
        console.error(err);
        error('حدث خطأ أثناء تحميل بيانات الدعوة');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [id]);

  const handleAutoSlug = (text: string) => {
    const generated = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (generated && !slug) {
      setSlug(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      error('يرجى تحديد عنوان الدعوة');
      return;
    }

    if (!slug.trim()) {
      error('يرجى تحديد الرابط المخصص للدعوة (Slug)');
      return;
    }

    // Check slug uniqueness
    const isAvailable = await db.invitations.checkSlugAvailable(slug.trim(), id);
    if (!isAvailable) {
      error('هذا الرابط المخصص مستخدم مسبقاً، يرجى اختيار رابط آخر');
      return;
    }

    // Validate Event Date (Requirement 32)
    if (dateIso && !isValidDateString(dateIso)) {
      error('صيغة التاريخ غير صحيحة، يرجى إدخال تاريخ صالح (YYYY-MM-DD)');
      return;
    }

    // Validate Google Maps URL (Requirement 21)
    if (googleMapsUrl.trim() && !isValidGoogleMapsUrl(googleMapsUrl.trim())) {
      error('رابط خرائط جوجل غير صالح. يجب أن يبدأ بـ http:// أو https:// ولا يُسمح بروابط مجهولة أو خطرة (javascript/data)');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        customer_id: customerId,
        template_id: templateId,
        event_type: eventType,
        status,
        title: title.trim(),
        slug: slug.trim(),
        event_date: dateIso || undefined,
        event_time: timeText.trim() || undefined,
        timezone,
        venue_name: venueName.trim() || undefined,
        venue_address: venueAddress.trim() || undefined,
        google_maps_url: googleMapsUrl.trim() || undefined,
        host_whatsapp: hostWhatsapp.trim() ? normalizeWhatsAppNumber(hostWhatsapp) : undefined,
        cover_image_url: coverImageUrl.trim() || undefined,
        music_id: musicId || undefined,
        rsvp_enabled: allowRsvp,
        content: {
          host_names: hostNames.trim() || undefined,
          celebrant_names: celebrantNames.trim(),
          first_celebrant_name: firstCelebrantName.trim() || undefined,
          second_celebrant_name: secondCelebrantName.trim() || undefined,
          event_title: eventTitle.trim() || undefined,
          invitation_text: invitationText.trim(),
          date_iso: dateIso,
          hijri_date: hijriDate.trim() || undefined,
          time_text: timeText.trim(),
          venue_name: venueName.trim(),
          venue_city: venueCity.trim(),
          venue_address: venueAddress.trim() || undefined,
          google_maps_url: googleMapsUrl.trim() || undefined,
          dress_code: dressCode.trim() || undefined,
          additional_notes: additionalNotes.trim() || undefined,
        },
        theme: {
          primary_color: primaryColor,
          accent_color: accentColor,
          background_color: backgroundColor,
          text_color: textColor,
          font_family_arabic: fontFamilyArabic,
          font_family_latin: fontFamilyLatin,
        },
        settings: {
          allow_rsvp: allowRsvp,
          rsvp_deadline: rsvpDeadline || undefined,
          max_party_size: maxPartySize,
          enable_music: enableMusic && Boolean(musicId),
          enable_gallery: enableGallery,
          enable_countdown: enableCountdown,
          enable_guest_messages: enableGuestMessages,
          is_password_protected: false,
          show_qr_code: true,
        },
      };

      if (isEditing && id) {
        await db.invitations.update(id, payload);
        success('تم حفظ وتحديث بيانات الدعوة بنجاح!');
      } else {
        const created = await db.invitations.create(payload as any);
        success('تم إنشاء الدعوة بنجاح!');
        navigate(`/admin/invitations/${created.id}/edit`, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل حفظ بيانات الدعوة');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل محرر الدعوة الشامل..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 text-right max-w-5xl mx-auto pb-20 motion-fade-in select-none">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md pb-4 pt-2 border-b border-[#E8DED8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/invitations"
            className="inline-flex items-center gap-1.5 text-xs text-[#6F6668] hover:text-[#5A1020] mb-1.5 transition"
          >
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            <span>العودة لقائمة الدعوات</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
              {isEditing ? `محرر الدعوة: ${title || 'بدون عنوان'}` : 'إنشاء دعوة رقمية جديدة'}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                status === 'active'
                  ? 'bg-[#EDF7EE] text-[#175E27] border-[#BFE4C6]'
                  : 'bg-[#FAF7F2] text-[#6F6668] border-[#E8DED8]'
              }`}
            >
              {status === 'active' ? 'نشطة' : 'مسودة'}
            </span>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Expand/Collapse All Sections */}
          <button
            type="button"
            onClick={handleExpandAll}
            className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] hover:border-[#5A1020] text-[#6F6668] hover:text-[#5A1020] text-xs transition cursor-pointer"
            title="فتح جميع الأقسام"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] hover:border-[#5A1020] text-[#6F6668] hover:text-[#5A1020] text-xs transition cursor-pointer"
            title="طي جميع الأقسام"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          {slug && (
            <a
              href={`/i/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] hover:border-[#5A1020] text-[#171316] hover:text-[#5A1020] text-xs font-medium transition flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>معاينة الرابط</span>
            </a>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'حفظ التعديلات' : 'نشر وإنشاء الدعوة'}
          </Button>
        </div>
      </div>

      {/* QR Code Section (Prompt 18 Requirement 7) */}
      {isEditing && id && slug && (
        <InvitationQRCodeCard
          invitationId={id}
          slug={slug}
          title={title || 'الدعوة'}
          isDraft={status === 'draft'}
        />
      )}

      {/* ==================================================================== */}
      {/* SECTION 1: Basic Information (المعلومات الأساسية)                    */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('basic')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#171316]">
                1. المعلومات الأساسية للدعوة (Basic Information)
              </h2>
              <p className="text-xs text-[#6F6668] mt-0.5">
                عنوان الدعوة، الرابط المخصص (Slug)، العميل صاحب الطلب، ونوع المناسبة
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#9A8F92]">
            {collapsedSections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {collapsedSections.basic && (
          <div className="p-5 sm:p-6 border-t border-[#F2ECE8] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="عنوان الدعوة الداخلي *"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleAutoSlug(e.target.value);
                }}
                placeholder="مثال: حفل زفاف أحمد وسارة"
              />

              <div className="w-full text-right">
                <label className="block text-xs font-medium text-[#171316] mb-1.5">
                  الرابط المخصص للدعوة (URL Slug) *
                </label>
                <div className="flex items-center bg-[#FAF7F2] border border-[#E8DED8] rounded-xl px-3 py-2 text-xs focus-within:border-[#5A1020]">
                  <span className="text-[#6F6668] font-mono text-[11px]" dir="ltr">
                    /i/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="ahmed-sara"
                    dir="ltr"
                    className="w-full bg-transparent text-[#171316] font-mono focus:outline-none px-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="نوع المناسبة *"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                options={[
                  { value: 'wedding', label: 'حفل زفاف (Wedding)' },
                  { value: 'engagement', label: 'خطوبة (Engagement)' },
                  { value: 'aqiqah', label: 'عقيقة ومولود (Aqiqah)' },
                  { value: 'birthday', label: 'عيد ميلاد (Birthday)' },
                  { value: 'graduation', label: 'تخرج ونيل شهادة (Graduation)' },
                  { value: 'anniversary', label: 'ذكرى سنوية (Anniversary)' },
                  { value: 'family', label: 'احتفال عائلي (Family)' },
                  { value: 'private', label: 'مناسبة خاصة (Private)' },
                  { value: 'other', label: 'أخرى (Other)' },
                ]}
              />

              <Select
                label="حالة النشر والظهور *"
                value={status}
                onChange={(e) => setStatus(e.target.value as InvitationStatus)}
                options={[
                  { value: 'draft', label: 'مسودة (Draft — لا تفتح للعامة)' },
                  { value: 'active', label: 'نشطة (Active — منشورة للجمهور)' },
                  { value: 'paused', label: 'متوقفة مؤقتاً (Paused)' },
                  { value: 'expired', label: 'منتهية الصلاحية (Expired)' },
                ]}
              />

              <div>
                <label className="block text-xs font-medium text-[#171316] mb-1.5">
                  العميل صاحب المناسبة *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DED8] rounded-xl px-3 py-2.5 text-xs text-[#171316] focus:outline-none focus:border-[#5A1020] cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2: Event Details (تفاصيل المناسبة والمكان)                  */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('eventDetails')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#171316]">
                2. نصوص وبيانات المناسبة والمكان (Event Details)
              </h2>
              <p className="text-xs text-[#6F6668] mt-0.5">
                أسماء العروسين، صياغة الترحيب، التواريخ، موقع الحفل، وتأكيد الحضور
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#9A8F92]">
            {collapsedSections.eventDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {collapsedSections.eventDetails && (
          <div className="p-5 sm:p-6 border-t border-[#F2ECE8] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="أسماء الداعين / عائلات أصحاب الدعوة"
                value={hostNames}
                onChange={(e) => setHostNames(e.target.value)}
                placeholder="مثال: عائلتا المنصوري والفاسي"
              />

              <Input
                label="أسماء أصحاب المناسبة (العروسين أو المحتفى به) *"
                required
                value={celebrantNames}
                onChange={(e) => setCelebrantNames(e.target.value)}
                placeholder="مثال: أحمد & سارة"
              />
            </div>

            <Input
              label="السطر التقديمي للحدث (Event Subtitle)"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="مثال: دعوة لحضور حفل الزفاف المبارك"
            />

            <Textarea
              label="صيغة نص الدعوة الكريمة"
              rows={3}
              value={invitationText}
              onChange={(e) => setInvitationText(e.target.value)}
              placeholder="تتشرف عائلتا... بدعوتكم لمشاركتنا فرحة العمر..."
            />

            {/* Date and Time */}
            <div className="space-y-3 pt-2 border-t border-[#F2ECE8]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#171316] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#C9A45C]" />
                  <span>تاريخ وتوقيت المناسبة (Event Date & Time)</span>
                </span>
                {/* Live Event Date Status (Requirement 32 & 33) */}
                {dateIso ? (
                  (() => {
                    const target = new Date(`${dateIso}T20:00:00`).getTime();
                    const now = Date.now();
                    const diff = target - now;
                    if (diff < 0) {
                      return (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF0F0] text-[#D92D20] border border-[#FDA29B] flex items-center gap-1">
                          <span>انتهت المناسبة (في الماضي)</span>
                        </span>
                      );
                    }
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    return (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1">
                        <span>المناسبة قادمة بعد {days} يوم ✨</span>
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-[10px] text-[#9A8F92]">لم يتم تحديد تاريخ بعد</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="التاريخ الميلادي *"
                  type="date"
                  required
                  value={dateIso}
                  onChange={(e) => setDateIso(e.target.value)}
                />

                <Input
                  label="التاريخ الهجري (اختياري)"
                  value={hijriDate}
                  onChange={(e) => setHijriDate(e.target.value)}
                  placeholder="مثال: ٢٤ ربيع الآخر ١٤٤٨ هـ"
                />

                <Input
                  label="التوقيت المعلن"
                  value={timeText}
                  onChange={(e) => setTimeText(e.target.value)}
                  placeholder="مثال: ابتداءً من الساعة 8:00 مساءً"
                />
              </div>
            </div>

            {/* Event Location Sub-Editor (Requirement 17, 18, 19, 20, 21, 22, 23) */}
            <div className="p-4 sm:p-5 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#5A1020]/10 text-[#5A1020] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#C9A45C]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#171316]">
                      موقع ومكان الحفل (Event Location)
                    </h4>
                    <p className="text-[11px] text-[#6F6668]">
                      بيانات القاعة والعنوان ورابط خرائط قوقل مابس المباشر
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="اسم القاعة أو المكان *"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="مثال: قصر الفردوس للأفراح والمؤتمرات"
                />

                <Input
                  label="المدينة *"
                  required
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                  placeholder="مثال: الرباط"
                />
              </div>

              <Input
                label="العنوان التفصيلي"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="مثال: شارع النخيل، حي الرياض"
              />

              <div className="space-y-2">
                <Input
                  label="رابط خريطة قوقل مابس (Google Maps URL)"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  dir="ltr"
                  startIcon={<MapPin className="w-4 h-4 text-[#C9A45C]" />}
                />

                {/* Google Maps URL Live Preview & Validation (Requirement 22 & 23) */}
                {googleMapsUrl.trim() && (
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-white border border-[#E8DED8]">
                    <div className="flex items-center gap-2">
                      {isValidGoogleMapsUrl(googleMapsUrl.trim()) ? (
                        <span className="text-[11px] text-[#027A48] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
                          <span>رابط خريطة معتمد وصالح</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#D92D20] font-bold">
                          ⚠️ الرابط غير صالح (يجب أن يبدأ بـ http:// أو https://)
                        </span>
                      )}
                    </div>

                    {isValidGoogleMapsUrl(googleMapsUrl.trim()) && (
                      <a
                        href={googleMapsUrl.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#5A1020] text-white hover:bg-[#721529] transition shadow-xs"
                      >
                        <span>📍 تجربة فتح الرابط في Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  label="رقم واتساب المشرف للتواصل (WhatsApp Host)"
                  value={hostWhatsapp}
                  onChange={(e) => setHostWhatsapp(e.target.value)}
                  placeholder="0661234567 أو +212661234567"
                  dir="ltr"
                />
                {hostWhatsapp.trim() && (
                  <div className="text-[11px] font-mono flex items-center gap-1.5 pt-0.5">
                    {isValidWhatsAppNumber(hostWhatsapp) ? (
                      <span className="text-[#175E27] bg-[#EDF7EE] px-2 py-0.5 rounded border border-[#BFE4C6] flex items-center gap-1">
                        <span>الصيغة الدولية الموحدة:</span>
                        <strong dir="ltr">{normalizeWhatsAppNumber(hostWhatsapp)}</strong>
                      </span>
                    ) : (
                      <span className="text-[#B42318] bg-[#FEECEB] px-2 py-0.5 rounded border border-[#F8B6B2]">
                        رقم الهاتف غير صالح للاستخدام في WhatsApp
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Input
                label="الزي المقترح (Dress Code)"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="مثال: قفطان مغربي تقليدي أو لباس رسمي أنيق"
              />
            </div>

            <Input
              label="ملاحظات إضافية موجهة للضيوف"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="مثال: جنة الأطفال منازلهم، يرجى تأكيد الحضور قبل الموعد بأسبوعين."
            />
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 3: Design (التصميم والقالب)                                 */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('design')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#171316]">
                3. التصميم وهوية القالب (Design & Templates)
              </h2>
              <p className="text-xs text-[#6F6668] mt-0.5">
                اختيار القالب من القوالب العشرة الرسمية، وتخصيص باليت الألوان والخطوط
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#9A8F92]">
            {collapsedSections.design ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {collapsedSections.design && (
          <div className="p-5 sm:p-6 border-t border-[#F2ECE8] space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-[#171316] mb-3">
                اختر القالب الفاخر المناسب لطبيعة الحدث:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {templates.map((tpl) => {
                  const isSelected = templateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setTemplateId(tpl.id)}
                      className={`relative rounded-xl border p-2 text-center transition cursor-pointer flex flex-col items-center justify-between space-y-2 ${
                        isSelected
                          ? 'border-[#5A1020] bg-[#F6ECF0] shadow-xs'
                          : 'border-[#E8DED8] bg-[#FFFFFF] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <img
                        src={tpl.thumbnailUrl || tpl.previewImageUrl}
                        alt={tpl.nameAr || tpl.name}
                        className="w-full aspect-4/3 object-cover rounded-lg border border-[#E8DED8]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#171316] truncate">
                          {tpl.nameAr || tpl.name}
                        </p>
                        <span className="text-[10px] text-[#6F6668] font-mono block">
                          {tpl.id}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#5A1020] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color Customizations */}
            <div className="pt-4 border-t border-[#F2ECE8]">
              <h4 className="text-xs font-semibold text-[#171316] mb-3 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>تخصيص ألوان الهوية:</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#6F6668] mb-1">
                    اللون الرئيسي (Primary)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E8DED8]"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 bg-[#FAF7F2] border border-[#E8DED8] rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#6F6668] mb-1">
                    لون التمييز (Accent)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E8DED8]"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 bg-[#FAF7F2] border border-[#E8DED8] rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#6F6668] mb-1">
                    لون الخلفية (Background)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E8DED8]"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 bg-[#FAF7F2] border border-[#E8DED8] rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#6F6668] mb-1">
                    لون النصوص (Text)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E8DED8]"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 bg-[#FAF7F2] border border-[#E8DED8] rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 4: Cover (صورة الغلاف)                                     */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('cover')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#171316]">
                4. صورة الغلاف والظهور الأولي (Cover)
              </h2>
              <p className="text-xs text-[#6F6668] mt-0.5">
                صورة الغلاف الرئيسية المخصصة لبطاقة الدعوة وشاشات المشاركة
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#9A8F92]">
            {collapsedSections.cover ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {collapsedSections.cover && (
          <div className="p-5 sm:p-6 border-t border-[#F2ECE8] space-y-4">
            <ImageUploader
              label="رفع وتحديث صورة الغلاف (JPG, PNG, WEBP)"
              value={coverImageUrl}
              onChange={setCoverImageUrl}
            />
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 5: Gallery (معرض الصور)                                    */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('gallery')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#171316]">
                5. معرض صور المناسبة (Gallery System)
              </h2>
              <p className="text-xs text-[#6F6668] mt-0.5">
                رفع الصور، الترتيب بالسحب والإفلات، التعليقات، إخفاء/إظهار، والمعاينة بالحجم الكامل
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#9A8F92]">
            {collapsedSections.gallery ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {collapsedSections.gallery && (
          <div className="p-5 sm:p-6 border-t border-[#F2ECE8] space-y-4">
            {/* Feature Toggle switch */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#171316] block">
                  تفعيل قسم معرض الصور بالدعوة العامة
                </span>
                <span className="text-[11px] text-[#6F6668]">
                  عند التفعيل ووجود صور مرئية، سيتم عرض المعرض حسب نسق القالب
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableGallery}
                onChange={(e) => setEnableGallery(e.target.checked)}
                className="w-4 h-4 rounded border-[#E8DED8] text-[#5A1020] focus:ring-[#C9A45C]"
              />
            </div>

            {id ? (
              <AdminGalleryManager invitationId={id} />
            ) : (
              <div className="p-6 text-center rounded-xl bg-[#FAF7F2] border border-dashed border-[#E8DED8] text-xs text-[#6F6668]">
                يرجى حفظ الدعوة أولاً لتمكين رفع وإدارة صور المعرض.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 6: Video (فيديو المناسبة)                                  */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('video')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center shrink-0">
              <VideoIcon className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#171316]">
                6. فيديوهات المناسبة (Video System)
              </h2>
              <p className="text-xs text-[#6F6668] mt-0.5">
                رفع فيديوهات MP4، صورة الغلاف المصغرة، الوصف، والترتيب
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#9A8F92]">
            {collapsedSections.video ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {collapsedSections.video && (
          <div className="p-5 sm:p-6 border-t border-[#F2ECE8] space-y-4">
            {id ? (
              <AdminVideoManager invitationId={id} />
            ) : (
              <div className="p-6 text-center rounded-xl bg-[#FAF7F2] border border-dashed border-[#E8DED8] text-xs text-[#6F6668]">
                يرجى حفظ الدعوة أولاً لتمكين إضافة وإدارة مقاطع الفيديو.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 7: Music (الموسيقى والخلفية الصوتية)                       */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('music')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-[#FAF7F2] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#171316]">
                7. الموسيقى والخلفية الصوتية (Music System)
              </h2>
              <p className="text-xs text-[#6F6668] mt-0.5">
                اختيار المقطع الصوتي المصاحب للدعوة من مكتبة المنصة، أو رفع مقطع صوتي خاص
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-[#9A8F92]">
            {collapsedSections.music ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {collapsedSections.music && (
          <div className="p-5 sm:p-6 border-t border-[#F2ECE8] space-y-4">
            {/* Feature Toggle switch */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-[#171316] block">
                  تفعيل تشغيل الموسيقى عند فتح بطاقة الدعوة
                </span>
                <span className="text-[11px] text-[#6F6668]">
                  يتم احترام سياسات المتصفح الصوتية ويظهر زر التحكم العائم للزائر
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableMusic}
                onChange={(e) => setEnableMusic(e.target.checked)}
                className="w-4 h-4 rounded border-[#E8DED8] text-[#5A1020] focus:ring-[#C9A45C]"
              />
            </div>

            <AdminMusicSelector
              value={musicId}
              onChange={setMusicId}
              invitationId={id}
            />
          </div>
        )}
      </div>

      {/* Floating Bottom Save Action Bar */}
      <div className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-[#171316]/90 backdrop-blur-md text-white border border-white/10 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#218739] animate-pulse" />
          <span className="text-xs text-neutral-200">
            جاهز لحفظ التعديلات في النظام وقاعدة البيانات
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </form>
  );
};
