/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../db';
import { Invitation, Customer, RsvpResponse, Guest, InvitationStatus } from '../../types/database';
import { TEMPLATE_REGISTRY } from '../../templates/registry';
import { useAdminAuth } from '../../auth/AuthContext';
import { BRAND } from '../../design-system/tokens';
import {
  Mail,
  Users,
  CheckCircle2,
  Plus,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Eye,
  Edit3,
  UserCheck,
  User,
  HeartHandshake,
  Check,
  X,
  Palette,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

// Helper for Arabic date formatting
function formatDateArabic(dateStr?: string): string {
  if (!dateStr) return 'غير محدد';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Helper for relative time in Arabic
function getRelativeTimeArabic(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'منذ لحظات';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return formatDateArabic(isoString);
  } catch {
    return 'مؤخراً';
  }
}

// Event type details helper
function getEventTypeInfo(type?: string): { label: string; icon: string } {
  switch (type) {
    case 'wedding':
      return { label: 'حفل زفاف', icon: '💍' };
    case 'engagement':
      return { label: 'خطوبة', icon: '💎' };
    case 'graduation':
      return { label: 'حفل تخرج', icon: '🎓' };
    case 'aqiqah':
      return { label: 'عقيقة / مولود', icon: '👶' };
    case 'birthday':
      return { label: 'عيد ميلاد', icon: '🎂' };
    case 'family':
    case 'family_event':
      return { label: 'لقاء عائلي', icon: '🏡' };
    default:
      return { label: 'مناسبة خاصة', icon: '✨' };
  }
}

// Activity item interface
interface PlatformActivity {
  id: string;
  type: 'rsvp' | 'invitation';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  badgeType?: 'success' | 'info' | 'warning';
}

export const AdminDashboardPage: React.FC = () => {
  const { admin } = useAdminAuth();

  // Data state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvitationStatus>('all');

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invList, custList, guestList, rsvpList] = await Promise.all([
        db.invitations.getAll({ includeDeleted: false }),
        db.customers.getAll(false),
        db.guests.getAll(),
        db.rsvp.getAll(),
      ]);

      setInvitations(invList);
      setCustomers(custList);
      setGuests(guestList);
      setRsvps(rsvpList);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('تعذر تحميل بيانات لوحة التحكم. يرجى التحقق من الاتصال والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute Overview Statistics (Section 8)
  const stats = useMemo(() => {
    const totalInvitations = invitations.length;
    const activeInvitations = invitations.filter((i) => i.status === 'active').length;
    const draftInvitations = invitations.filter((i) => i.status === 'draft').length;
    const totalCustomers = customers.length;
    
    // Total guests: sum from guests records or party sizes
    const totalGuests = guests.length > 0 
      ? guests.reduce((sum, g) => sum + 1 + (g.companion_count || 0), 0)
      : rsvps.reduce((sum, r) => sum + (r.party_size || r.guests_count || 1), 0);

    // Confirmed RSVPs and Total Confirmed Attendees (Prompt 16 Requirement 23 & 25)
    const confirmedRsvpList = rsvps.filter(
      (r) => r.attendance === 'confirmed' || r.attendance_status === 'confirmed'
    );
    const confirmedResponses = confirmedRsvpList.length;
    const totalConfirmedAttendees = confirmedRsvpList.reduce(
      (sum, r) => sum + (r.guests_count || r.party_size || 1),
      0
    );

    const rsvpRate = rsvps.length > 0 ? Math.round((confirmedResponses / rsvps.length) * 100) : 0;

    return {
      totalInvitations,
      activeInvitations,
      draftInvitations,
      totalCustomers,
      totalGuests,
      confirmedResponses,
      totalConfirmedAttendees,
      rsvpRate,
    };
  }, [invitations, customers, guests, rsvps]);

  // Filtered & Searched Invitations (Sections 10, 13, 14)
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      // Status filter
      if (statusFilter !== 'all' && inv.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const titleMatch = inv.title?.toLowerCase().includes(query);
        const slugMatch = inv.slug?.toLowerCase().includes(query);
        const celebrantMatch = inv.content?.celebrant_names?.toLowerCase().includes(query);
        const hostMatch = inv.content?.host_names?.toLowerCase().includes(query);
        const venueMatch = inv.venue_name?.toLowerCase().includes(query);
        const typeMatch = inv.event_type?.toLowerCase().includes(query);

        return titleMatch || slugMatch || celebrantMatch || hostMatch || venueMatch || typeMatch;
      }

      return true;
    });
  }, [invitations, statusFilter, searchQuery]);

  // Aggregate recent activity across RSVPs and Invitations (Section 18)
  const recentActivities: PlatformActivity[] = useMemo(() => {
    const list: PlatformActivity[] = [];

    // Recent RSVPs
    rsvps.slice(0, 5).forEach((rsvp) => {
      const isConfirmed = rsvp.attendance === 'confirmed' || rsvp.attendance_status === 'confirmed';
      const relatedInv = invitations.find((i) => i.id === rsvp.invitation_id);

      list.push({
        id: `rsvp-${rsvp.id}`,
        type: 'rsvp',
        title: `تأكيد حضور من: ${rsvp.guest_name}`,
        description: relatedInv ? `لصالح: ${relatedInv.title}` : 'استجابة حضور رقمية',
        timestamp: rsvp.created_at,
        badge: isConfirmed ? 'حاضر بإذن الله' : 'معتذر',
        badgeType: isConfirmed ? 'success' : 'warning',
      });
    });

    // Recent invitations created or updated
    invitations.slice(0, 3).forEach((inv) => {
      list.push({
        id: `inv-${inv.id}`,
        type: 'invitation',
        title: `تحديث الدعوة: ${inv.title}`,
        description: `الرابط: /i/${inv.slug} — ${inv.status === 'active' ? 'نشطة' : 'مسودة'}`,
        timestamp: inv.updated_at || inv.created_at,
        badge: inv.status === 'active' ? 'نشطة' : 'مسودة',
        badgeType: inv.status === 'active' ? 'success' : 'info',
      });
    });

    // Sort by timestamp descending
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 6);
  }, [rsvps, invitations]);

  // Dynamic admin name
  const adminDisplayName = admin?.full_name || admin?.name || 'مدير النظام';

  // Today's formatted Arabic date
  const todayArabic = new Date().toLocaleDateString('ar-MA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 text-right motion-fade-in pb-12" dir="rtl">
      {/* 1. WELCOME AREA & HEADER (Sections 4 & 7) */}
      <section className="bg-gradient-to-l from-[#FFFFFF] via-[#FAF7F2] to-[#FAF7F2] border border-[#E8DED8] rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#C9A45C]/5 rounded-full -translate-x-12 -translate-y-12 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="text-xl sm:text-2xl" aria-hidden="true">👋</span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#171316]">
                مرحباً بك، {adminDisplayName}
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#9F7C36] border border-[#E8D8B6]">
                {BRAND.nameAr}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6F6668] leading-relaxed">
              إليك نظرة سريعة على منسباتي اليوم — {BRAND.taglineAr}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-[#9A8F92] font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>{todayArabic}</span>
            </div>
          </div>

          {/* Quick Action Top Button (Section 12) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/admin/invitations/create">
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-sm"
              >
                + إنشاء دعوة جديدة
              </Button>
            </Link>
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-[#E8DED8] bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#6F6668] hover:text-[#5A1020] transition cursor-pointer disabled:opacity-50"
              title="تحديث البيانات"
              aria-label="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C9A45C]' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* ERROR STATE BANNER (Section 17) */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#FEECEB] border border-[#FECDCA] text-[#B42318] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#B42318]" />
            <p className="font-medium">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            className="self-end sm:self-auto border-[#B42318] text-[#B42318] hover:bg-[#B42318] hover:text-white"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* 2. OVERVIEW STATISTICS CARDS (Sections 8 & 9, Skeleton in Section 16) */}
      <section aria-labelledby="statistics-heading">
        <div className="flex items-center justify-between mb-3.5">
          <h2 id="statistics-heading" className="text-sm font-serif font-bold text-[#171316]">
            مؤشرات المنصة والأداء
          </h2>
          <span className="text-[11px] text-[#6F6668]">تحديث حي من قاعدة البيانات</span>
        </div>

        {isLoading ? (
          /* Skeleton Loading States for Statistics */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] animate-pulse flex flex-col justify-between h-28"
              >
                <div className="flex items-center justify-between">
                  <div className="w-16 h-3 bg-[#E8DED8] rounded" />
                  <div className="w-7 h-7 bg-[#E8DED8] rounded-lg" />
                </div>
                <div className="w-12 h-6 bg-[#E8DED8] rounded mt-2" />
                <div className="w-20 h-2 bg-[#E8DED8] rounded mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* 1. Total Invitations */}
            <Card className="flex flex-col justify-between hover:border-[#C9A45C]/50 transition-all shadow-xs hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6F6668]">إجمالي الدعوات</span>
                <div className="p-2 rounded-xl bg-[#F6ECF0] text-[#5A1020]">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#171316] font-mono tabular-nums">
                  {stats.totalInvitations}
                </span>
                <p className="text-[11px] text-[#6F6668] mt-1 truncate">
                  منها <span className="text-[#5A1020] font-semibold">{stats.draftInvitations}</span> مسودة
                </p>
              </div>
            </Card>

            {/* 2. Active Invitations */}
            <Card className="flex flex-col justify-between hover:border-[#218739]/50 transition-all shadow-xs hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6F6668]">الدعوات النشطة</span>
                <div className="p-2 rounded-xl bg-[#EDF7EE] text-[#218739]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#218739] font-mono tabular-nums">
                  {stats.activeInvitations}
                </span>
                <p className="text-[11px] text-[#6F6668] mt-1 truncate">
                  متاحة ومفتوحة للمدعوين
                </p>
              </div>
            </Card>

            {/* 3. Total Customers */}
            <Card className="flex flex-col justify-between hover:border-[#C9A45C]/50 transition-all shadow-xs hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6F6668]">إجمالي العملاء</span>
                <div className="p-2 rounded-xl bg-[#F9F5EC] text-[#9F7C36]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#171316] font-mono tabular-nums">
                  {stats.totalCustomers}
                </span>
                <p className="text-[11px] text-[#6F6668] mt-1 truncate">
                  أصحاب المناسبات المسجلين
                </p>
              </div>
            </Card>

            {/* 4. Total Guests */}
            <Card className="flex flex-col justify-between hover:border-[#C9A45C]/50 transition-all shadow-xs hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6F6668]">إجمالي الضيوف</span>
                <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#5A1020] border border-[#E8DED8]">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#171316] font-mono tabular-nums">
                  {stats.totalGuests}
                </span>
                <p className="text-[11px] text-[#6F6668] mt-1 truncate">
                  شامل المرافقين
                </p>
              </div>
            </Card>

            {/* 5. Confirmed RSVPs & Total Confirmed Attendees (Prompt 16 Requirement 23 & 25) */}
            <Card className="flex flex-col justify-between hover:border-[#218739]/50 transition-all shadow-xs hover:shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6F6668]">الحضور المؤكد (RSVP)</span>
                <div className="p-2 rounded-xl bg-[#EDF7EE] text-[#218739]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#18642A] font-mono tabular-nums">
                    {stats.totalConfirmedAttendees}
                  </span>
                  <span className="text-xs text-[#218739] font-medium">حاضر</span>
                </div>
                <p className="text-[11px] text-[#6F6668] mt-1 truncate flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3 text-[#218739]" />
                  <span>{stats.confirmedResponses} رد مؤكد ({stats.rsvpRate}%)</span>
                </p>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* 3. MAIN DASHBOARD CONTENT GRID (Sections 10, 11, 13, 14, 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Invitations with Search & Filter (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E8DED8]">
            <div>
              <h2 className="text-base font-serif font-bold text-[#171316]">
                آخر الدعوات
              </h2>
              <p className="text-xs text-[#6F6668]">
                متابعة وإدارة ومراجعة الدعوات الرقمية المعتمدة
              </p>
            </div>
            <Link
              to="/admin/invitations"
              className="text-xs text-[#5A1020] hover:text-[#460C18] font-semibold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>عرض كافة الدعوات ({invitations.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5 rotate-45" />
            </Link>
          </div>

          {/* Search Bar & Filter Tabs (Sections 13 & 14) */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9A8F92] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالعنوان، اسم العريس/العروس، الرابط..."
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] text-xs text-[#171316] placeholder:text-[#9A8F92] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]/40 focus:border-[#C9A45C] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8F92] hover:text-[#171316] p-1"
                  aria-label="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-xl border border-[#E8DED8] overflow-x-auto text-[11px]">
              {(
                [
                  { id: 'all', label: 'الكل' },
                  { id: 'active', label: 'نشطة' },
                  { id: 'draft', label: 'مسودة' },
                  { id: 'paused', label: 'متوقفة' },
                  { id: 'expired', label: 'منتهية' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer font-medium ${
                    statusFilter === tab.id
                      ? 'bg-[#5A1020] text-[#FFFFFF] shadow-xs'
                      : 'text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Invitations List / Cards (Sections 10, 11, 15, 16) */}
          <div className="space-y-3">
            {isLoading ? (
              /* Skeletons for invitations */
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#E8DED8] rounded-xl shrink-0" />
                    <div className="space-y-2">
                      <div className="w-40 h-4 bg-[#E8DED8] rounded" />
                      <div className="w-24 h-3 bg-[#E8DED8] rounded" />
                      <div className="w-32 h-3 bg-[#E8DED8] rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="w-16 h-8 bg-[#E8DED8] rounded-lg" />
                    <div className="w-16 h-8 bg-[#E8DED8] rounded-lg" />
                  </div>
                </div>
              ))
            ) : filteredInvitations.length === 0 ? (
              /* EMPTY STATES (Section 15) */
              invitations.length === 0 ? (
                /* Empty state when NO invitations exist at all */
                <div className="p-8 sm:p-12 rounded-2xl border-2 border-dashed border-[#E8DED8] bg-[#FFFFFF] text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-[#C9A45C] border border-[#E8D8B6] flex items-center justify-center mx-auto text-2xl shadow-xs">
                    💌
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-base font-serif font-bold text-[#171316]">
                      مازال ما أنشأنا حتى دعوة
                    </h3>
                    <p className="text-xs text-[#6F6668] mt-1 leading-relaxed">
                      ابدأ بإنشاء أول دعوة رقمية على منسباتي وخصص تفاصيل العرسان والتاريخ والقالب الفاخر.
                    </p>
                  </div>
                  <Link to="/admin/invitations/create">
                    <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                      إنشاء أول دعوة رقمية
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Empty state when search or filter produces 0 matches */
                <div className="p-8 rounded-xl border border-dashed border-[#E8DED8] bg-[#FFFFFF] text-center space-y-3">
                  <p className="text-xs font-semibold text-[#171316]">
                    لا توجد دعوات تطابق هذا التصنيف أو البحث
                  </p>
                  <p className="text-[11px] text-[#6F6668]">
                    جرب تغيير كلمات البحث أو إعادة تعيين الفلتر لعرض جميع الدعوات.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  >
                    إعادة تعيين الفلاتر
                  </Button>
                </div>
              )
            ) : (
              /* Render List of Invitations */
              filteredInvitations.map((inv) => {
                const eventInfo = getEventTypeInfo(inv.event_type);
                const templateObj = TEMPLATE_REGISTRY[inv.template_id];
                const templateName = templateObj ? templateObj.nameAr : inv.template_id;
                const celebrants = inv.content?.celebrant_names || inv.content?.host_names;
                const formattedDate = formatDateArabic(inv.event_date || inv.content?.date_iso);
                const creationDate = formatDateArabic(inv.created_at);

                // RSVPs count for this invitation
                const invRsvps = rsvps.filter((r) => r.invitation_id === inv.id);
                const invConfirmedCount = invRsvps.filter(
                  (r) => r.attendance === 'confirmed' || r.attendance_status === 'confirmed'
                ).length;

                return (
                  <div
                    key={inv.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] hover:border-[#C9A45C]/60 transition-all shadow-xs hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Invitation Meta */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E8D8B6] flex items-center justify-center text-xl shrink-0 mt-0.5 shadow-xs">
                        {eventInfo.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#171316] truncate">
                            {inv.title}
                          </h3>
                          <StatusBadge status={inv.status} />
                        </div>

                        {celebrants && (
                          <p className="text-xs text-[#5A1020] font-medium mt-0.5 truncate">
                            {celebrants}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-[#6F6668] mt-1.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-[#C9A45C]" />
                            <span>{formattedDate}</span>
                          </span>

                          <span className="flex items-center gap-1">
                            <Palette className="w-3 h-3 text-[#C9A45C]" />
                            <span>{templateName}</span>
                          </span>

                          <span className="text-[#9A8F92] font-mono" dir="ltr">
                            /i/{inv.slug}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-[#9A8F92] mt-2 pt-2 border-t border-[#F4ECE4]">
                          <span>أُنشئت: {creationDate}</span>
                          <span>•</span>
                          <span className="text-[#218739] font-medium">
                            تأكيدات الحضور: {invConfirmedCount} / {invRsvps.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View & Edit (Sections 10 & 20) */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <a
                        href={`/i/${inv.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4ECE4] text-[#171316] transition text-xs font-medium flex items-center gap-1.5 border border-[#E8DED8]"
                        title="فتح الرابط العام في نافذة جديدة"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
                        <span>معاينة</span>
                      </a>

                      <Link
                        to={`/admin/invitations/edit/${inv.id}`}
                        className="py-2 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#5A1020] text-xs font-semibold border border-[#E8DED8] hover:border-[#5A1020]/40 transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent Activity Feed (Sections 12 & 18) */}
        <div className="space-y-6">
          {/* Quick Actions Card (Section 12) */}
          <Card title="إجراءات سريعة">
            <div className="space-y-2.5">
              <Link
                to="/admin/invitations/create"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F6ECF0] hover:bg-[#EEDFE5] text-[#5A1020] transition border border-[#E3C8D0] group text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#5A1020] text-white">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>+ إنشاء دعوة جديدة</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#5A1020] rotate-45 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/admin/templates"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4ECE4] text-[#171316] transition border border-[#E8DED8] group text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#F9F5EC] text-[#9F7C36] border border-[#E8D8B6]">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <span>استعراض كتالوج القوالب</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#6F6668] rotate-45 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <a
                href="/i/ahmed-sara"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4ECE4] text-[#171316] transition border border-[#E8DED8] group text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#C9A45C] border border-[#E8DED8]">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <span>معاينة حية للدعوة النموذجية</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
              </a>
            </div>
          </Card>

          {/* Recent Platform Activity Foundation (Section 18) */}
          <Card title="آخر الأنشطة والتفاعلات">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#FAF7F2] h-14" />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6F6668]">
                لا توجد أنشطة مسجلة حديثاً
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#171316] text-[12px]">
                        {act.title}
                      </span>
                      {act.badge && (
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            act.badgeType === 'success'
                              ? 'bg-[#EDF7EE] text-[#218739] border-[#B7E2BD]'
                              : 'bg-[#F9F5EC] text-[#9F7C36] border-[#E8D8B6]'
                          }`}
                        >
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6F6668] truncate">{act.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-[#9A8F92] pt-1">
                      <Clock className="w-3 h-3 text-[#C9A45C]" />
                      <span>{getRelativeTimeArabic(act.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Platform Status Badge */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] text-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#171316] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C9A45C]" />
                <span>حالة منصة منسباتي</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#218739] bg-[#EDF7EE] px-2 py-0.5 rounded-md border border-[#B7E2BD]">
                نشط 100%
              </span>
            </div>
            <p className="text-[11px] text-[#6F6668] leading-relaxed">
              محرك إدارة الدعوات، قاعدة بيانات الحضور، ونظام التشفير وحماية الجلسات تعمل بكفاءة تامة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
