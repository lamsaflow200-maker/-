/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Database service layer for Mnasbati platform.
 * Provides client-side persistent storage, validation, soft deletion, and repository pattern.
 * Seamlessly interfaces with Supabase PostgreSQL in production.
 */

import {
  AdminUser,
  Customer,
  CustomerNote,
  Invitation,
  InvitationSection,
  TemplateRecord,
  Guest,
  RsvpResponse,
  GalleryItem,
  InvitationVideo,
  MusicTrack,
  AnalyticsEvent,
  InvitationStatus,
  InvitationQrCode,
  CustomDomain,
  NotificationLog,
} from '../types/database';
import { IDatabaseService } from './repository';
import { TEMPLATE_REGISTRY, getAllTemplates, getTemplateById } from '../templates/registry';
import { supabase, isSupabaseConfigured } from './supabase';
import { isSamePhoneNumber } from '../utils/phone';
import { generateSlugCandidate } from '../utils/slug';
import { sanitizeText, validateRsvpGuestCount } from '../utils/security';
import { checkRsvpRateLimit } from '../utils/rateLimiter';

const STORAGE_KEYS = {
  ADMINS: 'mnasbati_admins',
  CUSTOMERS: 'mnasbati_customers',
  CUSTOMER_NOTES: 'mnasbati_customer_notes',
  INVITATIONS: 'mnasbati_invitations',
  INVITATION_SECTIONS: 'mnasbati_invitation_sections',
  GUESTS: 'mnasbati_guests',
  RSVP: 'mnasbati_rsvp',
  GALLERY: 'mnasbati_gallery',
  VIDEOS: 'mnasbati_videos',
  MUSIC: 'mnasbati_music',
  ANALYTICS: 'mnasbati_analytics',
  QR_CODES: 'mnasbati_qr_codes',
  CUSTOM_DOMAINS: 'mnasbati_custom_domains',
  NOTIFICATIONS: 'mnasbati_notifications',
  CURRENT_ADMIN: 'mnasbati_current_admin',
};

// Initial Seed Data (Structured realistically)
const SEED_ADMINS: AdminUser[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@mnasbati.ma',
    full_name: 'مدير منصة منسباتي',
    name: 'مدير منصة منسباتي',
    role: 'super_admin',
    is_active: true,
    avatar_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'manager@mnasbati.ma',
    full_name: 'مشرف الإدارة والعمليات',
    name: 'مشرف الإدارة والعمليات',
    role: 'admin',
    is_active: true,
    avatar_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'inactive@mnasbati.ma',
    full_name: 'حساب موظف معطل',
    name: 'حساب موظف معطل',
    role: 'admin',
    is_active: false,
    avatar_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    full_name: 'أحمد المنصوري وسارة الفاسي',
    phone: '+212 661-234567',
    email: 'ahmed.almansouri@example.com',
    city: 'الرباط',
    address: 'حي الرياض، الرباط',
    notes: 'حفل زفاف في قصر الفردوس بالرباط. تم اختيار باقة الأصالة الذهبية.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2000000-0000-0000-0000-000000000002',
    full_name: 'عائلة الإدريسي',
    phone: '+212 662-987654',
    email: 'idrissi.family@example.com',
    city: 'الدار البيضاء',
    address: 'عين الذئاب، الدار البيضاء',
    notes: 'حفل تخرج الدكتورة ليلى الإدريسي من كلية الطب.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_INVITATIONS: Invitation[] = [
  {
    id: 'i1000000-0000-0000-0000-000000000001',
    slug: 'ahmed-sara',
    customer_id: 'c1000000-0000-0000-0000-000000000001',
    template_id: 'classic-elegance',
    event_type: 'wedding',
    status: 'active',
    title: 'حفل زفاف أحمد وسارة',
    event_date: '2026-10-15',
    event_time: 'ابتداءً من الساعة الثامنة مساءً',
    timezone: 'Africa/Casablanca',
    venue_name: 'قصر الفردوس للأفراح والمؤتمرات',
    venue_address: 'شارع النخيل، حي الرياض، الرباط',
    google_maps_url: 'https://maps.google.com/?q=Rabat+Morocco',
    host_whatsapp: '+212 661-234567',
    cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    music_id: 'm1000000-0000-0000-0000-000000000001',
    rsvp_enabled: true,
    content: {
      host_names: 'عائلتي المنصوري والفاسي',
      celebrant_names: 'أحمد & سارة',
      event_title: 'دعوة لحضور حفل الزفاف المبارك',
      invitation_text: 'تتشرف عائلتا المنصوري والفاسي بدعوة سيادتكم الكريمة لمشاركتنا فرحة العمر بمناسبة عقد قران وزفاف قرتي أعيننا، حضوركم شرف لنا ويزيدنا بهجة وسروراً.',
      date_iso: '2026-10-15',
      hijri_date: '٢٤ ربيع الآخر ١٤٤٨ هـ',
      time_text: 'ابتداءً من الساعة الثامنة مساءً',
      venue_name: 'قصر الفردوس للأفراح والمؤتمرات',
      venue_city: 'الرباط — أكدال',
      venue_address: 'شارع النخيل، حي الرياض',
      google_maps_url: 'https://maps.google.com/?q=Rabat+Morocco',
      dress_code: 'لباس مغربي تقليدي أو رسمي أنيق',
      additional_notes: 'جنة الأطفال منازلهم، يرجى تأكيد الحضور قبل موعد الحفل بأسبوعين.',
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
      allow_rsvp: true,
      rsvp_deadline: '2026-10-01',
      max_party_size: 4,
      enable_music: true,
      enable_gallery: true,
      enable_countdown: true,
      enable_guest_messages: true,
      is_password_protected: false,
      show_qr_code: true,
    },
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i2000000-0000-0000-0000-000000000002',
    slug: 'dr-layla',
    customer_id: 'c2000000-0000-0000-0000-000000000002',
    template_id: 'royal-minimalist',
    event_type: 'graduation',
    status: 'draft',
    title: 'حفل تخرج الدكتورة ليلى الإدريسي',
    event_date: '2026-11-20',
    event_time: 'في تمام الساعة السادسة مساءً',
    timezone: 'Africa/Casablanca',
    venue_name: 'فندق سوفيتيل حديقة الورد',
    venue_address: 'عين الذئاب، الدار البيضاء',
    google_maps_url: 'https://maps.google.com/?q=Casablanca+Morocco',
    host_whatsapp: '+212 662-987654',
    rsvp_enabled: true,
    content: {
      host_names: 'عائلة الدكتور محمد الإدريسي',
      celebrant_names: 'د. ليلى الإدريسي',
      event_title: 'احتفال بنيل شهادة الدكتوراه في الطب والجراحة',
      invitation_text: 'بمشاعر الفخر والاعتزاز، تدعوكم عائلة الإدريسي للاحتفاء بتخرج كريمتنا ونيلها درجة الدكتوراه في الطب بمرتبة الشرف.',
      date_iso: '2026-11-20',
      hijri_date: '١٠ جمادى الأولى ١٤٤٨ هـ',
      time_text: 'في تمام الساعة السادسة مساءً',
      venue_name: 'فندق سوفيتيل حديقة الورد',
      venue_city: 'الدار البيضاء',
      venue_address: 'عين الذئاب',
      google_maps_url: 'https://maps.google.com/?q=Casablanca+Morocco',
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
      allow_rsvp: true,
      rsvp_deadline: '2026-11-10',
      max_party_size: 2,
      enable_music: false,
      enable_gallery: false,
      enable_countdown: true,
      enable_guest_messages: true,
      is_password_protected: false,
      show_qr_code: true,
    },
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_RSVP: RsvpResponse[] = [
  {
    id: 'r1000000-0000-0000-0000-000000000001',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    guest_name: 'كريم التازي',
    phone: '0661112233',
    attendance: 'confirmed',
    attendance_status: 'confirmed',
    guests_count: 2,
    party_size: 2,
    message: 'ألف مبروك لأخي أحمد وسارة، بالرفاه والبنين إن شاء الله!',
    notes_or_wishes: 'ألف مبروك لأخي أحمد وسارة، بالرفاه والبنين إن شاء الله!',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'r2000000-0000-0000-0000-000000000002',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    guest_name: 'فاطمة الزهراء العمراني',
    phone: '0662223344',
    attendance: 'confirmed',
    attendance_status: 'confirmed',
    guests_count: 1,
    party_size: 1,
    message: 'تهانينا الحارة للعروسين، سنكون حاضرين بإذن الله.',
    notes_or_wishes: 'تهانينا الحارة للعروسين، سنكون حاضرين بإذن الله.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_GUESTS: Guest[] = [
  {
    id: 'g1000000-0000-0000-0000-000000000001',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    name: 'كريم التازي',
    phone: '0661112233',
    companion_count: 1,
    notes: 'طاولة العائلة',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'g2000000-0000-0000-0000-000000000002',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    name: 'فاطمة الزهراء العمراني',
    phone: '0662223344',
    companion_count: 0,
    notes: 'صديقة العروس',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'g3000000-0000-0000-0000-000000000003',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    name: 'يوسف بنسودة',
    phone: '0663334455',
    companion_count: 1,
    notes: 'مدعو رسمي',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const SEED_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1000000-0000-0000-0000-000000000001',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=480&q=75',
    media_type: 'image',
    caption: 'جلسة التصوير الملكية في قصر الفردوس',
    sort_order: 0,
    is_visible: true,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'gal-1000000-0000-0000-0000-000000000002',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    media_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=480&q=75',
    media_type: 'image',
    caption: 'تفاصيل الديكور المغربي والورود الفاخرة',
    sort_order: 1,
    is_visible: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'gal-1000000-0000-0000-0000-000000000003',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    media_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=480&q=75',
    media_type: 'image',
    caption: 'خواتم الزفاف ولمسات الذهب الأصيل',
    sort_order: 2,
    is_visible: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'gal-1000000-0000-0000-0000-000000000004',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    media_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=480&q=75',
    media_type: 'image',
    caption: 'لحظات الفرح ولقاء الأهل والأحباب',
    sort_order: 3,
    is_visible: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const SEED_VIDEOS: InvitationVideo[] = [
  {
    id: 'v-1000000-0000-0000-0000-000000000001',
    invitation_id: 'i1000000-0000-0000-0000-000000000001',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    title: 'برومو وتفاصيل الحفل التذكاري',
    description: 'مشاهد توثيقية حصرية لأجواء الفرح والبهجة في قصر الفردوس',
    sort_order: 0,
    is_visible: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const SEED_MUSIC: MusicTrack[] = [
  {
    id: 'm1000000-0000-0000-0000-000000000001',
    name: 'موشح أندلسي ملكي',
    artist: 'فرقة التراث المغربي الأصيل',
    audio_url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    duration: 145,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm2000000-0000-0000-0000-000000000002',
    name: 'دقة وأهازيج مغربية هادئة',
    artist: 'تخت الأصالة المغربية',
    audio_url: 'https://cdn.freesound.org/previews/563/563821_11861866-lq.mp3',
    duration: 180,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm3000000-0000-0000-0000-000000000003',
    name: 'عزف عود وقانون شجي',
    artist: 'أوتار فاس العريقة',
    audio_url: 'https://cdn.freesound.org/previews/530/530415_11861866-lq.mp3',
    duration: 210,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm4000000-0000-0000-0000-000000000004',
    name: 'نغمات الاحتفال الكلاسيكية',
    artist: 'أوركسترا الرباط الفيلهارمونية',
    audio_url: 'https://cdn.freesound.org/previews/518/518888_11861866-lq.mp3',
    duration: 165,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage key ${key}:`, e);
  }
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Concrete Database Implementation with Supabase readiness & Local fallback
class DatabaseServiceImpl implements IDatabaseService {
  admins = {
    findByEmail: async (email: string): Promise<AdminUser | null> => {
      const cleanEmail = email.trim().toLowerCase();
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', cleanEmail)
          .single();
        if (data) return { ...data, name: data.name || data.full_name };
      }
      const admins = getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, SEED_ADMINS);
      const found = admins.find((a) => a.email.toLowerCase() === cleanEmail);
      return found ? { ...found, name: found.name || found.full_name } : null;
    },
    findById: async (id: string): Promise<AdminUser | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', id)
          .single();
        if (data) return { ...data, name: data.name || data.full_name };
      }
      const admins = getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, SEED_ADMINS);
      const found = admins.find((a) => a.id === id);
      return found ? { ...found, name: found.name || found.full_name } : null;
    },
    findByAuthUserId: async (authUserId: string): Promise<AdminUser | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('admin_users')
          .select('*')
          .eq('auth_user_id', authUserId)
          .single();
        if (data) return { ...data, name: data.name || data.full_name };
      }
      const admins = getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, SEED_ADMINS);
      const found = admins.find((a) => a.auth_user_id === authUserId);
      return found ? { ...found, name: found.name || found.full_name } : null;
    },
    linkAuthUserId: async (id: string, authUserId: string): Promise<void> => {
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('admin_users')
          .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
          .eq('id', id);
      }
      const admins = getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, SEED_ADMINS);
      const idx = admins.findIndex((a) => a.id === id);
      if (idx !== -1) {
        admins[idx].auth_user_id = authUserId;
        admins[idx].updated_at = new Date().toISOString();
        setItem(STORAGE_KEYS.ADMINS, admins);
      }
    },
    updateLastLogin: async (id: string): Promise<void> => {
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', id);
      }
      const admins = getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, SEED_ADMINS);
      const idx = admins.findIndex((a) => a.id === id);
      if (idx !== -1) {
        admins[idx].last_login_at = new Date().toISOString();
        setItem(STORAGE_KEYS.ADMINS, admins);
      }
    },
  };

  customers = {
    getAll: async (includeDeleted = false): Promise<Customer[]> => {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (!includeDeleted) {
          query = query.is('deleted_at', null);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      }
      const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      return includeDeleted ? customers : customers.filter((c) => !c.deleted_at);
    },
    getById: async (id: string): Promise<Customer | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
        if (!error && data) return data;
      }
      const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      return customers.find((c) => c.id === id) || null;
    },
    findByPhone: async (phone: string, excludeId?: string): Promise<Customer | null> => {
      const cleanPhone = phone.trim();
      if (!cleanPhone) return null;

      // In Supabase, look up direct matches or fetch active list to perform normalized comparison
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .is('deleted_at', null);
        if (data && data.length > 0) {
          const match = data.find(
            (c) => c.id !== excludeId && isSamePhoneNumber(c.phone, cleanPhone)
          );
          if (match) return match;
        }
      }

      const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      const match = customers.find(
        (c) => !c.deleted_at && c.id !== excludeId && isSamePhoneNumber(c.phone, cleanPhone)
      );
      return match || null;
    },
    create: async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
      if (!data.full_name?.trim()) throw new Error('Customer name is required');
      if (!data.phone?.trim()) throw new Error('Customer phone is required');

      if (isSupabaseConfigured && supabase) {
        const { data: created, error } = await supabase
          .from('customers')
          .insert(data)
          .select()
          .single();
        if (!error && created) return created;
      }

      const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      const newCustomer: Customer = {
        ...data,
        id: generateUuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      customers.unshift(newCustomer);
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
      return newCustomer;
    },
    update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
      if (isSupabaseConfigured && supabase) {
        const { data: updated, error } = await supabase
          .from('customers')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) return updated;
      }

      const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      const idx = customers.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Customer not found');
      const updated = {
        ...customers[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      customers[idx] = updated;
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
      return updated;
    },
    delete: async (id: string, permanent = false): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        if (permanent) {
          await supabase.from('customers').delete().eq('id', id);
        } else {
          await supabase.from('customers').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        }
        return true;
      }

      let customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      if (permanent) {
        customers = customers.filter((c) => c.id !== id);
      } else {
        const idx = customers.findIndex((c) => c.id === id);
        if (idx !== -1) {
          customers[idx].deleted_at = new Date().toISOString();
        }
      }
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
      return true;
    },
    restore: async (id: string): Promise<Customer> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('customers')
          .update({ deleted_at: null })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      }

      const customers = getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, SEED_CUSTOMERS);
      const idx = customers.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Customer not found');
      customers[idx].deleted_at = undefined;
      customers[idx].updated_at = new Date().toISOString();
      setItem(STORAGE_KEYS.CUSTOMERS, customers);
      return customers[idx];
    },
    getNotes: async (customerId: string): Promise<CustomerNote[]> => {
      let notes: CustomerNote[] = [];
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('customer_notes')
          .select('*, admin_users(full_name)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        if (data) {
          notes = data.map((n: any) => ({
            ...n,
            admin_name: n.admin_users?.full_name || 'مدير المنصة',
          }));
          return notes;
        }
      }
      const rawNotes = getItem<CustomerNote[]>(STORAGE_KEYS.CUSTOMER_NOTES, []);
      const admins = getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, SEED_ADMINS);
      notes = rawNotes.filter((n) => n.customer_id === customerId);
      return notes.map((n) => {
        const matchedAdmin = admins.find((a) => a.id === n.admin_user_id);
        return {
          ...n,
          admin_name: n.admin_name || matchedAdmin?.full_name || matchedAdmin?.name || 'مدير المنصة',
        };
      });
    },
    addNote: async (
      customerId: string,
      note: string,
      adminUserId?: string,
      adminName?: string
    ): Promise<CustomerNote> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('customer_notes')
          .insert({
            customer_id: customerId,
            note,
            admin_user_id: adminUserId,
          })
          .select()
          .single();
        if (data) return { ...data, admin_name: adminName || 'مدير المنصة' };
      }
      const notes = getItem<CustomerNote[]>(STORAGE_KEYS.CUSTOMER_NOTES, []);
      const newNote: CustomerNote = {
        id: generateUuid(),
        customer_id: customerId,
        admin_user_id: adminUserId,
        admin_name: adminName || 'مدير المنصة',
        note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      notes.unshift(newNote);
      setItem(STORAGE_KEYS.CUSTOMER_NOTES, notes);
      return newNote;
    },
    updateNote: async (id: string, note: string): Promise<CustomerNote> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('customer_notes')
          .update({ note, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (data) return data;
      }
      const notes = getItem<CustomerNote[]>(STORAGE_KEYS.CUSTOMER_NOTES, []);
      const idx = notes.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error('Note not found');
      notes[idx].note = note;
      notes[idx].updated_at = new Date().toISOString();
      setItem(STORAGE_KEYS.CUSTOMER_NOTES, notes);
      return notes[idx];
    },
    deleteNote: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('customer_notes').delete().eq('id', id);
        return true;
      }
      let notes = getItem<CustomerNote[]>(STORAGE_KEYS.CUSTOMER_NOTES, []);
      notes = notes.filter((n) => n.id !== id);
      setItem(STORAGE_KEYS.CUSTOMER_NOTES, notes);
      return true;
    },
  };

  invitations = {
    getAll: async (filter?: { status?: InvitationStatus; customerId?: string; includeDeleted?: boolean }): Promise<Invitation[]> => {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('invitations').select('*').order('created_at', { ascending: false });
        if (!filter?.includeDeleted) {
          query = query.is('deleted_at', null);
        }
        if (filter?.status) {
          query = query.eq('status', filter.status);
        }
        if (filter?.customerId) {
          query = query.eq('customer_id', filter.customerId);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      }

      let invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      if (!filter?.includeDeleted) {
        invitations = invitations.filter((inv) => !inv.deleted_at);
      }
      if (filter?.status) {
        invitations = invitations.filter((inv) => inv.status === filter.status);
      }
      if (filter?.customerId) {
        invitations = invitations.filter((inv) => inv.customer_id === filter.customerId);
      }
      return invitations;
    },
    getById: async (id: string): Promise<Invitation | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('invitations').select('*').eq('id', id).single();
        if (!error && data) return data;
      }
      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      return invitations.find((inv) => inv.id === id) || null;
    },
    getBySlug: async (slug: string): Promise<Invitation | null> => {
      const cleanSlug = slug.trim().toLowerCase();
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('slug', cleanSlug)
          .is('deleted_at', null)
          .single();
        if (!error && data) return data;
      }
      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      return (
        invitations.find((inv) => inv.slug.toLowerCase() === cleanSlug && !inv.deleted_at) || null
      );
    },
    create: async (data: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>): Promise<Invitation> => {
      if (!data.slug?.trim()) throw new Error('Invitation slug is required');
      if (!data.customer_id) throw new Error('Customer ID is required');
      if (!data.template_id) throw new Error('Template ID is required');

      const isAvailable = await this.invitations.checkSlugAvailable(data.slug);
      if (!isAvailable) {
        throw new Error(`Slug "${data.slug}" is already taken`);
      }

      if (isSupabaseConfigured && supabase) {
        const { data: created, error } = await supabase
          .from('invitations')
          .insert(data)
          .select()
          .single();
        if (!error && created) return created;
      }

      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      const newInv: Invitation = {
        ...data,
        id: generateUuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      invitations.unshift(newInv);
      setItem(STORAGE_KEYS.INVITATIONS, invitations);
      return newInv;
    },
    update: async (id: string, data: Partial<Invitation>): Promise<Invitation> => {
      if (data.slug) {
        const isAvailable = await this.invitations.checkSlugAvailable(data.slug, id);
        if (!isAvailable) {
          throw new Error(`Slug "${data.slug}" is already in use`);
        }
      }

      if (isSupabaseConfigured && supabase) {
        const { data: updated, error } = await supabase
          .from('invitations')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) return updated;
      }

      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      const idx = invitations.findIndex((inv) => inv.id === id);
      if (idx === -1) throw new Error('Invitation not found');
      const updated = {
        ...invitations[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      invitations[idx] = updated;
      setItem(STORAGE_KEYS.INVITATIONS, invitations);
      return updated;
    },
    delete: async (id: string, permanent = false): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        if (permanent) {
          await supabase.from('invitations').delete().eq('id', id);
        } else {
          await supabase.from('invitations').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        }
        return true;
      }

      let invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      if (permanent) {
        invitations = invitations.filter((inv) => inv.id !== id);
      } else {
        const idx = invitations.findIndex((inv) => inv.id === id);
        if (idx !== -1) {
          invitations[idx].deleted_at = new Date().toISOString();
        }
      }
      setItem(STORAGE_KEYS.INVITATIONS, invitations);
      return true;
    },
    checkSlugAvailable: async (slug: string, excludeId?: string): Promise<boolean> => {
      const cleanSlug = slug.trim().toLowerCase();
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('invitations').select('id').eq('slug', cleanSlug);
        if (excludeId) {
          query = query.neq('id', excludeId);
        }
        const { data } = await query;
        return !data || data.length === 0;
      }

      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      const found = invitations.find(
        (inv) => inv.slug.toLowerCase() === cleanSlug && inv.id !== excludeId
      );
      return !found;
    },
    generateUniqueSlug: async (baseText: string, excludeId?: string): Promise<string> => {
      const candidate = generateSlugCandidate(baseText) || 'invitation';
      let slug = candidate;
      let counter = 1;
      while (!(await this.invitations.checkSlugAvailable(slug, excludeId))) {
        counter++;
        slug = `${candidate}-${counter}`;
      }
      return slug;
    },
    restore: async (id: string): Promise<Invitation> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('invitations')
          .update({ deleted_at: null, status: 'draft', updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      }

      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      const idx = invitations.findIndex((inv) => inv.id === id);
      if (idx === -1) throw new Error('Invitation not found');
      invitations[idx].deleted_at = undefined;
      invitations[idx].status = 'draft';
      invitations[idx].updated_at = new Date().toISOString();
      setItem(STORAGE_KEYS.INVITATIONS, invitations);
      return invitations[idx];
    },
    duplicate: async (id: string, newTitle?: string): Promise<Invitation> => {
      const original = await this.invitations.getById(id);
      if (!original) throw new Error('Original invitation not found');

      const title = newTitle || `نسخة من ${original.title}`;
      const newSlug = await this.invitations.generateUniqueSlug(
        original.slug ? `${original.slug}-copy` : original.title
      );

      const duplicatedData: Omit<Invitation, 'id' | 'created_at' | 'updated_at'> = {
        customer_id: original.customer_id,
        template_id: original.template_id,
        event_type: original.event_type,
        title,
        slug: newSlug,
        status: 'draft', // Cloned invitations are strictly draft
        event_date: original.event_date,
        event_time: original.event_time,
        timezone: original.timezone || 'Africa/Casablanca',
        venue_name: original.venue_name,
        venue_address: original.venue_address,
        google_maps_url: original.google_maps_url,
        host_whatsapp: original.host_whatsapp,
        cover_image_url: original.cover_image_url,
        music_id: original.music_id,
        rsvp_enabled: original.rsvp_enabled ?? true,
        expires_at: original.expires_at,
        deleted_at: undefined,
        content: { ...original.content, event_title: title },
        theme: { ...original.theme },
        settings: {
          ...original.settings,
          allow_rsvp: original.settings?.allow_rsvp ?? true,
        },
      };

      return this.invitations.create(duplicatedData);
    },
    getSections: async (invitationId: string): Promise<InvitationSection[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('invitation_sections')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('sort_order', { ascending: true });
        if (data) return data;
      }
      const sections = getItem<InvitationSection[]>(STORAGE_KEYS.INVITATION_SECTIONS, []);
      return sections
        .filter((s) => s.invitation_id === invitationId)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    saveSection: async (section: Omit<InvitationSection, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<InvitationSection> => {
      if (isSupabaseConfigured && supabase) {
        if (section.id) {
          const { data } = await supabase
            .from('invitation_sections')
            .update(section)
            .eq('id', section.id)
            .select()
            .single();
          if (data) return data;
        } else {
          const { data } = await supabase
            .from('invitation_sections')
            .insert(section)
            .select()
            .single();
          if (data) return data;
        }
      }
      const sections = getItem<InvitationSection[]>(STORAGE_KEYS.INVITATION_SECTIONS, []);
      if (section.id) {
        const idx = sections.findIndex((s) => s.id === section.id);
        if (idx !== -1) {
          sections[idx] = {
            ...sections[idx],
            ...section,
            updated_at: new Date().toISOString(),
          };
          setItem(STORAGE_KEYS.INVITATION_SECTIONS, sections);
          return sections[idx];
        }
      }
      const newSec: InvitationSection = {
        ...section,
        id: generateUuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      sections.push(newSec);
      setItem(STORAGE_KEYS.INVITATION_SECTIONS, sections);
      return newSec;
    },
    deleteSection: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('invitation_sections').delete().eq('id', id);
        return true;
      }
      let sections = getItem<InvitationSection[]>(STORAGE_KEYS.INVITATION_SECTIONS, []);
      sections = sections.filter((s) => s.id !== id);
      setItem(STORAGE_KEYS.INVITATION_SECTIONS, sections);
      return true;
    },
    getQrCode: async (invitationId: string): Promise<InvitationQrCode | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('invitation_qr_codes')
          .select('*')
          .eq('invitation_id', invitationId)
          .single();
        if (data) return data;
      }
      const qrs = getItem<InvitationQrCode[]>(STORAGE_KEYS.QR_CODES, []);
      return qrs.find((q) => q.invitation_id === invitationId) || null;
    },
    saveQrCode: async (invitationId: string, qrValue: string, imageUrl?: string): Promise<InvitationQrCode> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('invitation_qr_codes')
          .upsert({
            invitation_id: invitationId,
            qr_value: qrValue,
            image_url: imageUrl,
            is_active: true,
          })
          .select()
          .single();
        if (data) return data;
      }
      const qrs = getItem<InvitationQrCode[]>(STORAGE_KEYS.QR_CODES, []);
      const existingIdx = qrs.findIndex((q) => q.invitation_id === invitationId);
      const record: InvitationQrCode = {
        id: existingIdx !== -1 ? qrs[existingIdx].id : generateUuid(),
        invitation_id: invitationId,
        qr_value: qrValue,
        image_url: imageUrl,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (existingIdx !== -1) {
        qrs[existingIdx] = record;
      } else {
        qrs.push(record);
      }
      setItem(STORAGE_KEYS.QR_CODES, qrs);
      return record;
    },
    getCustomDomain: async (invitationId: string): Promise<CustomDomain | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('custom_domains')
          .select('*')
          .eq('invitation_id', invitationId)
          .single();
        if (data) return data;
      }
      const domains = getItem<CustomDomain[]>(STORAGE_KEYS.CUSTOM_DOMAINS, []);
      return domains.find((d) => d.invitation_id === invitationId) || null;
    },
  };

  templates = {
    getAll: async (): Promise<TemplateRecord[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('templates').select('*').eq('is_active', true);
        if (data && data.length > 0) return data;
      }
      return getAllTemplates().map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug || t.id,
        name_ar: t.nameAr,
        description: t.descriptionAr,
        description_ar: t.descriptionAr,
        category: t.category,
        thumbnail_url: t.thumbnailUrl,
        preview_image_url: t.previewImageUrl || t.thumbnailUrl,
        version: t.version,
        is_active: true,
        config: t.config || {
          colors: {
            primary: t.defaultTheme.primary_color,
            accent: t.defaultTheme.accent_color,
            background: t.defaultTheme.background_color,
            text: t.defaultTheme.text_color,
          },
        },
        supported_features: t.supportedFeatures,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      }));
    },
    getById: async (id: string): Promise<TemplateRecord | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('templates').select('*').eq('id', id).single();
        if (data) return data;
      }
      const t = getTemplateById(id);
      if (!t) return null;
      return {
        id: t.id,
        name: t.name,
        slug: t.slug || t.id,
        name_ar: t.nameAr,
        description: t.descriptionAr,
        description_ar: t.descriptionAr,
        category: t.category,
        thumbnail_url: t.thumbnailUrl,
        preview_image_url: t.previewImageUrl || t.thumbnailUrl,
        version: t.version,
        is_active: true,
        config: t.config || {
          colors: {
            primary: t.defaultTheme.primary_color,
            accent: t.defaultTheme.accent_color,
            background: t.defaultTheme.background_color,
            text: t.defaultTheme.text_color,
          },
        },
        supported_features: t.supportedFeatures,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      };
    },
  };

  guests = {
    getAll: async (): Promise<Guest[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('guests').select('*').order('name');
        if (data) return data;
      }
      return getItem<Guest[]>(STORAGE_KEYS.GUESTS, SEED_GUESTS);
    },
    getByInvitationId: async (invitationId: string): Promise<Guest[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('guests')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('name');
        if (data) return data;
      }
      const guests = getItem<Guest[]>(STORAGE_KEYS.GUESTS, SEED_GUESTS);
      return guests.filter((g) => g.invitation_id === invitationId);
    },
    getById: async (id: string): Promise<Guest | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('guests').select('*').eq('id', id).single();
        if (data) return data;
      }
      const guests = getItem<Guest[]>(STORAGE_KEYS.GUESTS, SEED_GUESTS);
      return guests.find((g) => g.id === id) || null;
    },
    findDuplicate: async (
      invitationId: string,
      name: string,
      phone?: string,
      email?: string,
      excludeId?: string
    ): Promise<Guest | null> => {
      const list = await this.guests.getByInvitationId(invitationId);
      const cleanName = name.trim().toLowerCase();
      const cleanPhone = phone?.trim();
      const cleanEmail = email?.trim().toLowerCase();

      return (
        list.find((g) => {
          if (excludeId && g.id === excludeId) return false;
          if (cleanName && g.name.trim().toLowerCase() === cleanName) return true;
          if (cleanPhone && g.phone && isSamePhoneNumber(g.phone, cleanPhone)) return true;
          if (cleanEmail && g.email && g.email.trim().toLowerCase() === cleanEmail) return true;
          return false;
        }) || null
      );
    },
    create: async (data: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Promise<Guest> => {
      if (isSupabaseConfigured && supabase) {
        const { data: created } = await supabase
          .from('guests')
          .insert(data)
          .select()
          .single();
        if (created) return created;
      }
      const guests = getItem<Guest[]>(STORAGE_KEYS.GUESTS, SEED_GUESTS);
      const newGuest: Guest = {
        ...data,
        id: generateUuid(),
        companion_count: Math.max(0, data.companion_count || 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      guests.push(newGuest);
      setItem(STORAGE_KEYS.GUESTS, guests);
      return newGuest;
    },
    update: async (id: string, updates: Partial<Guest>): Promise<Guest> => {
      if (isSupabaseConfigured && supabase) {
        const { data: updated } = await supabase
          .from('guests')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        if (updated) return updated;
      }

      const guests = getItem<Guest[]>(STORAGE_KEYS.GUESTS, SEED_GUESTS);
      const idx = guests.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error('Guest not found');

      guests[idx] = {
        ...guests[idx],
        ...updates,
        companion_count:
          updates.companion_count !== undefined
            ? Math.max(0, updates.companion_count)
            : guests[idx].companion_count,
        updated_at: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.GUESTS, guests);
      return guests[idx];
    },
    delete: async (id: string): Promise<boolean> => {
      // 1. Unlink any rsvp_responses referencing this guest so relationships are safe
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('rsvp_responses')
          .update({ guest_id: null })
          .eq('guest_id', id);
        await supabase.from('guests').delete().eq('id', id);
        return true;
      }

      // Local storage safe unlink
      const rsvps = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);
      let rsvpsModified = false;
      rsvps.forEach((r) => {
        if (r.guest_id === id) {
          r.guest_id = undefined;
          rsvpsModified = true;
        }
      });
      if (rsvpsModified) {
        setItem(STORAGE_KEYS.RSVP, rsvps);
      }

      let guests = getItem<Guest[]>(STORAGE_KEYS.GUESTS, SEED_GUESTS);
      guests = guests.filter((g) => g.id !== id);
      setItem(STORAGE_KEYS.GUESTS, guests);
      return true;
    },
  };

  rsvp = {
    getAll: async (): Promise<RsvpResponse[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('rsvp_responses')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) return data;
      }
      return getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);
    },
    getByInvitationId: async (invitationId: string): Promise<RsvpResponse[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('rsvp_responses')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('created_at', { ascending: false });
        if (data) return data;
      }
      const responses = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);
      return responses.filter((r) => r.invitation_id === invitationId);
    },
    getById: async (id: string): Promise<RsvpResponse | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('rsvp_responses').select('*').eq('id', id).single();
        if (data) return data;
      }
      const responses = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);
      return responses.find((r) => r.id === id) || null;
    },
    delete: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('rsvp_responses').delete().eq('id', id);
        return true;
      }
      let responses = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);
      responses = responses.filter((r) => r.id !== id);
      setItem(STORAGE_KEYS.RSVP, responses);
      return true;
    },
    update: async (id: string, updates: Partial<RsvpResponse>): Promise<RsvpResponse> => {
      if (isSupabaseConfigured && supabase) {
        const { data: updated } = await supabase
          .from('rsvp_responses')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        if (updated) return updated;
      }

      const responses = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);
      const idx = responses.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('RSVP record not found');

      responses[idx] = {
        ...responses[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.RSVP, responses);
      return responses[idx];
    },
    submit: async (data: {
      invitation_id: string;
      guest_id?: string;
      guest_name: string;
      phone?: string;
      attendance?: 'confirmed' | 'declined' | 'pending' | 'attending' | 'tentative';
      attendance_status?: 'confirmed' | 'declined' | 'pending' | 'attending' | 'tentative';
      party_size?: number;
      guests_count?: number;
      notes_or_wishes?: string;
      message?: string;
    }): Promise<RsvpResponse> => {
      // Prompt 19 Requirement 13 & 14: Rate limiting & Abuse protection
      const rateCheck = checkRsvpRateLimit(data.invitation_id);
      if (!rateCheck.allowed) {
        throw new Error(
          `تم إرسال عدة طلبات تأكيد حضور خلال فترة قصيرة. يرجى الانتظار ${rateCheck.retryAfterSeconds} ثانية والمحاولة مجدداً.`
        );
      }

      const cleanName = sanitizeText(data.guest_name, 100);
      if (!cleanName) {
        throw new Error('يرجى إدخال اسم المدعو الكريم');
      }

      // Standardize attendance: 'confirmed' or 'declined'
      const rawAttendance = data.attendance || data.attendance_status || 'confirmed';
      const isConfirmed = rawAttendance === 'confirmed' || rawAttendance === 'attending';
      const attendance = isConfirmed ? 'confirmed' : 'declined';

      // Validation on party_size / guests_count:
      // Minimum 1 for confirmed attendance, bounded by maximum safe threshold (max 20)
      let guestsCount = 1;
      if (isConfirmed) {
        const rawCount = data.guests_count ?? data.party_size ?? 1;
        guestsCount = validateRsvpGuestCount(rawCount, 20);
      } else {
        guestsCount = 0;
      }

      const rawMsg = data.message || data.notes_or_wishes || '';
      const message = sanitizeText(rawMsg, 500) || undefined;
      const phone = data.phone?.trim() ? sanitizeText(data.phone.trim(), 40) : undefined;

      // Prompt 16 Requirement 20: Link with existing guest if guest_id not provided
      let resolvedGuestId = data.guest_id;
      if (!resolvedGuestId) {
        try {
          const existingGuests = await this.guests.getByInvitationId(data.invitation_id);
          const matched = existingGuests.find((g) => {
            if (phone && g.phone && isSamePhoneNumber(g.phone, phone)) return true;
            if (g.name.trim().toLowerCase() === cleanName.toLowerCase()) return true;
            return false;
          });
          if (matched) {
            resolvedGuestId = matched.id;
          } else {
            // Requirement 20: Create guest if needed, then link guest_id to RSVP!
            const newGuest = await this.guests.create({
              invitation_id: data.invitation_id,
              name: cleanName,
              phone: phone,
              companion_count: Math.max(0, guestsCount - 1),
            });
            resolvedGuestId = newGuest.id;
          }
        } catch {
          // Continue if guest matching fails
        }
      }

      // Prompt 16 Requirement 21: Public RSVP duplicate protection
      // If a response already exists for this invitation and guest/phone/name, update it
      try {
        const existingRsvps = await this.rsvp.getByInvitationId(data.invitation_id);
        const existingRsvp = existingRsvps.find((r) => {
          if (resolvedGuestId && r.guest_id === resolvedGuestId) return true;
          if (phone && r.phone && isSamePhoneNumber(r.phone, phone)) return true;
          if (r.guest_name.trim().toLowerCase() === cleanName.toLowerCase()) return true;
          return false;
        });

        if (existingRsvp) {
          const updatedRecord = await this.rsvp.update(existingRsvp.id, {
            guest_id: resolvedGuestId || existingRsvp.guest_id,
            guest_name: cleanName,
            phone: phone || existingRsvp.phone,
            attendance,
            attendance_status: attendance,
            guests_count: guestsCount,
            party_size: guestsCount,
            message: message || existingRsvp.message,
            notes_or_wishes: message || existingRsvp.notes_or_wishes,
          });

          // Non-blocking notification dispatch
          setTimeout(async () => {
            try {
              const inv = await this.invitations.getById(data.invitation_id);
              if (inv) {
                const { notificationService } = await import('../services/notifications/NotificationService');
                await notificationService.notifyRsvp({
                  invitationId: inv.id,
                  invitationTitle: inv.title,
                  hostPhone: inv.host_whatsapp,
                  guestId: resolvedGuestId,
                  guestName: cleanName,
                  guestPhone: phone,
                  attendance,
                  guestsCount,
                  message,
                });
              }
            } catch (err) {
              console.warn('Non-blocking RSVP notification error:', err);
            }
          }, 0);

          return updatedRecord;
        }
      } catch {
        // Fall back to insert if duplicate check fails
      }

      if (isSupabaseConfigured && supabase) {
        const { data: created, error } = await supabase
          .from('rsvp_responses')
          .insert({
            invitation_id: data.invitation_id,
            guest_id: resolvedGuestId || null,
            guest_name: cleanName,
            phone: phone || null,
            attendance,
            attendance_status: attendance,
            guests_count: guestsCount,
            party_size: guestsCount,
            message: message || null,
            notes_or_wishes: message || null,
          } as any)
          .select()
          .single();
        if (!error && created) return created;
      }

      const responses = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);
      const newRsvp: RsvpResponse = {
        id: generateUuid(),
        invitation_id: data.invitation_id,
        guest_id: resolvedGuestId,
        guest_name: cleanName,
        phone,
        attendance,
        attendance_status: attendance,
        guests_count: guestsCount,
        party_size: guestsCount,
        message,
        notes_or_wishes: message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      responses.unshift(newRsvp);
      setItem(STORAGE_KEYS.RSVP, responses);

      // Non-blocking notification dispatch
      setTimeout(async () => {
        try {
          const inv = await this.invitations.getById(data.invitation_id);
          if (inv) {
            const { notificationService } = await import('../services/notifications/NotificationService');
            await notificationService.notifyRsvp({
              invitationId: inv.id,
              invitationTitle: inv.title,
              hostPhone: inv.host_whatsapp,
              guestId: resolvedGuestId,
              guestName: cleanName,
              guestPhone: phone,
              attendance,
              guestsCount,
              message,
            });
          }
        } catch (err) {
          console.warn('Non-blocking RSVP notification error:', err);
        }
      }, 0);

      return newRsvp;
    },
  };

  media = {
    getGallery: async (invitationId: string): Promise<GalleryItem[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('gallery_items')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('sort_order', { ascending: true });
        if (data) return data;
      }
      const items = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, SEED_GALLERY);
      return items
        .filter((item) => item.invitation_id === invitationId)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    addGalleryItem: async (data: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryItem> => {
      if (isSupabaseConfigured && supabase) {
        const { data: created } = await supabase
          .from('gallery_items')
          .insert({
            ...data,
            media_type: data.media_type || 'image',
            is_visible: data.is_visible ?? true,
          })
          .select()
          .single();
        if (created) return created;
      }
      const items = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, SEED_GALLERY);
      const newItem: GalleryItem = {
        ...data,
        id: generateUuid(),
        media_type: data.media_type || 'image',
        is_visible: data.is_visible ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      items.push(newItem);
      setItem(STORAGE_KEYS.GALLERY, items);
      return newItem;
    },
    updateGalleryItem: async (id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('gallery_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (data) return data;
      }
      const items = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, SEED_GALLERY);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error('Gallery item not found');
      items[idx] = {
        ...items[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.GALLERY, items);
      return items[idx];
    },
    removeGalleryItem: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('gallery_items').delete().eq('id', id);
        return true;
      }
      let items = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, SEED_GALLERY);
      items = items.filter((i) => i.id !== id);
      setItem(STORAGE_KEYS.GALLERY, items);
      return true;
    },
    reorderGallery: async (invitationId: string, orderedIds: string[]): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        await Promise.all(
          orderedIds.map((id, index) =>
            client
              .from('gallery_items')
              .update({ sort_order: index })
              .eq('id', id)
              .eq('invitation_id', invitationId)
          )
        );
      }
      const items = getItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, SEED_GALLERY);
      const updated = items.map((item) => {
        if (item.invitation_id === invitationId) {
          const newIdx = orderedIds.indexOf(item.id);
          if (newIdx !== -1) {
            return { ...item, sort_order: newIdx, updated_at: new Date().toISOString() };
          }
        }
        return item;
      });
      setItem(STORAGE_KEYS.GALLERY, updated);
      return true;
    },

    getVideos: async (invitationId: string): Promise<InvitationVideo[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('invitation_videos')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('sort_order', { ascending: true });
        if (data) return data;
      }
      const videos = getItem<InvitationVideo[]>(STORAGE_KEYS.VIDEOS, SEED_VIDEOS);
      return videos
        .filter((v) => v.invitation_id === invitationId)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    addVideo: async (data: Omit<InvitationVideo, 'id' | 'created_at' | 'updated_at'>): Promise<InvitationVideo> => {
      if (isSupabaseConfigured && supabase) {
        const { data: created } = await supabase
          .from('invitation_videos')
          .insert(data)
          .select()
          .single();
        if (created) return created;
      }
      const videos = getItem<InvitationVideo[]>(STORAGE_KEYS.VIDEOS, SEED_VIDEOS);
      const newVideo: InvitationVideo = {
        ...data,
        id: generateUuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      videos.push(newVideo);
      setItem(STORAGE_KEYS.VIDEOS, videos);
      return newVideo;
    },
    updateVideo: async (id: string, updates: Partial<InvitationVideo>): Promise<InvitationVideo> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('invitation_videos')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (data) return data;
      }
      const videos = getItem<InvitationVideo[]>(STORAGE_KEYS.VIDEOS, SEED_VIDEOS);
      const idx = videos.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error('Video item not found');
      videos[idx] = {
        ...videos[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.VIDEOS, videos);
      return videos[idx];
    },
    removeVideo: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('invitation_videos').delete().eq('id', id);
        return true;
      }
      let videos = getItem<InvitationVideo[]>(STORAGE_KEYS.VIDEOS, SEED_VIDEOS);
      videos = videos.filter((v) => v.id !== id);
      setItem(STORAGE_KEYS.VIDEOS, videos);
      return true;
    },
    reorderVideos: async (invitationId: string, orderedIds: string[]): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        await Promise.all(
          orderedIds.map((id, index) =>
            client
              .from('invitation_videos')
              .update({ sort_order: index })
              .eq('id', id)
              .eq('invitation_id', invitationId)
          )
        );
      }
      const videos = getItem<InvitationVideo[]>(STORAGE_KEYS.VIDEOS, SEED_VIDEOS);
      const updated = videos.map((v) => {
        if (v.invitation_id === invitationId) {
          const newIdx = orderedIds.indexOf(v.id);
          if (newIdx !== -1) {
            return { ...v, sort_order: newIdx, updated_at: new Date().toISOString() };
          }
        }
        return v;
      });
      setItem(STORAGE_KEYS.VIDEOS, updated);
      return true;
    },

    getAllMusicTracks: async (): Promise<MusicTrack[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('music_tracks')
          .select('*')
          .order('name', { ascending: true });
        if (data && data.length > 0) return data;
      }
      return getItem<MusicTrack[]>(STORAGE_KEYS.MUSIC, SEED_MUSIC);
    },
    getMusicTrackById: async (id: string): Promise<MusicTrack | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('music_tracks')
          .select('*')
          .eq('id', id)
          .single();
        if (data) return data;
      }
      const list = getItem<MusicTrack[]>(STORAGE_KEYS.MUSIC, SEED_MUSIC);
      return list.find((t) => t.id === id) || null;
    },
    createMusicTrack: async (data: Omit<MusicTrack, 'id' | 'created_at' | 'updated_at'>): Promise<MusicTrack> => {
      if (isSupabaseConfigured && supabase) {
        const { data: created } = await supabase
          .from('music_tracks')
          .insert(data)
          .select()
          .single();
        if (created) return created;
      }
      const list = getItem<MusicTrack[]>(STORAGE_KEYS.MUSIC, SEED_MUSIC);
      const record: MusicTrack = {
        ...data,
        id: generateUuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      list.push(record);
      setItem(STORAGE_KEYS.MUSIC, list);
      return record;
    },
    updateMusicTrack: async (id: string, updates: Partial<MusicTrack>): Promise<MusicTrack> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('music_tracks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (data) return data;
      }
      const list = getItem<MusicTrack[]>(STORAGE_KEYS.MUSIC, SEED_MUSIC);
      const idx = list.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Music track not found');
      list[idx] = {
        ...list[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.MUSIC, list);
      return list[idx];
    },
    deleteMusicTrack: async (id: string): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('music_tracks').delete().eq('id', id);
        return true;
      }
      let list = getItem<MusicTrack[]>(STORAGE_KEYS.MUSIC, SEED_MUSIC);
      list = list.filter((t) => t.id !== id);
      setItem(STORAGE_KEYS.MUSIC, list);
      return true;
    },

    getMusic: async (invitationId: string): Promise<MusicTrack | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('invitations')
          .select('music_id')
          .eq('id', invitationId)
          .single();
        if (data?.music_id) {
          const { data: track } = await supabase
            .from('music_tracks')
            .select('*')
            .eq('id', data.music_id)
            .single();
          if (track) return track;
        }
      }
      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      const inv = invitations.find((i) => i.id === invitationId);
      const list = getItem<MusicTrack[]>(STORAGE_KEYS.MUSIC, SEED_MUSIC);
      if (inv?.music_id) {
        return list.find((m) => m.id === inv.music_id) || null;
      }
      return list.find((m) => m.is_active) || null;
    },
    saveMusic: async (data: Omit<MusicTrack, 'id' | 'created_at' | 'updated_at'>): Promise<MusicTrack> => {
      return this.media.createMusicTrack(data);
    },
    setInvitationMusic: async (invitationId: string, musicId: string | null): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('invitations')
          .update({ music_id: musicId })
          .eq('id', invitationId);
      }
      const invitations = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, SEED_INVITATIONS);
      const idx = invitations.findIndex((i) => i.id === invitationId);
      if (idx !== -1) {
        invitations[idx] = {
          ...invitations[idx],
          music_id: musicId || undefined,
          updated_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.INVITATIONS, invitations);
      }
      return true;
    },
  };

  analytics = {
    track: async (data: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void> => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('analytics_events').insert(data as any);
      }
      const events = getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
      events.push({
        ...data,
        id: generateUuid(),
        created_at: new Date().toISOString(),
      });
      if (events.length > 2500) events.shift();
      setItem(STORAGE_KEYS.ANALYTICS, events);
    },
    getEvents: async (invitationId?: string, startDate?: string, endDate?: string): Promise<AnalyticsEvent[]> => {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('analytics_events').select('*').order('created_at', { ascending: false });
        if (invitationId) query = query.eq('invitation_id', invitationId);
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        const { data } = await query;
        if (data) return data;
      }
      let events = getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
      if (invitationId) {
        events = events.filter((e) => e.invitation_id === invitationId);
      }
      if (startDate) {
        const start = new Date(startDate).getTime();
        events = events.filter((e) => new Date(e.created_at).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate).getTime();
        events = events.filter((e) => new Date(e.created_at).getTime() <= end);
      }
      return events;
    },
    getSummaryByInvitationId: async (invitationId: string) => {
      const events = getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
      const rsvps = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);

      const invEvents = events.filter((e) => e.invitation_id === invitationId);
      const views = invEvents.filter((e) => e.event_type === 'page_view').length;
      const shares = invEvents.filter((e) =>
        e.event_type === 'share_click' ||
        e.event_type === 'share_open' ||
        e.event_type === 'share_whatsapp' ||
        e.event_type === 'native_share' ||
        e.event_type === 'copy_link'
      ).length;
      const rsvpCount = rsvps.filter((r) => r.invitation_id === invitationId).length;

      return {
        viewsCount: views,
        rsvpsCount: rsvpCount,
        sharesCount: shares,
      };
    },
    getDetailedStats: async (invitationId?: string, dateRange: 'today' | '7d' | '30d' | 'all' = 'all') => {
      let events = getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
      const rsvps = getItem<RsvpResponse[]>(STORAGE_KEYS.RSVP, SEED_RSVP);

      // Filter by invitation if specified
      if (invitationId && invitationId !== 'all') {
        events = events.filter((e) => e.invitation_id === invitationId);
      }

      // Filter by date range
      const now = Date.now();
      let startTime = 0;
      if (dateRange === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        startTime = startOfDay.getTime();
      } else if (dateRange === '7d') {
        startTime = now - 7 * 86400000;
      } else if (dateRange === '30d') {
        startTime = now - 30 * 86400000;
      }

      if (startTime > 0) {
        events = events.filter((e) => new Date(e.created_at).getTime() >= startTime);
      }

      // Filter RSVPs
      let matchingRsvps = rsvps;
      if (invitationId && invitationId !== 'all') {
        matchingRsvps = matchingRsvps.filter((r) => r.invitation_id === invitationId);
      }
      if (startTime > 0) {
        matchingRsvps = matchingRsvps.filter((r) => new Date(r.created_at).getTime() >= startTime);
      }

      const totalViews = events.filter((e) => e.event_type === 'page_view').length;
      const uniqueViewsEvents = events.filter((e) => e.event_type === 'unique_view').length;
      const distinctSessions = new Set(events.map((e) => e.session_id).filter(Boolean)).size;
      const uniqueVisitors = Math.max(uniqueViewsEvents, distinctSessions, totalViews > 0 ? 1 : 0);

      const invitationsOpened = events.filter((e) => e.event_type === 'invitation_open').length;

      const confirmedRsvps = matchingRsvps.filter(
        (r) => r.attendance === 'confirmed' || r.attendance_status === 'attending'
      );
      const declinedRsvps = matchingRsvps.filter(
        (r) => r.attendance === 'declined' || r.attendance_status === 'declined'
      );

      const rsvpConfirmed = confirmedRsvps.length;
      const rsvpDeclined = declinedRsvps.length;
      const totalAttendees = confirmedRsvps.reduce(
        (sum, r) => sum + (Number(r.guests_count || r.party_size) || 1),
        0
      );

      const mapClicks = events.filter((e) => e.event_type === 'map_click').length;
      const whatsappClicks = events.filter((e) => e.event_type === 'whatsapp_click').length;
      const shareClicks = events.filter((e) =>
        e.event_type === 'share_open' ||
        e.event_type === 'share_whatsapp' ||
        e.event_type === 'share_messenger' ||
        e.event_type === 'share_telegram' ||
        e.event_type === 'share_sms' ||
        e.event_type === 'native_share' ||
        e.event_type === 'copy_link' ||
        e.event_type === 'share_click'
      ).length;

      const galleryOpens = events.filter(
        (e) => e.event_type === 'gallery_open' || e.event_type === 'gallery_image_view'
      ).length;
      const videoPlays = events.filter(
        (e) => e.event_type === 'video_play' || e.event_type === 'video_complete'
      ).length;
      const musicPlays = events.filter(
        (e) => e.event_type === 'music_play' || e.event_type === 'music_pause'
      ).length;
      const qrScans = events.filter((e) => e.event_type === 'qr_scan').length;

      // Device distribution
      const devices = { mobile: 0, tablet: 0, desktop: 0 };
      events.forEach((e) => {
        const type = (e.device_type || 'mobile').toLowerCase();
        if (type.includes('tablet')) devices.tablet++;
        else if (type.includes('desktop')) devices.desktop++;
        else devices.mobile++;
      });

      // Views over time (grouped by day for line chart)
      const dayMap: Record<string, { views: number; uniqueViews: number }> = {};
      const daysCount = dateRange === 'today' ? 1 : dateRange === '7d' ? 7 : 14;

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { views: 0, uniqueViews: 0 };
      }

      events.forEach((e) => {
        const key = e.created_at.slice(0, 10);
        if (dayMap[key]) {
          if (e.event_type === 'page_view') dayMap[key].views++;
          if (e.event_type === 'unique_view') dayMap[key].uniqueViews++;
        }
      });

      const viewsOverTime = Object.entries(dayMap).map(([date, data]) => ({
        date,
        views: data.views,
        uniqueViews: data.uniqueViews,
      }));

      // Top descriptive events breakdown
      const topEvents = [
        { eventType: 'page_view', labelAr: 'مشاهدات صفحة الدعوة', count: totalViews },
        { eventType: 'invitation_open', labelAr: 'فتح بطاقة الدعوة والظرف', count: invitationsOpened },
        { eventType: 'unique_view', labelAr: 'الزيارات الفريدة الموثوقة', count: uniqueVisitors },
        { eventType: 'rsvp_confirmed', labelAr: 'تأكيد الحضور (RSVP)', count: rsvpConfirmed },
        { eventType: 'map_click', labelAr: 'الوصول لموقع القاعة (Google Maps)', count: mapClicks },
        { eventType: 'whatsapp_click', labelAr: 'التواصل مع المضيف عبر WhatsApp', count: whatsappClicks },
        { eventType: 'share_open', labelAr: 'مشاركة ونشر رابط الدعوة', count: shareClicks },
        { eventType: 'qr_scan', labelAr: 'مسح رمز الاستجابة السريعة (QR)', count: qrScans },
        { eventType: 'gallery_open', labelAr: 'تصفح ألبوم الصور الفاخر', count: galleryOpens },
        { eventType: 'music_play', labelAr: 'تشغيل الموسيقى الاحتفالية', count: musicPlays },
        { eventType: 'video_play', labelAr: 'مشاهدة فيديو المناسبة', count: videoPlays },
      ].sort((a, b) => b.count - a.count);

      return {
        totalViews,
        uniqueVisitors,
        invitationsOpened,
        rsvpConfirmed,
        rsvpDeclined,
        totalAttendees,
        mapClicks,
        whatsappClicks,
        shareClicks,
        galleryOpens,
        videoPlays,
        musicPlays,
        qrScans,
        devices,
        viewsOverTime,
        topEvents,
      };
    },
  };

  qrCodes = {
    getByInvitationId: async (invitationId: string): Promise<InvitationQrCode | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('invitation_qr_codes')
          .select('*')
          .eq('invitation_id', invitationId)
          .single();
        if (data) return data;
      }
      const list = getItem<InvitationQrCode[]>(STORAGE_KEYS.QR_CODES, []);
      return list.find((q) => q.invitation_id === invitationId) || null;
    },
    createOrUpdate: async (data: {
      invitation_id: string;
      qr_value: string;
      image_url?: string;
      is_active?: boolean;
    }): Promise<InvitationQrCode> => {
      if (isSupabaseConfigured && supabase) {
        const { data: upserted } = await supabase
          .from('invitation_qr_codes')
          .upsert(
            {
              invitation_id: data.invitation_id,
              qr_value: data.qr_value,
              image_url: data.image_url,
              is_active: data.is_active ?? true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'invitation_id' }
          )
          .select()
          .single();
        if (upserted) return upserted;
      }
      const list = getItem<InvitationQrCode[]>(STORAGE_KEYS.QR_CODES, []);
      const idx = list.findIndex((q) => q.invitation_id === data.invitation_id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          qr_value: data.qr_value,
          image_url: data.image_url ?? list[idx].image_url,
          is_active: data.is_active ?? list[idx].is_active,
          updated_at: new Date().toISOString(),
        };
        setItem(STORAGE_KEYS.QR_CODES, list);
        return list[idx];
      }
      const newQr: InvitationQrCode = {
        id: generateUuid(),
        invitation_id: data.invitation_id,
        qr_value: data.qr_value,
        image_url: data.image_url,
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      list.push(newQr);
      setItem(STORAGE_KEYS.QR_CODES, list);
      return newQr;
    },
    setActive: async (invitationId: string, isActive: boolean): Promise<boolean> => {
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('invitation_qr_codes')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq('invitation_id', invitationId);
      }
      const list = getItem<InvitationQrCode[]>(STORAGE_KEYS.QR_CODES, []);
      const idx = list.findIndex((q) => q.invitation_id === invitationId);
      if (idx !== -1) {
        list[idx].is_active = isActive;
        list[idx].updated_at = new Date().toISOString();
        setItem(STORAGE_KEYS.QR_CODES, list);
      }
      return true;
    },
  };

  notifications = {
    getAll: async (): Promise<NotificationLog[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('notification_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) return data;
      }
      return getItem<NotificationLog[]>(STORAGE_KEYS.NOTIFICATIONS, [
        {
          id: 'notif-seed-1',
          invitation_id: 'inv-1',
          guest_id: 'guest-1',
          notification_type: 'rsvp_confirmed',
          channel: 'whatsapp',
          recipient: '+212661234567',
          status: 'sent',
          provider_message_id: 'wamid_HBgLMjEyNjYxMjM0NTY3FQIAERgSMzNF',
          error_message: undefined,
          retry_count: 0,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-seed-2',
          invitation_id: 'inv-1',
          guest_id: 'guest-2',
          notification_type: 'rsvp_confirmed',
          channel: 'whatsapp',
          recipient: '+212662987654',
          status: 'delivered',
          provider_message_id: 'wamid_HBgLMjEyNjYyOTg3NjU0FQIAERgSMzNF',
          error_message: undefined,
          retry_count: 0,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'notif-seed-3',
          invitation_id: 'inv-1',
          guest_id: 'guest-3',
          notification_type: 'invitation_reminder',
          channel: 'whatsapp',
          recipient: '+212770112233',
          status: 'queued',
          provider_message_id: undefined,
          error_message: 'بانتظار تأكيد جدولة إرسال التذكير',
          retry_count: 0,
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ]);
    },
    getById: async (id: string): Promise<NotificationLog | null> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('id', id)
          .single();
        if (data) return data;
      }
      const logs = await this.notifications.getAll();
      return logs.find((l) => l.id === id) || null;
    },
    log: async (entry: Omit<NotificationLog, 'id' | 'created_at'>): Promise<NotificationLog> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('notification_logs')
          .insert(entry)
          .select()
          .single();
        if (data) return data;
      }
      const logs = await this.notifications.getAll();
      const record: NotificationLog = {
        ...entry,
        id: generateUuid(),
        created_at: new Date().toISOString(),
      };
      logs.unshift(record);
      setItem(STORAGE_KEYS.NOTIFICATIONS, logs);
      return record;
    },
    update: async (id: string, updates: Partial<NotificationLog>): Promise<NotificationLog> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('notification_logs')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        if (data) return data;
      }
      const logs = await this.notifications.getAll();
      const idx = logs.findIndex((l) => l.id === id);
      if (idx === -1) throw new Error('Notification log not found');
      logs[idx] = {
        ...logs[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setItem(STORAGE_KEYS.NOTIFICATIONS, logs);
      return logs[idx];
    },
    getByInvitationId: async (invitationId: string): Promise<NotificationLog[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('invitation_id', invitationId)
          .order('created_at', { ascending: false });
        if (data) return data;
      }
      const logs = await this.notifications.getAll();
      return logs.filter((l) => l.invitation_id === invitationId);
    },
  };
}

export const db: IDatabaseService = new DatabaseServiceImpl();
