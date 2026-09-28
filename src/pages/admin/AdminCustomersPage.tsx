/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Customer, Invitation } from '../../types/database';
import { db } from '../../db';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Search } from '../../components/ui/Search';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Drawer } from '../../components/ui/Drawer';
import { CustomerFormModal } from '../../components/admin/CustomerFormModal';
import { CustomerNotesSection } from '../../components/admin/CustomerNotesSection';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Archive,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Filter,
  CheckCircle2,
  Copy,
  ChevronLeft,
  X,
  Clock,
  Layers,
} from 'lucide-react';

type FilterTab = 'all' | 'with_invitations' | 'without_invitations' | 'archived';

export const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'invitations'>('newest');

  // Modal / Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerDrawer, setCustomerDrawer] = useState<Customer | null>(null);

  // Delete & Archive State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Phone Copy State
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [custList, invList] = await Promise.all([
        db.customers.getAll(true), // load all including archived for tab navigation
        db.invitations.getAll({ includeDeleted: false }),
      ]);
      setCustomers(custList);
      setInvitations(invList);
    } catch {
      toastError('فشل تحميل قائمة الزبناء');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyPhone = (e: React.MouseEvent, cust: Customer) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cust.phone);
    setCopiedPhoneId(cust.id);
    success('تم نسخ رقم الهاتف');
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Safe Archive or Restore
  const handleArchiveConfirm = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      if (customerToDelete.deleted_at) {
        // Restore
        await db.customers.restore(customerToDelete.id);
        success('تمت استعادة الزبون بنجاح');
      } else {
        // Soft delete / archive
        await db.customers.delete(customerToDelete.id, false);
        success('تمت أرشفة الزبون بنجاح');
      }
      setCustomerToDelete(null);
      await loadData();
    } catch {
      toastError('فشل تحديث حالة الزبون');
    } finally {
      setIsDeleting(false);
    }
  };

  // Distinct cities from active customers
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.city && c.city.trim()) {
        set.add(c.city.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [customers]);

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((cust) => {
        // Tab filtering
        const isArchived = Boolean(cust.deleted_at);
        const custInvs = invitations.filter((inv) => inv.customer_id === cust.id);

        if (activeTab === 'archived') {
          if (!isArchived) return false;
        } else {
          if (isArchived) return false; // Hide archived in normal tabs
          if (activeTab === 'with_invitations' && custInvs.length === 0) return false;
          if (activeTab === 'without_invitations' && custInvs.length > 0) return false;
        }

        // City filtering
        if (selectedCity !== 'all') {
          if (cust.city !== selectedCity) return false;
        }

        // Database search (name, phone, email)
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const nameMatch = cust.full_name.toLowerCase().includes(query);
          const phoneMatch = cust.phone.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
          const emailMatch = Boolean(cust.email && cust.email.toLowerCase().includes(query));
          const cityMatch = Boolean(cust.city && cust.city.toLowerCase().includes(query));
          if (!nameMatch && !phoneMatch && !emailMatch && !cityMatch) {
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
        if (sortBy === 'name') {
          return a.full_name.localeCompare(b.full_name, 'ar');
        }
        if (sortBy === 'invitations') {
          const countA = invitations.filter((inv) => inv.customer_id === a.id).length;
          const countB = invitations.filter((inv) => inv.customer_id === b.id).length;
          return countB - countA;
        }
        return 0;
      });
  }, [customers, invitations, activeTab, selectedCity, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const active = customers.filter((c) => !c.deleted_at);
    const withInvs = active.filter((c) =>
      invitations.some((inv) => inv.customer_id === c.id)
    ).length;
    const withoutInvs = active.length - withInvs;
    const archivedCount = customers.filter((c) => Boolean(c.deleted_at)).length;

    return {
      total: active.length,
      withInvs,
      withoutInvs,
      archivedCount,
      citiesCount: availableCities.length,
    };
  }, [customers, invitations, availableCities]);

  return (
    <div className="space-y-6 text-right motion-fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
            الزبناء
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6668] mt-1">
            إدارة معلومات الزبناء والدعوات الخاصة بهم
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setCustomerToEdit(null);
            setIsCreateModalOpen(true);
          }}
          className="shadow-xs"
        >
          + إضافة زبون
        </Button>
      </div>

      {/* 2. Overview Quick Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6F6668]">إجمالي الزبناء النشطين</span>
            <Users className="w-4 h-4 text-[#C9A45C]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#171316] mt-2 font-mono">
            {stats.total}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6F6668]">زبناء لديهم دعوات</span>
            <Sparkles className="w-4 h-4 text-[#5A1020]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#5A1020] mt-2 font-mono">
            {stats.withInvs}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6F6668]">بدون دعوات حالياً</span>
            <Layers className="w-4 h-4 text-[#9A8F92]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#171316] mt-2 font-mono">
            {stats.withoutInvs}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6F6668]">المدن المسجلة</span>
            <MapPin className="w-4 h-4 text-[#C9A45C]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#171316] mt-2 font-mono">
            {stats.citiesCount}
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Real Database Search Input */}
          <div className="flex-1">
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="البحث بالاسم، رقم الهاتف، البريد الإلكتروني، أو المدينة..."
            />
          </div>

          {/* City Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[150px]">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-[#171316] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]/30 outline-none cursor-pointer"
              >
                <option value="all">جميع المدن</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs py-2.5 px-3 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-[#171316] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]/30 outline-none cursor-pointer"
              >
                <option value="newest">الأحدث تسجيلاً</option>
                <option value="oldest">الأقدم تسجيلاً</option>
                <option value="name">الاسم (أ - ي)</option>
                <option value="invitations">الأكثر دعوات</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F2ECE8] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#5A1020] text-[#FAF7F2] shadow-2xs'
                : 'text-[#6F6668] hover:bg-[#FAF7F2] hover:text-[#171316]'
            }`}
          >
            <span>جميع الزبناء</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFFFFF]/20 font-mono">
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('with_invitations')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'with_invitations'
                ? 'bg-[#5A1020] text-[#FAF7F2] shadow-2xs'
                : 'text-[#6F6668] hover:bg-[#FAF7F2] hover:text-[#171316]'
            }`}
          >
            <span>لديهم دعوات</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFFFFF]/20 font-mono">
              {stats.withInvs}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('without_invitations')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'without_invitations'
                ? 'bg-[#5A1020] text-[#FAF7F2] shadow-2xs'
                : 'text-[#6F6668] hover:bg-[#FAF7F2] hover:text-[#171316]'
            }`}
          >
            <span>بدون دعوات</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFFFFF]/20 font-mono">
              {stats.withoutInvs}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap mr-auto ${
              activeTab === 'archived'
                ? 'bg-[#B7791F] text-[#FAF7F2] shadow-2xs'
                : 'text-[#6F6668] hover:bg-[#FAF7F2] hover:text-[#171316]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>الأرشيف</span>
            {stats.archivedCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFFFFF]/20 font-mono">
                {stats.archivedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4. Customer List / Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6F6668]">جاري تحميل سجلات الزبناء من قاعدة البيانات...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#E8DED8] bg-[#FFFFFF] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-[#C9A45C]" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#171316]">
            {searchQuery
              ? 'لا توجد نتائج مطابقة لبحثك'
              : activeTab === 'archived'
              ? 'سجل الأرشيف فارغ'
              : 'لا يوجد زبناء مسجلين في هذا القسم'}
          </h3>
          <p className="text-xs text-[#6F6668] max-w-sm mx-auto">
            {searchQuery
              ? 'تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح، أو أعد ضبط الفلاتر.'
              : 'ابدأ بإضافة أول زبون لإدارة معلوماته وربط الدعوات الفاخرة به.'}
          </p>
          {!searchQuery && activeTab !== 'archived' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setCustomerToEdit(null);
                setIsCreateModalOpen(true);
              }}
            >
              + إضافة زبون
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const customerInvs = invitations.filter((inv) => inv.customer_id === cust.id);
            const isArchived = Boolean(cust.deleted_at);

            return (
              <div
                key={cust.id}
                className={`p-5 rounded-xl bg-[#FFFFFF] border transition-all duration-200 shadow-xs flex flex-col justify-between hover:shadow-md ${
                  isArchived
                    ? 'border-[#F7DBA7] bg-[#FFFDF9]'
                    : 'border-[#E8DED8] hover:border-[#C9A45C]/60'
                }`}
              >
                <div>
                  {/* Card Header: Avatar & Invitations Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#5A1020] text-[#C9A45C] font-serif font-bold text-base flex items-center justify-center shadow-xs">
                        {cust.full_name ? cust.full_name[0] : 'ز'}
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-[#171316] leading-tight">
                          {cust.full_name}
                        </h3>
                        {cust.city ? (
                          <span className="text-[11px] text-[#6F6668] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#C9A45C]" />
                            {cust.city}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#9A8F92] italic mt-0.5 block">
                            مدينة غير محددة
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                          customerInvs.length > 0
                            ? 'bg-[#EDF7EE] text-[#175E27] border-[#BFE4C6]'
                            : 'bg-[#FAF7F2] text-[#6F6668] border-[#E8DED8]'
                        }`}
                      >
                        {customerInvs.length} {customerInvs.length === 1 ? 'دعوة' : 'دعوات'}
                      </span>
                      {isArchived && (
                        <span className="text-[9px] text-[#B7791F] font-bold">مؤرشف</span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-xs text-[#6F6668] pt-2 border-t border-[#F2ECE8]">
                    {/* Phone with quick copy */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#C9A45C] shrink-0" />
                        <span dir="ltr" className="font-mono text-[#171316] font-medium">
                          {cust.phone}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleCopyPhone(e, cust)}
                        className="p-1 rounded text-[#9A8F92] hover:text-[#5A1020] hover:bg-[#FAF7F2] transition cursor-pointer"
                        title="نسخ رقم الهاتف"
                      >
                        {copiedPhoneId === cust.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#218739]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Email */}
                    {cust.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#9A8F92] shrink-0" />
                        <span dir="ltr" className="font-mono text-[11px] truncate">
                          {cust.email}
                        </span>
                      </div>
                    )}

                    {/* Address if present */}
                    {cust.address && (
                      <p className="text-[11px] text-[#6F6668] line-clamp-1">
                        {cust.address}
                      </p>
                    )}

                    {/* Private note preview if present */}
                    {cust.notes && (
                      <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[11px] text-[#6F6668] line-clamp-2 mt-1">
                        {cust.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Dates & Actions */}
                <div className="pt-3 mt-4 border-t border-[#E8DED8] flex items-center justify-between text-[10px] text-[#9A8F92]">
                  <span className="font-mono">
                    {new Date(cust.created_at).toLocaleDateString('ar-MA')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* View Details Drawer */}
                    <button
                      onClick={() => setCustomerDrawer(cust)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] hover:border-[#C9A45C] hover:text-[#5A1020] transition flex items-center gap-1 text-[11px] cursor-pointer"
                      title="عرض التفاصيل والدعوات"
                    >
                      <Eye className="w-3 h-3 text-[#C9A45C]" />
                      <span>عرض</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setCustomerToEdit(cust);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#6F6668] hover:text-[#5A1020] hover:border-[#C9A45C] transition cursor-pointer"
                      title="تعديل"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive / Delete */}
                    <button
                      onClick={() => setCustomerToDelete(cust)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isArchived
                          ? 'bg-[#FEF6E7] border-[#F7DBA7] text-[#B7791F] hover:bg-[#FEECEB]'
                          : 'bg-[#FAF7F2] border-[#E8DED8] text-[#6F6668] hover:text-[#B42318] hover:border-[#B42318]/40'
                      }`}
                      title={isArchived ? 'استعادة الزبون' : 'أرشفة الزبون'}
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
            );
          })}
        </div>
      )}

      {/* 5. Add / Edit Customer Modal */}
      {isCreateModalOpen && (
        <CustomerFormModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCustomerToEdit(null);
          }}
          customerToEdit={customerToEdit}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* 6. Customer Details Drawer (Prompt 8) */}
      <Drawer
        isOpen={!!customerDrawer}
        onClose={() => setCustomerDrawer(null)}
        title={customerDrawer ? customerDrawer.full_name : 'تفاصيل الزبون'}
        position="right"
      >
        {customerDrawer && (
          <div className="space-y-6 text-right pb-12">
            {/* Drawer Customer Info */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-serif font-bold text-[#171316]">
                    {customerDrawer.full_name}
                  </h4>
                  <span className="text-xs text-[#6F6668]">
                    {customerDrawer.city || 'المدينة غير محددة'}
                  </span>
                </div>
                <Link
                  to={`/admin/customers/${customerDrawer.id}`}
                  className="text-xs text-[#5A1020] hover:text-[#C9A45C] flex items-center gap-1 font-medium transition cursor-pointer"
                >
                  <span>فتح الصفحة الكاملة</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="pt-2 border-t border-[#E8DED8] space-y-1.5 text-xs">
                <p className="flex items-center justify-between">
                  <span className="text-[#6F6668]">الهاتف:</span>
                  <span dir="ltr" className="font-mono font-bold text-[#171316]">
                    {customerDrawer.phone}
                  </span>
                </p>
                {customerDrawer.email && (
                  <p className="flex items-center justify-between">
                    <span className="text-[#6F6668]">البريد:</span>
                    <span dir="ltr" className="font-mono text-[#171316]">
                      {customerDrawer.email}
                    </span>
                  </p>
                )}
                {customerDrawer.address && (
                  <p className="text-[11px] text-[#6F6668]">
                    العنوان: {customerDrawer.address}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Invitations in Drawer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-serif font-bold text-[#171316]">
                  دعوات الزبون
                </h4>
                <Link to={`/admin/invitations/create?customer_id=${customerDrawer.id}`}>
                  <Button variant="outline" size="sm" icon={<Plus className="w-3 h-3" />}>
                    دعوة جديدة
                  </Button>
                </Link>
              </div>

              {invitations.filter((i) => i.customer_id === customerDrawer.id).length === 0 ? (
                <div className="p-4 text-center rounded-lg border border-dashed border-[#E8DED8] bg-[#FAF7F2]/60">
                  <p className="text-xs text-[#6F6668]">
                    هذا الزبون لا يتوفر على أي دعوة حالياً.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invitations
                    .filter((i) => i.customer_id === customerDrawer.id)
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#171316]">
                              {inv.title}
                            </span>
                            <StatusBadge status={inv.status} size="sm" />
                          </div>
                          <span className="text-[10px] text-[#6F6668] font-mono block mt-0.5">
                            {inv.event_date || 'تاريخ غير محدد'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <a
                            href={`/i/${inv.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded hover:bg-[#FAF7F2] text-[#C9A45C]"
                            title="فتح الدعوة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            to={`/admin/invitations/edit/${inv.id}`}
                            className="p-1.5 rounded hover:bg-[#FAF7F2] text-[#6F6668]"
                            title="تعديل"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Customer Private Notes in Drawer */}
            <div className="space-y-3 pt-3 border-t border-[#E8DED8]">
              <h4 className="text-sm font-serif font-bold text-[#171316]">
                الملاحظات الإدارية الخاصة
              </h4>
              <CustomerNotesSection
                customerId={customerDrawer.id}
                customerName={customerDrawer.full_name}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* 7. Archive / Restore Confirmation Dialog */}
      {customerToDelete && (
        <ConfirmDialog
          isOpen={!!customerToDelete}
          onClose={() => setCustomerToDelete(null)}
          onConfirm={handleArchiveConfirm}
          title={customerToDelete.deleted_at ? 'استعادة الزبون' : 'أرشفة الزبون'}
          message={
            customerToDelete.deleted_at
              ? `هل ترغب في استعادة الزبون "${customerToDelete.full_name}" إلى القائمة النشطة؟`
              : `هل أنت متأكد من أرشفة الزبون "${customerToDelete.full_name}"؟ سيتم الاحتفاظ بكافة دعواته وبياناته بأمان في الأرشيف ولن تُحذف نهائياً.`
          }
          confirmText={customerToDelete.deleted_at ? 'استعادة الزبون' : 'أرشفة الزبون'}
          cancelText="إلغاء"
          isDangerous={!customerToDelete.deleted_at}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
