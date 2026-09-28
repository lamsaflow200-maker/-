/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { db } from '../../db';
import { Guest, RsvpResponse, Invitation } from '../../types/database';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import {
  UsersRound,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import { isSamePhoneNumber } from '../../utils/phone';
import { InvitationQRCodeCard } from '../../components/admin/qr/InvitationQRCodeCard';

type RsvpFilterType = 'all' | 'confirmed' | 'declined' | 'pending';

interface GuestWithRsvp extends Guest {
  rsvp?: RsvpResponse;
  invitationTitle?: string;
  invitationSlug?: string;
}

export const AdminGuestsPage: React.FC = () => {
  const { id: paramInvitationId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryInvitationId = searchParams.get('invitation_id') || undefined;
  const activeInvitationId = paramInvitationId || queryInvitationId;

  const { success, error: toastError } = useToast();

  // Primary data states
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilterType>('all');
  const [selectedInvitationFilter, setSelectedInvitationFilter] = useState<string>(activeInvitationId || 'all');

  // Modals state
  const [viewGuest, setViewGuest] = useState<GuestWithRsvp | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    invitation_id: activeInvitationId || '',
    name: '',
    phone: '',
    email: '',
    notes: '',
    companion_count: 0,
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; invitation_id?: string }>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Synchronize invitation filter with active route or query params
  useEffect(() => {
    if (activeInvitationId) {
      setSelectedInvitationFilter(activeInvitationId);
    }
  }, [activeInvitationId]);

  // Load all data
  const loadData = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [allGuests, allRsvps, allInvs] = await Promise.all([
        db.guests.getAll(),
        db.rsvp.getAll(),
        db.invitations.getAll({ includeDeleted: false }),
      ]);

      setGuests(allGuests);
      setRsvps(allRsvps);
      setInvitations(allInvs);

      // Default the form invitation_id if not set yet
      if (!formData.invitation_id && allInvs.length > 0) {
        setFormData((prev) => ({
          ...prev,
          invitation_id: activeInvitationId || allInvs[0].id,
        }));
      }
    } catch (err) {
      console.error('Failed to load guests data:', err);
      toastError('فشل تحميل بيانات الضيوف وتأكيدات الحضور');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeInvitationId, formData.invitation_id, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map invitations for fast lookup
  const invitationsMap = useMemo(() => {
    const map = new Map<string, Invitation>();
    invitations.forEach((inv) => map.set(inv.id, inv));
    return map;
  }, [invitations]);

  // Find invitation info for active filter
  const currentFilteredInvitation = useMemo(() => {
    if (selectedInvitationFilter && selectedInvitationFilter !== 'all') {
      return invitationsMap.get(selectedInvitationFilter);
    }
    return null;
  }, [selectedInvitationFilter, invitationsMap]);

  // Merge guests with their RSVP records
  const mergedGuests: GuestWithRsvp[] = useMemo(() => {
    // Index RSVPs by guest_id and by (invitation_id + phone/name)
    const rsvpByGuestId = new Map<string, RsvpResponse>();
    const rsvpsByInvAndPhone = new Map<string, RsvpResponse>();
    const rsvpsByInvAndName = new Map<string, RsvpResponse>();

    rsvps.forEach((r) => {
      if (r.guest_id) {
        rsvpByGuestId.set(r.guest_id, r);
      }
      if (r.phone) {
        rsvpsByInvAndPhone.set(`${r.invitation_id}:${r.phone.trim()}`, r);
      }
      if (r.guest_name) {
        rsvpsByInvAndName.set(`${r.invitation_id}:${r.guest_name.trim().toLowerCase()}`, r);
      }
    });

    return guests.map((g) => {
      const inv = invitationsMap.get(g.invitation_id);
      let rsvp = rsvpByGuestId.get(g.id);

      if (!rsvp && g.phone) {
        rsvp = rsvpsByInvAndPhone.get(`${g.invitation_id}:${g.phone.trim()}`);
      }
      if (!rsvp && g.name) {
        rsvp = rsvpsByInvAndName.get(`${g.invitation_id}:${g.name.trim().toLowerCase()}`);
      }

      return {
        ...g,
        rsvp,
        invitationTitle: inv?.title || 'دعوة غير مسماة',
        invitationSlug: inv?.slug,
      };
    });
  }, [guests, rsvps, invitationsMap]);

  // Scope records to current invitation filter if selected
  const scopedGuests = useMemo(() => {
    if (selectedInvitationFilter && selectedInvitationFilter !== 'all') {
      return mergedGuests.filter((g) => g.invitation_id === selectedInvitationFilter);
    }
    return mergedGuests;
  }, [mergedGuests, selectedInvitationFilter]);

  const scopedRsvps = useMemo(() => {
    if (selectedInvitationFilter && selectedInvitationFilter !== 'all') {
      return rsvps.filter((r) => r.invitation_id === selectedInvitationFilter);
    }
    return rsvps;
  }, [rsvps, selectedInvitationFilter]);

  // Comprehensive Statistics Calculations (Prompt 16 Requirements 23 & 24)
  const stats = useMemo(() => {
    // 1. Confirmed responses count
    const confirmedResponses = scopedRsvps.filter(
      (r) => r.attendance === 'confirmed' || r.attendance_status === 'confirmed'
    ).length;

    // 2. Declined responses count
    const declinedResponses = scopedRsvps.filter(
      (r) => r.attendance === 'declined' || r.attendance_status === 'declined'
    ).length;

    // 3. Pending responses count
    const pendingResponses = scopedRsvps.filter(
      (r) => r.attendance === 'pending' || r.attendance_status === 'pending'
    ).length;

    // 4. Total Attendees = SUM(guests_count) for confirmed responses (Strict Requirement 23)
    const totalAttendees = scopedRsvps
      .filter((r) => r.attendance === 'confirmed' || r.attendance_status === 'confirmed')
      .reduce((sum, r) => sum + (r.guests_count || r.party_size || 1), 0);

    // 5. Total registered guests (records + companions)
    const totalRegisteredGuests = scopedGuests.reduce(
      (sum, g) => sum + 1 + (g.companion_count || 0),
      0
    );

    return {
      totalGuestsCount: scopedGuests.length,
      totalRegisteredGuests,
      confirmedResponses,
      declinedResponses,
      pendingResponses,
      totalAttendees,
    };
  }, [scopedGuests, scopedRsvps]);

  // Search & Filtered guests for table display (Prompt 16 Requirements 11, 12, 13)
  const filteredGuests = useMemo(() => {
    return scopedGuests.filter((g) => {
      // RSVP Status Filter
      if (rsvpFilter !== 'all') {
        const attendance = g.rsvp?.attendance || g.rsvp?.attendance_status;
        if (rsvpFilter === 'confirmed' && attendance !== 'confirmed') return false;
        if (rsvpFilter === 'declined' && attendance !== 'declined') return false;
        if (rsvpFilter === 'pending' && attendance !== 'pending' && attendance !== undefined) return false;
      }

      // Search Query (name, phone, email)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = g.name.toLowerCase().includes(query);
        const phoneMatch = g.phone ? g.phone.toLowerCase().includes(query) : false;
        const emailMatch = g.email ? g.email.toLowerCase().includes(query) : false;
        const notesMatch = g.notes ? g.notes.toLowerCase().includes(query) : false;

        return nameMatch || phoneMatch || emailMatch || notesMatch;
      }

      return true;
    });
  }, [scopedGuests, rsvpFilter, searchQuery]);

  // Duplicate Check logic for Add Guest (Prompt 16 Requirement 19)
  const checkDuplicateWarning = useCallback(
    (name: string, phone: string, email: string, invitationId: string, excludeId?: string) => {
      if (!invitationId || !name.trim()) {
        setDuplicateWarning(null);
        return;
      }

      const cleanName = name.trim().toLowerCase();
      const cleanPhone = phone.trim();
      const cleanEmail = email.trim().toLowerCase();

      const existing = guests.find((g) => {
        if (g.invitation_id !== invitationId) return false;
        if (excludeId && g.id === excludeId) return false;

        if (cleanName && g.name.trim().toLowerCase() === cleanName) return true;
        if (cleanPhone && g.phone && isSamePhoneNumber(g.phone, cleanPhone)) return true;
        if (cleanEmail && g.email && g.email.trim().toLowerCase() === cleanEmail) return true;
        return false;
      });

      if (existing) {
        setDuplicateWarning(
          `تنبيه: يوجد ضيف مسجل مسبقاً بنفس الاسم أو الهاتف في هذه المناسبة (${existing.name}). يمكنك المتابعة إن لم يكن الشخص نفسه.`
        );
      } else {
        setDuplicateWarning(null);
      }
    },
    [guests]
  );

  // Form input changes with live duplicate checking
  const handleFormChange = (
    field: 'name' | 'phone' | 'email' | 'notes' | 'invitation_id' | 'companion_count',
    value: any
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (field === 'name' && value.trim()) {
      setFormErrors((prev) => ({ ...prev, name: undefined }));
    }
    if (field === 'invitation_id' && value) {
      setFormErrors((prev) => ({ ...prev, invitation_id: undefined }));
    }

    // Check duplicate
    checkDuplicateWarning(
      updated.name,
      updated.phone,
      updated.email,
      updated.invitation_id,
      editingGuest?.id
    );
  };

  // Open Create Modal
  const handleOpenAddModal = () => {
    setEditingGuest(null);
    setFormData({
      invitation_id: activeInvitationId || (invitations[0]?.id ?? ''),
      name: '',
      phone: '',
      email: '',
      notes: '',
      companion_count: 0,
    });
    setFormErrors({});
    setDuplicateWarning(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      invitation_id: guest.invitation_id,
      name: guest.name,
      phone: guest.phone || '',
      email: guest.email || '',
      notes: guest.notes || '',
      companion_count: guest.companion_count || 0,
    });
    setFormErrors({});
    setDuplicateWarning(null);
    setIsAddModalOpen(true);
  };

  // Submit Add or Edit Guest
  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { name?: string; invitation_id?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'اسم الضيف مطلوب';
    }
    if (!formData.invitation_id) {
      errors.invitation_id = 'يرجى اختيار المناسبة المرتبطة';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmittingForm(true);
    try {
      if (editingGuest) {
        // Edit flow (Prompt 16 Requirement 17)
        await db.guests.update(editingGuest.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          companion_count: Math.max(0, formData.companion_count || 0),
        });
        success('تم تعديل بيانات الضيف بنجاح');
      } else {
        // Creation flow (Prompt 16 Requirement 16)
        await db.guests.create({
          invitation_id: formData.invitation_id,
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          companion_count: Math.max(0, formData.companion_count || 0),
        });
        success('تمت إضافة الضيف بنجاح إلى سجل المناسبة');
      }

      setIsAddModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      console.error('Failed to save guest:', err);
      toastError(err?.message || 'فشل حفظ بيانات الضيف');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Safe Guest Delete (Prompt 16 Requirement 18)
  const handleDeleteConfirm = async () => {
    if (!deletingGuest) return;
    setIsDeleting(true);
    try {
      await db.guests.delete(deletingGuest.id);
      success('تم حذف الضيف وفك ارتباط الردود بأمان');
      setDeletingGuest(null);
      await loadData(true);
    } catch (err: any) {
      console.error('Failed to delete guest:', err);
      toastError('فشل حذف الضيف');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV with UTF-8 BOM for Arabic Excel Support (Prompt 16 Requirement 38)
  const handleExportCsv = () => {
    if (filteredGuests.length === 0) {
      toastError('لا يوجد ضيوف لتصديرهم في هذا الفلتر');
      return;
    }

    try {
      const headers = [
        'اسم الضيف',
        'رقم الهاتف',
        'البريد الإلكتروني',
        'المناسبة',
        'حالة الرد (RSVP)',
        'عدد الحاضرين المؤكدين',
        'المرافقين المضافين',
        'الملاحظات',
        'رسالة الضيف',
        'تاريخ التسجيل',
      ];

      const rows = filteredGuests.map((g) => {
        const attendance = g.rsvp
          ? g.rsvp.attendance === 'confirmed' || g.rsvp.attendance_status === 'confirmed'
            ? 'مؤكد الحضور'
            : g.rsvp.attendance === 'declined' || g.rsvp.attendance_status === 'declined'
            ? 'معتذر'
            : 'في الانتظار'
          : 'لم يستجب بعد';

        const attendeesCount =
          g.rsvp?.attendance === 'confirmed' || g.rsvp?.attendance_status === 'confirmed'
            ? g.rsvp.guests_count || g.rsvp.party_size || 1
            : 0;

        return [
          `"${g.name.replace(/"/g, '""')}"`,
          `"${(g.phone || '').replace(/"/g, '""')}"`,
          `"${(g.email || '').replace(/"/g, '""')}"`,
          `"${(g.invitationTitle || '').replace(/"/g, '""')}"`,
          `"${attendance}"`,
          attendeesCount,
          g.companion_count || 0,
          `"${(g.notes || '').replace(/"/g, '""')}"`,
          `"${(g.rsvp?.message || g.rsvp?.notes_or_wishes || '').replace(/"/g, '""')}"`,
          `"${new Date(g.created_at).toLocaleDateString('ar-MA')}"`,
        ].join(',');
      });

      // UTF-8 BOM for proper Arabic display in MS Excel
      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const fileName = currentFilteredInvitation
        ? `guests_${currentFilteredInvitation.slug}_${new Date().toISOString().slice(0, 10)}.csv`
        : `mnasbati_guests_${new Date().toISOString().slice(0, 10)}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success('تم تصدير ملف الضيوف بنجاح');
    } catch (err) {
      console.error('Export error:', err);
      toastError('فشل تصدير قائمة الضيوف');
    }
  };

  return (
    <div className="space-y-6 text-right motion-fade-in" dir="rtl">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DED8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
              سجل الضيوف وتأكيدات الحضور (RSVP)
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#9F7C36] border border-[#E8D8B6]">
              إدارة شاملة
            </span>
          </div>
          <p className="text-xs text-[#6F6668]">
            إدارة قوائم المدعوين، متابعة تأكيدات واعتذارات الحضور، وحساب عدد المقاعد بدقة تامة
          </p>

          {/* Invitation-Specific Banner if filtered by route/param (Prompt 16 Requirement 14) */}
          {currentFilteredInvitation && (
            <div className="mt-2.5 inline-flex items-center gap-2 p-1.5 px-3 rounded-lg bg-[#FAF7F2] border border-[#C9A45C]/40 text-xs text-[#5A1020]">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>أنت تستعرض ضيوف دعوة: <strong>{currentFilteredInvitation.title}</strong></span>
              {paramInvitationId ? (
                <Link
                  to="/admin/guests"
                  className="mr-2 text-[11px] text-[#C9A45C] hover:underline flex items-center gap-0.5"
                >
                  <span>عرض جميع الدعوات</span>
                  <ChevronRight className="w-3 h-3 rotate-180" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedInvitationFilter('all')}
                  className="mr-2 text-[11px] text-[#C9A45C] hover:underline cursor-pointer"
                >
                  إلغاء التخصيص
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isLoading || isRefreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C9A45C]' : ''}`} />}
            title="تحديث البيانات"
          >
            تحديث
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredGuests.length === 0}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            تصدير إلى Excel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
          >
            إضافة ضيف جديد
          </Button>
        </div>
      </div>

      {/* Admin QR Code Section (Prompt 18 Requirement 7) */}
      {currentFilteredInvitation && (
        <InvitationQRCodeCard
          invitationId={currentFilteredInvitation.id}
          slug={currentFilteredInvitation.slug}
          title={currentFilteredInvitation.title}
          isDraft={currentFilteredInvitation.status === 'draft'}
        />
      )}

      {/* 2. Real Database Statistics Cards (Prompt 16 Requirements 23 & 24) */}
      <section aria-label="إحصائيات الضيوف وتأكيدات الحضور">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Confirmed Attendees (SUM of guests_count - Requirement 23) */}
          <Card className="flex flex-col justify-between border-[#218739]/40 bg-[#F6FCF7]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#18642A]">مجموع الحاضرين المؤكدين</span>
              <div className="p-1.5 rounded-lg bg-[#E2F5E5] text-[#218739]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#18642A] font-mono tabular-nums">
                {stats.totalAttendees}
              </span>
              <p className="text-[11px] text-[#218739] mt-0.5">
                شخص مؤكد حضورهم
              </p>
            </div>
          </Card>

          {/* Card 2: Confirmed Responses Count */}
          <Card className="flex flex-col justify-between hover:border-[#218739]/50 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#6F6668]">الردود المؤكدة</span>
              <div className="p-1.5 rounded-lg bg-[#EDF7EE] text-[#218739]">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#218739] font-mono tabular-nums">
                {stats.confirmedResponses}
              </span>
              <p className="text-[11px] text-[#6F6668] mt-0.5">
                تأكيد حضور (ردود)
              </p>
            </div>
          </Card>

          {/* Card 3: Declined Responses Count */}
          <Card className="flex flex-col justify-between hover:border-[#B42318]/50 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#6F6668]">المعتذرون عن الحضور</span>
              <div className="p-1.5 rounded-lg bg-[#FEECEB] text-[#B42318]">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#B42318] font-mono tabular-nums">
                {stats.declinedResponses}
              </span>
              <p className="text-[11px] text-[#6F6668] mt-0.5">
                اعتذار عن الحضور
              </p>
            </div>
          </Card>

          {/* Card 4: Pending / No Response */}
          <Card className="flex flex-col justify-between hover:border-[#B7791F]/50 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#6F6668]">في الانتظار / لم يستجيبوا</span>
              <div className="p-1.5 rounded-lg bg-[#FEF6E7] text-[#B7791F]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#B7791F] font-mono tabular-nums">
                {stats.pendingResponses}
              </span>
              <p className="text-[11px] text-[#6F6668] mt-0.5">
                ردود معلقة
              </p>
            </div>
          </Card>

          {/* Card 5: Total Guests in Registry */}
          <Card className="flex flex-col justify-between hover:border-[#C9A45C]/50 transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#6F6668]">إجمالي السجلات</span>
              <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#5A1020] border border-[#E8DED8]">
                <UsersRound className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#171316] font-mono tabular-nums">
                {stats.totalGuestsCount}
              </span>
              <p className="text-[11px] text-[#6F6668] mt-0.5">
                {stats.totalRegisteredGuests} فرد مع المرافقين
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Search and Filters Toolbar (Prompt 16 Requirements 12 & 13) */}
      <Card className="p-4 bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Fast Search input (Name, phone, email) */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، رقم الهاتف، أو البريد الإلكتروني..."
              className="w-full text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] focus:bg-[#FFFFFF] outline-none focus:border-[#C9A45C] transition"
            />
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-[#9A8F92] pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-xs text-[#9A8F92] hover:text-[#171316] cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Invitation (Prompt 16 Requirement 13 & 14) */}
            {!paramInvitationId && (
              <div className="relative min-w-[180px]">
                <select
                  value={selectedInvitationFilter}
                  onChange={(e) => {
                    setSelectedInvitationFilter(e.target.value);
                    if (e.target.value === 'all') {
                      searchParams.delete('invitation_id');
                    } else {
                      searchParams.set('invitation_id', e.target.value);
                    }
                    setSearchParams(searchParams);
                  }}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#E8DED8] bg-[#FFFFFF] outline-none focus:border-[#C9A45C] text-[#171316] font-medium"
                >
                  <option value="all">كل المناسبات ({invitations.length})</option>
                  {invitations.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by RSVP Status Tabs (Prompt 16 Requirement 13) */}
            <div className="flex items-center rounded-xl bg-[#FAF7F2] p-1 border border-[#E8DED8] text-xs">
              <button
                type="button"
                onClick={() => setRsvpFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                  rsvpFilter === 'all'
                    ? 'bg-[#FFFFFF] text-[#5A1020] shadow-xs font-bold'
                    : 'text-[#6F6668] hover:text-[#171316]'
                }`}
              >
                الكل ({scopedGuests.length})
              </button>

              <button
                type="button"
                onClick={() => setRsvpFilter('confirmed')}
                className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer flex items-center gap-1 ${
                  rsvpFilter === 'confirmed'
                    ? 'bg-[#218739] text-white shadow-xs font-bold'
                    : 'text-[#218739] hover:bg-[#EDF7EE]'
                }`}
              >
                <span>مؤكد</span>
                <span className="font-mono text-[10px]">({stats.confirmedResponses})</span>
              </button>

              <button
                type="button"
                onClick={() => setRsvpFilter('declined')}
                className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer flex items-center gap-1 ${
                  rsvpFilter === 'declined'
                    ? 'bg-[#B42318] text-white shadow-xs font-bold'
                    : 'text-[#B42318] hover:bg-[#FEECEB]'
                }`}
              >
                <span>معتذر</span>
                <span className="font-mono text-[10px]">({stats.declinedResponses})</span>
              </button>

              <button
                type="button"
                onClick={() => setRsvpFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer flex items-center gap-1 ${
                  rsvpFilter === 'pending'
                    ? 'bg-[#B7791F] text-white shadow-xs font-bold'
                    : 'text-[#B7791F] hover:bg-[#FEF6E7]'
                }`}
              >
                <span>معلق</span>
                <span className="font-mono text-[10px]">({stats.pendingResponses})</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Guest Table / Responsive Cards (Prompt 16 Requirements 11, 33, 34, 35, 36) */}
      <Card>
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#6F6668]">جاري تحميل سجلات الضيوف من قاعدة البيانات...</p>
          </div>
        ) : filteredGuests.length === 0 ? (
          /* Empty State (Prompt 16 Requirement 35) */
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-center text-[#5A1020] mx-auto shadow-xs">
              <UsersRound className="w-6 h-6 text-[#C9A45C]" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#171316]">
              {searchQuery || rsvpFilter !== 'all'
                ? 'لا توجد نتائج مطابقة'
                : 'لا يوجد ضيوف بعد'}
            </h3>
            <p className="text-xs text-[#6F6668] max-w-sm mx-auto">
              {searchQuery || rsvpFilter !== 'all'
                ? 'تأكد من كتابة الاسم أو رقم الهاتف بدقة أو قم بإعادة ضبط الفلاتر.'
                : 'لم يتم تسجيل أي ضيوف لهذه المناسبة بعد. يمكنك إضافة ضيف يدوياً أو تفعيل خيار RSVP بالدعوة.'}
            </p>
            {(!searchQuery && rsvpFilter === 'all') && (
              <Button variant="primary" size="sm" onClick={handleOpenAddModal} icon={<Plus className="w-4 h-4" />}>
                إضافة أول ضيف
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#E8DED8] bg-[#FAF7F2]/60 text-[#6F6668] font-medium">
                    <th className="py-3 px-4">الضيف</th>
                    <th className="py-3 px-4">الهاتف</th>
                    <th className="py-3 px-4">المناسبة</th>
                    <th className="py-3 px-4">حالة الحضور (RSVP)</th>
                    <th className="py-3 px-4 text-center">المقاعد / الأفراد</th>
                    <th className="py-3 px-4">تاريخ الإضافة</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DED8]">
                  {filteredGuests.map((guest) => {
                    const rsvp = guest.rsvp;
                    const attendance = rsvp?.attendance || rsvp?.attendance_status;
                    const isConfirmed = attendance === 'confirmed';
                    const isDeclined = attendance === 'declined';
                    const isPending = attendance === 'pending';
                    const guestsCount = isConfirmed
                      ? rsvp?.guests_count || rsvp?.party_size || 1
                      : 0;

                    return (
                      <tr
                        key={guest.id}
                        className="hover:bg-[#FAF7F2]/40 transition-colors group"
                      >
                        {/* 1. Guest info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#5A1020] border border-[#E8DED8] flex items-center justify-center font-bold text-xs shrink-0">
                              {guest.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#171316] text-sm">
                                {guest.name}
                              </p>
                              {guest.email && (
                                <p className="text-[11px] text-[#9A8F92] flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-[#9A8F92]" />
                                  <span dir="ltr">{guest.email}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Phone */}
                        <td className="py-3.5 px-4 font-mono text-xs text-[#171316]">
                          {guest.phone ? (
                            <a
                              href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#218739] hover:underline flex items-center gap-1.5"
                              dir="ltr"
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{guest.phone}</span>
                            </a>
                          ) : (
                            <span className="text-[#9A8F92]">—</span>
                          )}
                        </td>

                        {/* 3. Invitation */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-[#5A1020] font-medium line-clamp-1 max-w-[160px]">
                            {guest.invitationTitle}
                          </span>
                        </td>

                        {/* 4. RSVP Badge (Prompt 16 Requirement 34) */}
                        <td className="py-3.5 px-4">
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF7EE] text-[#218739] border border-[#C5E8C9]">
                              <UserCheck className="w-3 h-3" />
                              <span>مؤكد</span>
                            </span>
                          ) : isDeclined ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEECEB] text-[#B42318] border border-[#FECDCA]">
                              <UserX className="w-3 h-3" />
                              <span>معتذر</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF6E7] text-[#B7791F] border border-[#F7DBA7]">
                              <Clock className="w-3 h-3" />
                              <span>في الانتظار</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF7F2] text-[#6F6668] border border-[#E8DED8]">
                              <span>لم يستجب</span>
                            </span>
                          )}
                        </td>

                        {/* 5. Attendees Count (Prompt 16 Requirement 23) */}
                        <td className="py-3.5 px-4 text-center font-mono">
                          {isConfirmed ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E2F5E5] text-[#18642A]">
                              {guestsCount} أشخاص
                            </span>
                          ) : (
                            <span className="text-[#9A8F92] text-xs">
                              {guest.companion_count > 0 ? `+${guest.companion_count} مرافق` : '0'}
                            </span>
                          )}
                        </td>

                        {/* 6. Date */}
                        <td className="py-3.5 px-4 text-[11px] text-[#9A8F92] font-mono">
                          {new Date(guest.created_at).toLocaleDateString('ar-MA')}
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewGuest(guest)}
                              className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] hover:bg-[#FFFFFF] text-[#171316] hover:text-[#5A1020] transition cursor-pointer"
                              title="عرض تفاصيل الضيف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(guest)}
                              className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] hover:bg-[#FFFFFF] text-[#171316] hover:text-[#C9A45C] transition cursor-pointer"
                              title="تعديل بيانات الضيف"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingGuest(guest)}
                              className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] hover:bg-[#FEECEB] text-[#B42318] transition cursor-pointer"
                              title="حذف الضيف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View (Prompt 16 Requirement 33) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredGuests.map((guest) => {
                const rsvp = guest.rsvp;
                const attendance = rsvp?.attendance || rsvp?.attendance_status;
                const isConfirmed = attendance === 'confirmed';
                const isDeclined = attendance === 'declined';
                const isPending = attendance === 'pending';
                const guestsCount = isConfirmed
                  ? rsvp?.guests_count || rsvp?.party_size || 1
                  : 0;

                return (
                  <div
                    key={guest.id}
                    className="p-4 rounded-xl border border-[#E8DED8] bg-[#FFFFFF] shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#5A1020] border border-[#E8DED8] flex items-center justify-center font-bold text-xs shrink-0">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#171316] text-sm leading-snug">
                            {guest.name}
                          </h4>
                          <span className="text-[11px] text-[#5A1020] font-medium">
                            {guest.invitationTitle}
                          </span>
                        </div>
                      </div>

                      {/* RSVP Badge */}
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF7EE] text-[#218739] border border-[#C5E8C9]">
                          <UserCheck className="w-3 h-3" />
                          <span>مؤكد</span>
                        </span>
                      ) : isDeclined ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEECEB] text-[#B42318] border border-[#FECDCA]">
                          <UserX className="w-3 h-3" />
                          <span>معتذر</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF6E7] text-[#B7791F] border border-[#F7DBA7]">
                          <Clock className="w-3 h-3" />
                          <span>معلق</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF7F2] text-[#6F6668] border border-[#E8DED8]">
                          لم يستجب
                        </span>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-xs space-y-1 text-[#6F6668]">
                      {guest.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#9A8F92]">الهاتف:</span>
                          <span dir="ltr" className="font-mono text-[#171316]">
                            {guest.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[#9A8F92]">المقاعد المؤكدة:</span>
                        <span className="font-bold text-[#18642A] font-mono">
                          {isConfirmed ? `${guestsCount} أشخاص` : '0'}
                        </span>
                      </div>
                      {rsvp?.message && (
                        <div className="pt-1 border-t border-[#E8DED8]/60 text-[11px] text-[#5A1020]">
                          "{rsvp.message}"
                        </div>
                      )}
                    </div>

                    {/* Mobile Card Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F2ECE8]">
                      <span className="text-[10px] text-[#9A8F92] font-mono">
                        {new Date(guest.created_at).toLocaleDateString('ar-MA')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewGuest(guest)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          عرض
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEditModal(guest)}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          تعديل
                        </Button>
                        <button
                          type="button"
                          onClick={() => setDeletingGuest(guest)}
                          className="p-1.5 rounded-lg text-[#B42318] hover:bg-[#FEECEB] transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* 5. GUEST DETAIL MODAL (Prompt 16 Requirement 15) */}
      <Modal
        isOpen={Boolean(viewGuest)}
        onClose={() => setViewGuest(null)}
        title="بطاقة تفاصيل الضيف"
        maxWidth="md"
      >
        {viewGuest && (
          <div className="space-y-4 text-right" dir="rtl">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED8]">
              <div className="w-12 h-12 rounded-full bg-[#5A1020] text-white flex items-center justify-center font-bold text-lg shrink-0">
                {viewGuest.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-serif font-bold text-[#171316]">
                  {viewGuest.name}
                </h3>
                <p className="text-xs text-[#5A1020] font-medium">
                  {viewGuest.invitationTitle}
                </p>
              </div>
              <div>
                {viewGuest.rsvp?.attendance === 'confirmed' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF7EE] text-[#218739] border border-[#C5E8C9]">
                    مؤكد الحضور
                  </span>
                ) : viewGuest.rsvp?.attendance === 'declined' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEECEB] text-[#B42318] border border-[#FECDCA]">
                    معتذر
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FAF7F2] text-[#6F6668] border border-[#E8DED8]">
                    في الانتظار
                  </span>
                )}
              </div>
            </div>

            {/* Comprehensive details table */}
            <div className="divide-y divide-[#E8DED8] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6F6668] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>رقم الهاتف:</span>
                </span>
                <span dir="ltr" className="font-mono font-medium text-[#171316]">
                  {viewGuest.phone || 'غير مسجل'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6F6668] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>البريد الإلكتروني:</span>
                </span>
                <span dir="ltr" className="font-mono text-[#171316]">
                  {viewGuest.email || 'غير مسجل'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6F6668] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>عدد الأفراد المؤكدين:</span>
                </span>
                <span className="font-mono font-bold text-sm text-[#18642A]">
                  {viewGuest.rsvp?.attendance === 'confirmed'
                    ? `${viewGuest.rsvp?.guests_count || viewGuest.rsvp?.party_size || 1} أشخاص`
                    : '0 (غير مؤكد)'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6F6668] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>تاريخ إضافة السجل:</span>
                </span>
                <span className="font-mono text-[#171316]">
                  {new Date(viewGuest.created_at).toLocaleString('ar-MA')}
                </span>
              </div>

              {viewGuest.rsvp?.updated_at && (
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#6F6668] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>تاريخ تسجيل الرد (RSVP):</span>
                  </span>
                  <span className="font-mono text-[#171316]">
                    {new Date(viewGuest.rsvp.updated_at).toLocaleString('ar-MA')}
                  </span>
                </div>
              )}
            </div>

            {/* Notes if any */}
            {viewGuest.notes && (
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED8]">
                <h4 className="text-xs font-bold text-[#171316] mb-1">ملاحظات المنظم الخاصة:</h4>
                <p className="text-xs text-[#6F6668] leading-relaxed">{viewGuest.notes}</p>
              </div>
            )}

            {/* Wishes or message left by the guest */}
            {(viewGuest.rsvp?.message || viewGuest.rsvp?.notes_or_wishes) && (
              <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#E8D8B6]">
                <h4 className="text-xs font-bold text-[#9F7C36] mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>رسالة أو كلمة الضيف:</span>
                </h4>
                <p className="text-xs text-[#171316] leading-relaxed">
                  "{viewGuest.rsvp?.message || viewGuest.rsvp?.notes_or_wishes}"
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-[#E8DED8] flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setViewGuest(null)}>
                إغلاق
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const g = viewGuest;
                  setViewGuest(null);
                  handleOpenEditModal(g);
                }}
                icon={<Edit2 className="w-3.5 h-3.5" />}
              >
                تعديل البيانات
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. GUEST CREATION / EDIT MODAL (Prompt 16 Requirements 16, 17, 19) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingGuest ? 'تعديل بيانات الضيف' : 'إضافة ضيف جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveGuest} className="space-y-4 text-right" dir="rtl">
          {/* Associated Invitation Select */}
          <div>
            <label className="block text-xs font-bold text-[#171316] mb-1">
              المناسبة المرتبطة <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.invitation_id}
              onChange={(e) => handleFormChange('invitation_id', e.target.value)}
              disabled={Boolean(editingGuest)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8DED8] bg-[#FFFFFF] outline-none focus:border-[#C9A45C] disabled:bg-[#FAF7F2]"
            >
              {invitations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title} ({inv.event_type})
                </option>
              ))}
            </select>
            {formErrors.invitation_id && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.invitation_id}</p>
            )}
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-[#171316] mb-1">
              اسم الضيف الكريم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="مثال: سعادة الأستاذ محمد بنسعيد"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#E8DED8] outline-none focus:border-[#C9A45C]"
              autoFocus
            />
            {formErrors.name && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Duplicate Warning Indicator (Prompt 16 Requirement 19) */}
          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-[#FEF6E7] border border-[#F7DBA7] text-xs text-[#B7791F] flex items-start gap-2 motion-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B7791F] mt-0.5" />
              <p className="leading-relaxed">{duplicateWarning}</p>
            </div>
          )}

          {/* Phone Input */}
          <div>
            <label className="block text-xs font-bold text-[#171316] mb-1">
              رقم الهاتف أو الواتساب <span className="text-[11px] text-[#9A8F92] font-normal">(اختياري)</span>
            </label>
            <input
              type="tel"
              dir="ltr"
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              placeholder="06XXXXXXXX"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#E8DED8] outline-none focus:border-[#C9A45C] font-mono"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-[#171316] mb-1">
              البريد الإلكتروني <span className="text-[11px] text-[#9A8F92] font-normal">(اختياري)</span>
            </label>
            <input
              type="email"
              dir="ltr"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="guest@example.com"
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#E8DED8] outline-none focus:border-[#C9A45C] font-mono"
            />
          </div>

          {/* Companion Count */}
          <div>
            <label className="block text-xs font-bold text-[#171316] mb-1">
              عدد المرافقين المسموح بهم <span className="text-[11px] text-[#9A8F92] font-normal">(اختياري)</span>
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={formData.companion_count}
              onChange={(e) => handleFormChange('companion_count', parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#E8DED8] outline-none focus:border-[#C9A45C] font-mono"
            />
            <p className="text-[10px] text-[#9A8F92] mt-1">
              عدد المرافقين المتوقع مرافقتهم للضيف (0 = الضيف بمفرده)
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#171316] mb-1">
              ملاحظات خاصة <span className="text-[11px] text-[#9A8F92] font-normal">(اختياري)</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              placeholder="مثال: طاولة رقم 5، مقعد كبار الشخصيات VIP..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8DED8] outline-none focus:border-[#C9A45C] resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#E8DED8] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmittingForm}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmittingForm}
            >
              {editingGuest ? 'حفظ التعديلات' : 'إضافة الضيف'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. SAFE GUEST DELETE CONFIRMATION (Prompt 16 Requirement 18) */}
      <ConfirmDialog
        isOpen={Boolean(deletingGuest)}
        onClose={() => setDeletingGuest(null)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف الضيف"
        message={`هل أنت متأكد من حذف الضيف "${deletingGuest?.name}"؟ سيتم فك ارتباط أي ردود RSVP مسجلة بأمان دون فقدان إحصائيات الحضور.`}
        confirmText="نعم، حذف الضيف"
        cancelText="إلغاء"
        isDangerous
        isLoading={isDeleting}
      />
    </div>
  );
};
