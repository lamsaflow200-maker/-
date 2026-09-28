/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../db';
import {
  Invitation,
  Customer,
  TemplateRecord,
  InvitationStatus,
  EventType,
  RsvpResponse,
} from '../../types/database';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Search } from '../../components/ui/Search';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { InvitationPreviewModal } from '../../components/admin/InvitationPreviewModal';
import {
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Pause,
  Play,
  Copy,
  Archive,
  RefreshCw,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UsersRound,
} from 'lucide-react';

const ITEMS_PER_PAGE = 9;

type FilterStatusTab = 'all' | 'draft' | 'active' | 'paused' | 'expired' | 'archived';
type SortOption = 'newest' | 'oldest' | 'event_date';

export const AdminInvitationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [customersMap, setCustomersMap] = useState<Record<string, Customer>>({});
  const [templatesMap, setTemplatesMap] = useState<Record<string, TemplateRecord>>({});
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<FilterStatusTab>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs & Modals
  const [previewTarget, setPreviewTarget] = useState<Invitation | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Invitation | null>(null);
  const [isProcessingArchive, setIsProcessingArchive] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<Invitation | null>(null);
  const [isProcessingDuplicate, setIsProcessingDuplicate] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allInvs, allCusts, allTemplates, allRsvps] = await Promise.all([
        db.invitations.getAll({ includeDeleted: true }),
        db.customers.getAll(true),
        db.templates.getAll(),
        db.rsvp.getAll(),
      ]);

      setInvitations(allInvs);
      setRsvps(allRsvps);

      const custMap: Record<string, Customer> = {};
      allCusts.forEach((c) => {
        custMap[c.id] = c;
      });
      setCustomersMap(custMap);

      const tMap: Record<string, TemplateRecord> = {};
      allTemplates.forEach((t) => {
        tMap[t.id] = t;
      });
      setTemplatesMap(tMap);
    } catch {
      toastError('فشل تحميل قائمة الدعوات من قاعدة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  // RSVP statistics mapped per invitation (Prompt 16 Requirement 26)
  const rsvpStatsByInv = useMemo(() => {
    const map: Record<
      string,
      { confirmed: number; declined: number; pending: number; totalAttendees: number }
    > = {};

    rsvps.forEach((r) => {
      if (!map[r.invitation_id]) {
        map[r.invitation_id] = { confirmed: 0, declined: 0, pending: 0, totalAttendees: 0 };
      }
      const isConfirmed = r.attendance === 'confirmed' || r.attendance_status === 'confirmed';
      const isDeclined = r.attendance === 'declined' || r.attendance_status === 'declined';
      const isPending = r.attendance === 'pending' || r.attendance_status === 'pending';

      if (isConfirmed) {
        map[r.invitation_id].confirmed += 1;
        map[r.invitation_id].totalAttendees += r.guests_count || r.party_size || 1;
      } else if (isDeclined) {
        map[r.invitation_id].declined += 1;
      } else if (isPending) {
        map[r.invitation_id].pending += 1;
      }
    });

    return map;
  }, [rsvps]);

  useEffect(() => {
    loadData();
  }, []);

  // Pause / Activate toggle
  const handleToggleStatus = async (inv: Invitation) => {
    const nextStatus: InvitationStatus = inv.status === 'active' ? 'paused' : 'active';
    try {
      await db.invitations.update(inv.id, { status: nextStatus });
      success(
        nextStatus === 'active'
          ? 'تم تفعيل الدعوة ونشرها بنجاح'
          : 'تم إيقاف الدعوة مؤقتاً'
      );
      loadData();
    } catch {
      toastError('فشل تحديث حالة الدعوة');
    }
  };

  // Archive / Restore
  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    setIsProcessingArchive(true);
    try {
      if (archiveTarget.deleted_at) {
        // Restore
        await db.invitations.restore(archiveTarget.id);
        success('تمت استعادة الدعوة من الأرشيف كمسودة');
      } else {
        // Soft delete / archive
        await db.invitations.delete(archiveTarget.id, false);
        success('تمت أرشفة الدعوة بنجاح');
      }
      setArchiveTarget(null);
      loadData();
    } catch {
      toastError('فشل أرشفة الدعوة');
    } finally {
      setIsProcessingArchive(false);
    }
  };

  // Duplicate
  const handleDuplicateConfirm = async () => {
    if (!duplicateTarget) return;
    setIsProcessingDuplicate(true);
    try {
      const cloned = await db.invitations.duplicate(duplicateTarget.id);
      success(`تم نسخ الدعوة بنجاح برابط جديد: /i/${cloned.slug}`);
      setDuplicateTarget(null);
      await loadData();
      navigate(`/admin/invitations/${cloned.id}/edit`);
    } catch {
      toastError('فشل نسخ الدعوة');
    } finally {
      setIsProcessingDuplicate(false);
    }
  };

  // Filtered & Sorted Invitations
  const filteredInvitations = useMemo(() => {
    return invitations
      .filter((inv) => {
        const isArchived = Boolean(inv.deleted_at);

        // Tab filter
        if (statusTab === 'archived') {
          if (!isArchived) return false;
        } else {
          if (isArchived) return false; // Hide archived in regular tabs
          if (statusTab !== 'all' && inv.status !== statusTab) return false;
        }

        // Event Type filter
        if (eventTypeFilter !== 'all' && inv.event_type !== eventTypeFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const customerName = customersMap[inv.customer_id]?.full_name || '';
          const titleMatch = inv.title.toLowerCase().includes(q);
          const slugMatch = inv.slug.toLowerCase().includes(q);
          const customerMatch = customerName.toLowerCase().includes(q);
          const celebrantMatch = Boolean(
            inv.content?.celebrant_names?.toLowerCase().includes(q)
          );
          if (!titleMatch && !slugMatch && !customerMatch && !celebrantMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'event_date') {
          const dateA = a.event_date || a.content?.date_iso || '';
          const dateB = b.event_date || b.content?.date_iso || '';
          return dateB.localeCompare(dateA);
        }
        return 0;
      });
  }, [invitations, customersMap, statusTab, eventTypeFilter, searchQuery, sortBy]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusTab, eventTypeFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvitations.length / ITEMS_PER_PAGE) || 1;
  const paginatedInvitations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvitations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvitations, currentPage]);

  // Status counts for badge tabs
  const tabCounts = useMemo(() => {
    const activeList = invitations.filter((i) => !i.deleted_at);
    return {
      all: activeList.length,
      draft: activeList.filter((i) => i.status === 'draft').length,
      active: activeList.filter((i) => i.status === 'active').length,
      paused: activeList.filter((i) => i.status === 'paused').length,
      expired: activeList.filter((i) => i.status === 'expired').length,
      archived: invitations.filter((i) => Boolean(i.deleted_at)).length,
    };
  }, [invitations]);

  return (
    <div className="space-y-6 text-right motion-fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
            الدعوات
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6668] mt-1">
            إدارة وإنشاء الدعوات الرقمية الفاخرة والتحكم بحالات النشر
          </p>
        </div>

        <Link to="/admin/invitations/new">
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            className="shadow-xs"
          >
            + إنشاء دعوة جديدة
          </Button>
        </Link>
      </div>

      {/* 2. Search, Status Tabs & Filters Bar */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="flex-1">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="البحث بعنوان الدعوة، اسم العميل، أصحاب المناسبة، أو الرابط (Slug)..."
            />
          </div>

          {/* Event Type Dropdown */}
          <div className="flex items-center gap-2">
            <div className="min-w-[140px]">
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-[#171316] focus:border-[#C9A45C] outline-none cursor-pointer"
              >
                <option value="all">جميع المناسبات</option>
                <option value="wedding">حفل زفاف</option>
                <option value="engagement">خطوبة</option>
                <option value="aqiqah">عقيقة</option>
                <option value="graduation">تخرج</option>
                <option value="birthday">عيد ميلاد</option>
                <option value="anniversary">ذكرى</option>
                <option value="family_event">مناسبة عائلية</option>
                <option value="private_event">مناسبة خاصة</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="min-w-[130px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-[#171316] focus:border-[#C9A45C] outline-none cursor-pointer"
              >
                <option value="newest">الأحدث إنشـاءً</option>
                <option value="oldest">الأقدم إنشـاءً</option>
                <option value="event_date">تاريخ المناسبة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F2ECE8] overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'الكل', count: tabCounts.all },
            { id: 'draft', label: 'مسودة (Draft)', count: tabCounts.draft },
            { id: 'active', label: 'نشطة (Active)', count: tabCounts.active },
            { id: 'paused', label: 'متوقفة (Paused)', count: tabCounts.paused },
            { id: 'expired', label: 'منتهية (Expired)', count: tabCounts.expired },
            { id: 'archived', label: 'الأرشيف', count: tabCounts.archived },
          ].map((tab) => {
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id as FilterStatusTab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#5A1020] text-[#FAF7F2] shadow-2xs'
                    : 'text-[#6F6668] hover:bg-[#FAF7F2] hover:text-[#171316]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFFFFF]/20 font-mono">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Invitations List / Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6F6668]">جاري تحميل سجلات الدعوات من قاعدة البيانات...</p>
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#E8DED8] bg-[#FFFFFF] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-[#C9A45C]" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#171316]">
            {searchQuery
              ? 'لا توجد دعوات مطابقة لبحثك'
              : statusTab === 'archived'
              ? 'لا توجد دعوات مؤرشفة'
              : 'لا توجد دعوات مسجلة في هذا القسم'}
          </h3>
          <p className="text-xs text-[#6F6668] max-w-sm mx-auto">
            {searchQuery
              ? 'تأكد من كتابة العنوان أو اسم العميل بدقة أو أعد ضبط الفلاتر.'
              : 'ابدأ بإنشاء أول دعوة رقمية فاخرة وربطها بالعميل المناسب.'}
          </p>
          {!searchQuery && statusTab !== 'archived' && (
            <Link to="/admin/invitations/new">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                + إنشاء دعوة جديدة
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedInvitations.map((inv) => {
              const customer = customersMap[inv.customer_id];
              const template = templatesMap[inv.template_id];
              const isArchived = Boolean(inv.deleted_at);
              const isActive = inv.status === 'active' && !isArchived;

              return (
                <div
                  key={inv.id}
                  className={`p-5 rounded-xl bg-[#FFFFFF] border transition-all duration-200 shadow-xs flex flex-col justify-between hover:shadow-md ${
                    isArchived
                      ? 'border-[#F7DBA7] bg-[#FFFDF9]'
                      : 'border-[#E8DED8] hover:border-[#C9A45C]/60'
                  }`}
                >
                  <div>
                    {/* Top Row: Event Type Icon & Status Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DED8] text-[#5A1020] font-medium">
                          {inv.event_type === 'wedding'
                            ? '💍 حفل زفاف'
                            : inv.event_type === 'engagement'
                            ? '✨ خطوبة'
                            : inv.event_type === 'aqiqah'
                            ? '👶 عقيقة'
                            : inv.event_type === 'graduation'
                            ? '🎓 تخرج'
                            : inv.event_type === 'birthday'
                            ? '🎂 عيد ميلاد'
                            : '💌 مناسبة خاصة'}
                        </span>
                      </div>

                      <StatusBadge status={inv.status} />
                    </div>

                    {/* Event Title & Slug */}
                    <h3 className="text-base font-serif font-bold text-[#171316] leading-snug line-clamp-1 mb-1">
                      {inv.title}
                    </h3>
                    <p dir="ltr" className="font-mono text-[11px] text-[#C9A45C] truncate mb-3">
                      /i/{inv.slug}
                    </p>

                    {/* Metadata Box */}
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] space-y-1.5 text-xs text-[#6F6668] mb-3">
                      {/* Customer */}
                      <p className="flex items-center justify-between">
                        <span className="text-[11px] text-[#9A8F92]">صاحب المناسبة:</span>
                        <strong className="text-[#171316] truncate max-w-[160px]">
                          {customer?.full_name || 'عميل غير مسجل'}
                        </strong>
                      </p>

                      {/* Date */}
                      <p className="flex items-center justify-between">
                        <span className="text-[11px] text-[#9A8F92]">تاريخ المناسبة:</span>
                        <span className="font-mono text-[#171316]">
                          {inv.event_date || inv.content?.date_iso || 'غير محدد'}
                        </span>
                      </p>

                      {/* Template */}
                      <p className="flex items-center justify-between">
                        <span className="text-[11px] text-[#9A8F92]">القالب:</span>
                        <span className="text-[#5A1020] font-medium truncate max-w-[160px]">
                          {template?.name_ar || template?.name || inv.template_id}
                        </span>
                      </p>
                    </div>

                    {/* RSVP Summary (Prompt 16 Requirement 26) */}
                    {(() => {
                      const rsvpStat = rsvpStatsByInv[inv.id] || {
                        confirmed: 0,
                        declined: 0,
                        pending: 0,
                        totalAttendees: 0,
                      };
                      return (
                        <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] mb-3 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-[#171316] flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-[#218739]" />
                              <span>تأكيدات الحضور (RSVP)</span>
                            </span>
                            <Link
                              to={`/admin/invitations/${inv.id}`}
                              className="text-[11px] text-[#5A1020] hover:text-[#C9A45C] font-bold flex items-center gap-0.5"
                            >
                              <span>إدارة الضيوف</span>
                              <ChevronRight className="w-3 h-3 rotate-180" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
                            <div className="p-1 rounded bg-[#EDF7EE] text-[#218739] border border-[#C5E8C9]">
                              <p className="font-bold">{rsvpStat.confirmed}</p>
                              <p className="text-[9px] text-[#218739]">مؤكد ({rsvpStat.totalAttendees})</p>
                            </div>
                            <div className="p-1 rounded bg-[#FEECEB] text-[#B42318] border border-[#FECDCA]">
                              <p className="font-bold">{rsvpStat.declined}</p>
                              <p className="text-[9px] text-[#B42318]">معتذر</p>
                            </div>
                            <div className="p-1 rounded bg-[#FEF6E7] text-[#B7791F] border border-[#F7DBA7]">
                              <p className="font-bold">{rsvpStat.pending}</p>
                              <p className="text-[9px] text-[#B7791F]">معلق</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Dates & Action Buttons */}
                  <div>
                    <div className="pt-2 border-t border-[#F2ECE8] flex items-center justify-between text-[10px] text-[#9A8F92] mb-3">
                      <span>أنشئت: {new Date(inv.created_at).toLocaleDateString('ar-MA')}</span>
                      <span>تحديث: {new Date(inv.updated_at).toLocaleDateString('ar-MA')}</span>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#E8DED8]">
                      <div className="flex items-center gap-1">
                        {/* Preview Modal Foundation */}
                        <button
                          onClick={() => setPreviewTarget(inv)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] hover:text-[#5A1020] hover:border-[#C9A45C] transition cursor-pointer"
                          title="معاينة أساس الدعوة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Guests link (Prompt 16 Requirement 14) */}
                        <Link to={`/admin/invitations/${inv.id}`}>
                          <button
                            className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#5A1020] hover:bg-[#F6ECF0] hover:border-[#C9A45C] transition cursor-pointer"
                            title="سجل ضيوف هذه الدعوة"
                          >
                            <UsersRound className="w-3.5 h-3.5" />
                          </button>
                        </Link>

                        {/* Public Link (View) */}
                        {isActive && (
                          <a
                            href={`/i/${inv.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#C9A45C] hover:text-[#5A1020] hover:border-[#C9A45C] transition cursor-pointer"
                            title="فتح الرابط العام للزوار"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Edit */}
                        <Link to={`/admin/invitations/${inv.id}/edit`}>
                          <button
                            className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#6F6668] hover:text-[#5A1020] hover:border-[#C9A45C] transition cursor-pointer"
                            title="تعديل الدعوة"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </Link>

                        {/* Duplicate */}
                        <button
                          onClick={() => setDuplicateTarget(inv)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#6F6668] hover:text-[#5A1020] hover:border-[#C9A45C] transition cursor-pointer"
                          title="نسخ الدعوة (Duplicate)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Pause / Activate */}
                        {!isArchived && (
                          <button
                            onClick={() => handleToggleStatus(inv)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              inv.status === 'active'
                                ? 'bg-[#FEF6E7] border-[#F7DBA7] text-[#B7791F] hover:bg-[#FEECEB]'
                                : 'bg-[#EDF7EE] border-[#BFE4C6] text-[#175E27] hover:bg-[#FAF7F2]'
                            }`}
                            title={inv.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل ونشر'}
                          >
                            {inv.status === 'active' ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Archive / Restore */}
                        <button
                          onClick={() => setArchiveTarget(inv)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isArchived
                              ? 'bg-[#EDF7EE] border-[#BFE4C6] text-[#175E27]'
                              : 'bg-[#FAF7F2] border-[#E8DED8] text-[#6F6668] hover:text-[#B42318] hover:border-[#B42318]/40'
                          }`}
                          title={isArchived ? 'استعادة من الأرشيف' : 'أرشفة الدعوة'}
                        >
                          {isArchived ? (
                            <RefreshCw className="w-3.5 h-3.5" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] flex items-center justify-between text-xs text-[#6F6668]">
              <span>
                عرض {paginatedInvitations.length} من أصل {filteredInvitations.length} دعوة
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-[#171316] disabled:opacity-40 hover:bg-[#FFFFFF] transition cursor-pointer"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2 font-mono">
                  <span>{currentPage}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-[#171316] disabled:opacity-40 hover:bg-[#FFFFFF] transition cursor-pointer"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Foundation Modal */}
      {previewTarget && (
        <InvitationPreviewModal
          isOpen={!!previewTarget}
          onClose={() => setPreviewTarget(null)}
          invitation={previewTarget}
          customerName={customersMap[previewTarget.customer_id]?.full_name}
          template={templatesMap[previewTarget.template_id]}
        />
      )}

      {/* Archive / Restore Confirmation */}
      {archiveTarget && (
        <ConfirmDialog
          isOpen={!!archiveTarget}
          onClose={() => setArchiveTarget(null)}
          onConfirm={handleArchiveConfirm}
          title={archiveTarget.deleted_at ? 'استعادة الدعوة' : 'أرشفة الدعوة'}
          message={
            archiveTarget.deleted_at
              ? `هل ترغب في استعادة الدعوة "${archiveTarget.title}" من الأرشيف كمسودة؟`
              : `هل أنت متأكد من أرشفة الدعوة "${archiveTarget.title}"؟ لن تظهر للزوار وستظل محفوظة في أرشيف الإدارة بأمان.`
          }
          confirmText={archiveTarget.deleted_at ? 'استعادة' : 'أرشفة'}
          cancelText="إلغاء"
          isDangerous={!archiveTarget.deleted_at}
          isLoading={isProcessingArchive}
        />
      )}

      {/* Duplicate Confirmation */}
      {duplicateTarget && (
        <ConfirmDialog
          isOpen={!!duplicateTarget}
          onClose={() => setDuplicateTarget(null)}
          onConfirm={handleDuplicateConfirm}
          title="نسخ الدعوة (Duplicate)"
          message={`هل ترغب في إنشاء نسخة مستقلة من "${duplicateTarget.title}" برابط فريد وحالة مسودة جديدة؟`}
          confirmText="نسخ الدعوة"
          cancelText="إلغاء"
          isDangerous={false}
          isLoading={isProcessingDuplicate}
        />
      )}
    </div>
  );
};
