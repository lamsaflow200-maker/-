/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../db';
import { NotificationLog, NotificationChannel, NotificationStatus } from '../../../types/database';
import { notificationService } from '../../../services/notifications/NotificationService';
import { NotificationSystemSettings } from '../../../services/notifications/types';
import { useToast } from '../../ui/Toast';
import {
  Bell,
  MessageCircle,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Send,
  ExternalLink,
  Lock,
  Layers,
} from 'lucide-react';

export const AdminNotificationManager: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [settings, setSettings] = useState<NotificationSystemSettings>(() =>
    notificationService.getSettings()
  );
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetryingId, setIsRetryingId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | NotificationStatus>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | NotificationChannel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load logs
  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const allLogs = await db.notifications.getAll();
      setLogs(allLogs);
    } catch (err) {
      console.error('Failed to load notification logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Setting toggles
  const handleToggleSetting = (
    key: keyof NotificationSystemSettings,
    value: boolean
  ) => {
    const updated = notificationService.updateSettings({ [key]: value });
    setSettings(updated);
    success('تم تحديث إعدادات الإشعارات بنجاح');
  };

  // Retry action with limited retries
  const handleRetry = async (logId: string) => {
    try {
      setIsRetryingId(logId);
      const result = await notificationService.retryNotification(logId);
      if (result.success || result.status === 'sent') {
        success('تمت إعادة إرسال الإشعار بنجاح!');
      } else {
        toastError(result.errorMessage || 'فشلت محاولة إعادة الإرسال');
      }
      await loadLogs();
    } catch (err: any) {
      toastError(err?.message || 'حدث خطأ أثناء إعادة المحاولة');
    } finally {
      setIsRetryingId(null);
    }
  };

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (channelFilter !== 'all' && log.channel !== channelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRecipient = log.recipient.toLowerCase().includes(q);
      const matchType = log.notification_type.toLowerCase().includes(q);
      const matchError = log.error_message?.toLowerCase().includes(q);
      if (!matchRecipient && !matchType && !matchError) return false;
    }
    return true;
  });

  // Type label helper
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'rsvp_confirmed':
        return { text: 'تأكيد حضور RSVP', color: 'bg-[#EDF7EE] text-[#175E27] border-[#BFE4C6]' };
      case 'rsvp_declined':
        return { text: 'اعتذار عن الحضور', color: 'bg-[#FEECEB] text-[#B42318] border-[#F8B6B2]' };
      case 'invitation_created':
        return { text: 'إنشاء دعوة جديدة', color: 'bg-[#F4F3FF] text-[#5925DC] border-[#D9D6FE]' };
      case 'invitation_updated':
        return { text: 'تحديث بيانات الدعوة', color: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]' };
      case 'invitation_reminder':
        return { text: 'تذكير بموعد المناسبة', color: 'bg-[#FEF6E7] text-[#B7791F] border-[#F7DBA7]' };
      default:
        return { text: type, color: 'bg-[#FAF7F2] text-[#6F6668] border-[#E8DED8]' };
    }
  };

  // Channel icon helper
  const getChannelBadge = (channel: NotificationChannel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E7E34] bg-[#25D366]/10 px-2 py-0.5 rounded-md border border-[#25D366]/30">
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#171316] bg-black/5 px-2 py-0.5 rounded-md border border-black/10">
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS</span>
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#175CD3] bg-[#EFF8FF] px-2 py-0.5 rounded-md border border-[#B2DDFF]">
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </span>
        );
    }
  };

  // Status badge helper
  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#175E27] bg-[#EDF7EE] px-2 py-0.5 rounded-full border border-[#BFE4C6]">
            <CheckCircle2 className="w-3 h-3" />
            <span>تم الإرسال (Sent)</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#A6F4C5]">
            <CheckCircle2 className="w-3 h-3" />
            <span>تم التسليم (Delivered)</span>
          </span>
        );
      case 'queued':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B7791F] bg-[#FEF6E7] px-2 py-0.5 rounded-full border border-[#F7DBA7]">
            <Clock className="w-3 h-3" />
            <span>في الانتظار (Queued)</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B42318] bg-[#FEECEB] px-2 py-0.5 rounded-full border border-[#F8B6B2]">
            <AlertTriangle className="w-3 h-3" />
            <span>فشل (Failed)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-right motion-fade-in" dir="rtl">
      {/* 1. Notification System Switches & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Notification Switches */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#E8DED8] pb-3">
            <div className="p-2 rounded-xl bg-[#25D366]/10 text-[#1E7E34]">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#171316]">
                إعدادات قنوات الإشعارات
              </h3>
              <p className="text-xs text-[#6F6668]">
                التحكم المركزي في إرسال تنبيهات الواتساب والرسائل النصية
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Toggle 1: WhatsApp Notifications */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED8]">
              <div>
                <span className="text-xs font-bold text-[#171316] block">
                  إشعارات WhatsApp (WhatsApp Notifications)
                </span>
                <span className="text-[11px] text-[#6F6668]">
                  تفعيل قناة الواتساب لإرسال الإشعارات التلقائية
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleSetting(
                    'whatsappNotificationsEnabled',
                    !settings.whatsappNotificationsEnabled
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.whatsappNotificationsEnabled ? 'bg-[#1E7E34]' : 'bg-[#D1C9C5]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    settings.whatsappNotificationsEnabled
                      ? 'rtl:-translate-x-5 ltr:translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: RSVP Alerts */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED8]">
              <div>
                <span className="text-xs font-bold text-[#171316] block">
                  تنبيهات ردود الحضور (RSVP Notifications)
                </span>
                <span className="text-[11px] text-[#6F6668]">
                  إشعار منظم الحفل/المضيف عند وصول رد جديد (تأكيد أو اعتذار)
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleSetting(
                    'rsvpNotificationsEnabled',
                    !settings.rsvpNotificationsEnabled
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.rsvpNotificationsEnabled ? 'bg-[#5A1020]' : 'bg-[#D1C9C5]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    settings.rsvpNotificationsEnabled
                      ? 'rtl:-translate-x-5 ltr:translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Reminder Alerts */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED8]">
              <div>
                <span className="text-xs font-bold text-[#171316] block">
                  رسائل التذكير المجدولة (Reminders)
                </span>
                <span className="text-[11px] text-[#6F6668]">
                  تذكير الضيوف المؤكدين بموعد المناسبة وموقع القاعة
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleSetting(
                    'reminderNotificationsEnabled',
                    !settings.reminderNotificationsEnabled
                  )
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.reminderNotificationsEnabled ? 'bg-[#5A1020]' : 'bg-[#D1C9C5]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    settings.reminderNotificationsEnabled
                      ? 'rtl:-translate-x-5 ltr:translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card B: Server-Side Secrets & Webhook Foundation Architecture */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#E8DED8] pb-3">
            <div className="p-2 rounded-xl bg-[#F6ECF0] text-[#5A1020]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#171316]">
                بنية الربط السحابي ومزود الخدمة (Provider Architecture)
              </h3>
              <p className="text-xs text-[#6F6668]">
                الأمان وحماية المفاتيح السحابية حصراً في جانب الخادم (Server-Side Secrets)
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#EDF7EE] border border-[#BFE4C6] flex items-center justify-between">
              <span className="text-[#175E27] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>حماية المفاتيح السرية (Zero-Leak Security):</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-[#175E27]">
                Server-Side Only
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#6F6668]">مزود خدمة WhatsApp:</span>
                <span className="font-semibold text-[#171316]">
                  Meta WhatsApp Cloud API / Business Platform
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F6668]">نقطة استقبال الـ Webhook:</span>
                <code className="text-[#5A1020] font-mono font-bold" dir="ltr">
                  /api/webhooks/whatsapp
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6F6668]">التحقق من التوقيع (Signature):</span>
                <span className="font-mono text-[#1E7E34] font-semibold">HMAC SHA-256 Validated</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6F6668] leading-relaxed">
              🔒 لا يتم تضمين رموز الوصول (Access Tokens) أو Phone Number ID داخل حزمة العميل (Client Bundle). يتم التوجيه عبر المسارات الآمنة فقط.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Notification Logs Table & Filters */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-5">
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DED8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#171316]">
                سجل الإشعارات وقنوات التواصل (Notification Logs)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F2] text-[#5A1020] border border-[#E8DED8]">
                {filteredLogs.length} سجل
              </span>
            </div>
            <p className="text-xs text-[#6F6668] mt-0.5">
              متابعة حالة الإرسال والتسليم، وتفاصيل أخطاء المزود وإعادة المحاولة
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={loadLogs}
              className="px-3 py-1.5 rounded-xl border border-[#E8DED8] text-xs font-semibold text-[#6F6668] hover:text-[#171316] bg-[#FAF7F2] hover:bg-[#F2ECE8] transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث السجل</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم المستلم، نوع الإشعار، أو نص الخطأ..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] focus:bg-white focus:border-[#C9A45C] outline-none pr-9 text-right"
            />
            <Search className="w-4 h-4 text-[#9A8F92] absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-[#6F6668] shrink-0">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] focus:border-[#C9A45C] outline-none cursor-pointer"
            >
              <option value="all">جميع الحالات (All)</option>
              <option value="sent">تم الإرسال (Sent)</option>
              <option value="delivered">تم التسليم (Delivered)</option>
              <option value="queued">في الانتظار (Queued)</option>
              <option value="failed">فشل (Failed)</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-[#6F6668] shrink-0">القناة:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] focus:border-[#C9A45C] outline-none cursor-pointer"
            >
              <option value="all">جميع القنوات</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#6F6668]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C9A45C] mb-2" />
            <span>جاري تحميل سجلات الإشعارات...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6F6668] bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E8DED8] p-6 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-[#9A8F92]" />
            <p className="font-serif font-bold text-sm text-[#171316]">لا توجد إشعارات مطابقة</p>
            <p className="text-[11px] text-[#9A8F92]">
              لم يتم العثور على سجلات تطابق الفلتر المحدد أو لم يتم إرسال إشعارات بعد.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E8DED8]">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF7F2] text-[#6F6668] border-b border-[#E8DED8] font-serif">
                <tr>
                  <th className="py-3 px-4 font-bold">نوع الإشعار (Type)</th>
                  <th className="py-3 px-4 font-bold">القناة (Channel)</th>
                  <th className="py-3 px-4 font-bold">المستلم (Recipient)</th>
                  <th className="py-3 px-4 font-bold">الحالة (Status)</th>
                  <th className="py-3 px-4 font-bold">معرف الرسالة / الخطأ</th>
                  <th className="py-3 px-4 font-bold">التاريخ</th>
                  <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED8]">
                {filteredLogs.map((log) => {
                  const typeBadge = getNotificationTypeLabel(log.notification_type);
                  const isRetrying = isRetryingId === log.id;
                  const canRetry = log.status === 'failed' || log.status === 'queued';

                  return (
                    <tr key={log.id} className="hover:bg-[#FAF7F2]/60 transition">
                      {/* Notification Type */}
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${typeBadge.color}`}
                        >
                          {typeBadge.text}
                        </span>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getChannelBadge(log.channel)}
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[#171316] whitespace-nowrap" dir="ltr">
                        {log.recipient}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>

                      {/* Provider Message ID or Error */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {log.error_message ? (
                          <span className="text-[11px] text-[#B42318] block truncate" title={log.error_message}>
                            ⚠️ {log.error_message}
                          </span>
                        ) : log.provider_message_id ? (
                          <code className="text-[10px] text-[#6F6668] font-mono block truncate" dir="ltr">
                            {log.provider_message_id}
                          </code>
                        ) : (
                          <span className="text-[11px] text-[#9A8F92]">—</span>
                        )}
                        {(log.retry_count || 0) > 0 && (
                          <span className="text-[10px] text-[#6F6668] block mt-0.5">
                            المحاولات: {log.retry_count}/3
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-[#6F6668] whitespace-nowrap text-[11px]">
                        {new Date(log.created_at).toLocaleTimeString('ar-MA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        —{' '}
                        {new Date(log.created_at).toLocaleDateString('ar-MA', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {canRetry ? (
                          <button
                            type="button"
                            disabled={isRetrying || (log.retry_count || 0) >= 3}
                            onClick={() => handleRetry(log.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#E8DED8] bg-white text-[#5A1020] hover:bg-[#FAF7F2] transition cursor-pointer disabled:opacity-50"
                            title="إعادة محاولة إرسال الإشعار"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                            <span>{isRetrying ? 'جاري...' : 'إعادة الإرسال'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#9A8F92]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
