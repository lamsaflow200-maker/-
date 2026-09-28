/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Customer, Invitation, TemplateRecord } from '../../types/database';
import { db } from '../../db';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CustomerFormModal } from '../../components/admin/CustomerFormModal';
import { CustomerNotesSection } from '../../components/admin/CustomerNotesSection';
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
  Sparkles,
  Archive,
  RefreshCw,
  Eye,
  FileText,
  User,
  Clock,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export const AdminCustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [templates, setTemplates] = useState<Record<string, TemplateRecord>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Dialogs
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [cust, allInvs, allTemplates] = await Promise.all([
        db.customers.getById(id),
        db.invitations.getAll({ customerId: id, includeDeleted: true }),
        db.templates.getAll(),
      ]);

      if (!cust) {
        toastError('الزبون المطلوب غير موجود أو تم حذفه نهائياً');
        navigate('/admin/customers', { replace: true });
        return;
      }

      setCustomer(cust);
      setInvitations(allInvs);

      const templateMap: Record<string, TemplateRecord> = {};
      allTemplates.forEach((t) => {
        templateMap[t.id] = t;
      });
      setTemplates(templateMap);
    } catch {
      toastError('فشل تحميل تفاصيل الزبون');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCopyPhone = () => {
    if (!customer?.phone) return;
    navigator.clipboard.writeText(customer.phone);
    setIsCopied(true);
    success('تم نسخ رقم الهاتف');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleArchiveCustomer = async () => {
    if (!customer) return;
    setIsProcessingDelete(true);
    try {
      await db.customers.delete(customer.id, false); // soft delete
      success('تمت أرشفة بيانات الزبون بنجاح');
      setIsArchiveDialogOpen(false);
      navigate('/admin/customers');
    } catch {
      toastError('فشل أرشفة الزبون');
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!customer) return;
    setIsProcessingDelete(true);
    try {
      await db.customers.delete(customer.id, true); // permanent delete
      success('تم حذف سجل الزبون نهائياً');
      setIsPermanentDeleteDialogOpen(false);
      navigate('/admin/customers');
    } catch {
      toastError('فشل حذف الزبون');
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const handleRestoreCustomer = async () => {
    if (!customer) return;
    try {
      const restored = await db.customers.restore(customer.id);
      setCustomer(restored);
      success('تمت استعادة الزبون إلى القائمة النشطة بنجاح');
    } catch {
      toastError('فشل استعادة الزبون');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6F6668]">جاري تحميل ملف الزبون والدعوات المرتبطة...</p>
      </div>
    );
  }

  if (!customer) return null;

  const activeInvitations = invitations.filter((inv) => !inv.deleted_at);

  return (
    <div className="space-y-6 text-right motion-fade-in max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED8]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] text-[#6F6668] hover:text-[#5A1020] hover:border-[#C9A45C]/60 transition cursor-pointer"
            title="العودة لقائمة الزبناء"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
                {customer.full_name}
              </h1>
              {customer.deleted_at && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FEF6E7] text-[#B7791F] border border-[#F7DBA7]">
                  مؤرشف
                </span>
              )}
            </div>
            <p className="text-xs text-[#6F6668] mt-0.5">
              الملف التعريفي للزبون وسجل الدعوات والملاحظات الإدارية
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {customer.deleted_at ? (
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRestoreCustomer}
            >
              استعادة الزبون
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => setIsEditModalOpen(true)}
              >
                تعديل البيانات
              </Button>
              <Link to={`/admin/invitations/create?customer_id=${customer.id}`}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  إنشاء دعوة للزبون
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                icon={<Archive className="w-4 h-4" />}
                onClick={() => setIsArchiveDialogOpen(true)}
              >
                أرشفة الزبون
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Customer Info Card + Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Customer Profile Card) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Identity & Contact Card */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8DED8]">
              <div className="w-14 h-14 rounded-2xl bg-[#5A1020] text-[#C9A45C] font-serif font-bold text-2xl flex items-center justify-center shadow-xs">
                {customer.full_name ? customer.full_name[0] : 'ز'}
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-[#171316]">
                  {customer.full_name}
                </h2>
                <span className="text-[11px] text-[#C9A45C] font-mono">
                  {invitations.length} دعوة مسجلة
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 text-xs">
              {/* Phone */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#171316]">
                  <Phone className="w-4 h-4 text-[#C9A45C]" />
                  <div>
                    <span className="text-[10px] text-[#6F6668] block">رقم الهاتف</span>
                    <span dir="ltr" className="font-mono font-bold">{customer.phone}</span>
                  </div>
                </div>
                <button
                  onClick={handleCopyPhone}
                  className="p-1.5 rounded-lg hover:bg-[#FFFFFF] border border-transparent hover:border-[#E8DED8] text-[#6F6668] transition cursor-pointer"
                  title="نسخ رقم الهاتف"
                >
                  {isCopied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#218739]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Email */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] flex items-center gap-2.5 text-[#171316]">
                <Mail className="w-4 h-4 text-[#C9A45C]" />
                <div>
                  <span className="text-[10px] text-[#6F6668] block">البريد الإلكتروني</span>
                  {customer.email ? (
                    <span dir="ltr" className="font-mono">{customer.email}</span>
                  ) : (
                    <span className="text-[#9A8F92] italic">غير محدد</span>
                  )}
                </div>
              </div>

              {/* City & Address */}
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] flex items-start gap-2.5 text-[#171316]">
                <MapPin className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#6F6668] block">المدينة والعنوان</span>
                  <p className="font-medium">
                    {customer.city || 'المدينة غير محددة'}
                  </p>
                  {customer.address && (
                    <p className="text-[11px] text-[#6F6668] mt-0.5">{customer.address}</p>
                  )}
                </div>
              </div>

              {/* Registration Timestamps */}
              <div className="pt-2 border-t border-[#E8DED8] text-[10px] text-[#9A8F92] space-y-1">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاريخ التسجيل: </span>
                  <span className="font-mono text-[#171316]">
                    {new Date(customer.created_at).toLocaleDateString('ar-MA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>آخر تحديث: </span>
                  <span className="font-mono text-[#171316]">
                    {new Date(customer.updated_at).toLocaleDateString('ar-MA')}
                  </span>
                </p>
              </div>
            </div>

            {/* General Notes if any */}
            {customer.notes && (
              <div className="p-3 rounded-xl bg-[#F6ECF0]/40 border border-[#E8DED8] space-y-1">
                <span className="text-[10px] font-bold text-[#5A1020] block">
                  ملاحظة البطاقة الرئيسية:
                </span>
                <p className="text-xs text-[#171316] leading-relaxed whitespace-pre-wrap">
                  {customer.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Invitations & Private Notes Tabs) */}
        <div className="space-y-6 lg:col-span-2">
          {/* SECTION 1: Customer Invitations */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DED8]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#171316]">
                  دعوات الزبون ({activeInvitations.length})
                </h3>
                <p className="text-xs text-[#6F6668]">
                  جميع الدعوات الرقمية المنشورة أو قيد التجهيز لهذا الزبون
                </p>
              </div>
              <Link to={`/admin/invitations/create?customer_id=${customer.id}`}>
                <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                  دعوة جديدة
                </Button>
              </Link>
            </div>

            {/* Invitations List */}
            {activeInvitations.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-[#E8DED8] bg-[#FAF7F2]/60 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-[#C9A45C]" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#171316]">
                    هذا الزبون لا يتوفر على أي دعوة حالياً.
                  </h4>
                  <p className="text-xs text-[#6F6668] mt-1 max-w-sm mx-auto">
                    يمكنك إنشاء أول دعوة زفاف أو حفل خاص باسم هذا الزبون واختيار القالب المناسب.
                  </p>
                </div>
                <Link to={`/admin/invitations/create?customer_id=${customer.id}`}>
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                    إنشاء أول دعوة لهذا الزبون
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeInvitations.map((inv) => {
                  const template = templates[inv.template_id];
                  return (
                    <div
                      key={inv.id}
                      className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] hover:border-[#C9A45C]/60 transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-serif font-bold text-[#171316]">
                            {inv.title}
                          </h4>
                          <StatusBadge status={inv.status} />
                          <span className="text-[10px] bg-[#FFFFFF] border border-[#E8DED8] px-2 py-0.5 rounded text-[#6F6668]">
                            {inv.event_type === 'wedding'
                              ? 'حفل زفاف'
                              : inv.event_type === 'graduation'
                              ? 'حفل تخرج'
                              : inv.event_type === 'aqiqah'
                              ? 'عقيقة'
                              : 'مناسبة خاصة'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#6F6668] flex-wrap">
                          {inv.event_date && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
                              {inv.event_date}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#5A1020]" />
                            {template?.name_ar || template?.name || inv.template_id}
                          </span>
                          <span className="text-[10px] text-[#9A8F92] font-mono">
                            أنشئت في: {new Date(inv.created_at).toLocaleDateString('ar-MA')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <a
                          href={`/i/${inv.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#FFFFFF] border border-[#E8DED8] text-[#171316] hover:text-[#5A1020] hover:border-[#C9A45C] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="فتح رابط الدعوة العام"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>معاينة</span>
                        </a>

                        <Link to={`/admin/invitations/edit/${inv.id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Edit className="w-3.5 h-3.5" />}
                          >
                            تعديل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: Private Customer Notes */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-[#171316]">
                سجل الملاحظات الخاصة بالزبون
              </h3>
              <p className="text-xs text-[#6F6668]">
                ملاحظات سرية مخصصة لفريق الإدارة لمتابعة تفاصيل الاتفاق والتواصل
              </p>
            </div>

            <CustomerNotesSection
              customerId={customer.id}
              customerName={customer.full_name}
            />
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customerToEdit={customer}
          onSuccess={(updated) => {
            setCustomer(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}

      {/* Safe Archive Confirmation */}
      {isArchiveDialogOpen && (
        <ConfirmDialog
          isOpen={isArchiveDialogOpen}
          onClose={() => setIsArchiveDialogOpen(false)}
          onConfirm={handleArchiveCustomer}
          title="أرشفة الزبون"
          message={`هل أنت متأكد من نقل الزبون "${customer.full_name}" إلى الأرشيف؟ ${
            activeInvitations.length > 0
              ? `تنبيه: يتوفر الزبون على (${activeInvitations.length}) دعوة نشطة ستظل محفوظة في النظام دون حذف.`
              : 'سيتم نقل بياناته للأرشيف مع إمكانية استعادتها لاحقاً.'
          }`}
          confirmText="أرشفة الزبون"
          cancelText="إلغاء"
          isDangerous={false}
          isLoading={isProcessingDelete}
        />
      )}

      {/* Permanent Delete Confirmation (If applicable) */}
      {isPermanentDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={isPermanentDeleteDialogOpen}
          onClose={() => setIsPermanentDeleteDialogOpen(false)}
          onConfirm={handlePermanentDelete}
          title="الحذف النهائي للزبون"
          message={`تحذير: سيتم حذف بيانات الزبون "${customer.full_name}" نهائياً من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء.`}
          confirmText="حذف نهائي"
          cancelText="إلغاء"
          isDangerous={true}
          isLoading={isProcessingDelete}
        />
      )}
    </div>
  );
};
