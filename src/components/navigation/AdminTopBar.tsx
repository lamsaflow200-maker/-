/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  ExternalLink,
  Shield,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../../auth/AuthContext';
import { ROLE_DETAILS } from '../../auth/permissions';
import { BRAND } from '../../design-system/tokens';

const PAGE_METADATA: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': {
    title: 'لوحة التحكم',
    subtitle: 'نظرة شاملة ومتابعة حية للنشاط والأداء',
  },
  '/admin/invitations': {
    title: 'إدارة الدعوات',
    subtitle: 'قائمة الدعوات الرقمية والتحكم بحالات النشر',
  },
  '/admin/customers': {
    title: 'الزبناء',
    subtitle: 'إدارة معلومات الزبناء والدعوات الخاصة بهم',
  },
  '/admin/templates': {
    title: 'كتالوج القوالب',
    subtitle: 'تصاميم القوالب الفاخرة المعتمدة في منسباتي',
  },
  '/admin/guests': {
    title: 'إدارة الضيوف',
    subtitle: 'سجلات المدعوين وتأكيدات الحضور',
  },
  '/admin/analytics': {
    title: 'التحليلات والإحصائيات',
    subtitle: 'مؤشرات التفاعل والزيارات والوصول',
  },
  '/admin/settings': {
    title: 'الإعدادات والنظام',
    subtitle: 'تكوين المنصة والأمان والبيانات',
  },
};

export const AdminTopBar: React.FC = () => {
  const { admin, role, logout, hasPermission } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const getPageMeta = () => {
    if (PAGE_METADATA[location.pathname]) {
      return PAGE_METADATA[location.pathname];
    }
    if (location.pathname.startsWith('/admin/customers/')) {
      return {
        title: 'تفاصيل الزبون',
        subtitle: 'الملف التعريفي للزبون وسجل الدعوات والملاحظات الإدارية',
      };
    }
    if (location.pathname.startsWith('/admin/invitations/edit/')) {
      return {
        title: 'تعديل الدعوة',
        subtitle: 'تخصيص بيانات ومحتوى الدعوة الرقمية',
      };
    }
    if (location.pathname === '/admin/invitations/create') {
      return {
        title: 'إنشاء دعوة جديدة',
        subtitle: 'إعداد دعوة فاخرة جديدة واختيار القالب',
      };
    }
    return {
      title: 'إدارة منسباتي',
      subtitle: BRAND.taglineAr,
    };
  };

  const currentMeta = getPageMeta();

  const roleInfo = role ? ROLE_DETAILS[role] : null;
  const adminName = admin?.full_name || admin?.name || 'مدير النظام';
  const adminInitial = adminName.trim().charAt(0) || 'م';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E8DED8] px-4 sm:px-8 py-3.5 flex items-center justify-between select-none">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col text-right">
        <nav aria-label="مسار التنقل" className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#6F6668] mb-0.5">
          <Link to="/admin/dashboard" className="hover:text-[#5A1020] transition">
            {BRAND.nameAr}
          </Link>
          <span className="text-[#C9A45C]">/</span>
          <span className="text-[#171316] font-medium">{currentMeta.title}</span>
        </nav>
        <h1 className="text-base sm:text-lg font-serif font-bold text-[#171316] leading-tight">
          {currentMeta.title}
        </h1>
      </div>

      {/* Right-Side Actions (Notifications + Admin Profile) */}
      <div className="flex items-center gap-3">
        {/* Notification Icon Foundation */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2.5 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] hover:bg-[#F4ECE4] text-[#6F6668] hover:text-[#5A1020] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A45C]/40"
            aria-label="تنبيهات النظام"
            aria-expanded={isNotificationsOpen}
            aria-haspopup="true"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A45C] ring-2 ring-[#FFFFFF]"
              aria-hidden="true"
            />
          </button>

          {/* Notifications Dropdown Foundation */}
          {isNotificationsOpen && (
            <div
              role="dialog"
              aria-label="قائمة التنبيهات"
              className="absolute left-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-lg py-3 z-50 text-right motion-slide-up"
            >
              <div className="px-4 pb-3 border-b border-[#E8DED8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#5A1020]" />
                  <span className="font-semibold text-xs text-[#171316]">الإشعارات والتنبيهات</span>
                </div>
                <span className="text-[10px] bg-[#FAF7F2] text-[#6F6668] px-2 py-0.5 rounded-md border border-[#E8DED8]">
                  مركز التنبيهات
                </span>
              </div>

              <div className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center mx-auto mb-2.5">
                  <Sparkles className="w-4 h-4 text-[#C9A45C]" />
                </div>
                <p className="text-xs font-medium text-[#171316]">لا توجد تنبيهات جديدة في الوقت الحالي</p>
                <p className="text-[11px] text-[#6F6668] mt-1 leading-relaxed">
                  سيتم إشعارك هنا عند وصول تأكيدات حضور جديدة أو تحديثات على الدعوات.
                </p>
              </div>

              <div className="px-4 pt-2.5 border-t border-[#E8DED8] flex items-center justify-between text-[10px] text-[#6F6668]">
                <span className="flex items-center gap-1.5 text-[#218739] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>محرك الإشعارات جاهز</span>
                </span>
                <span className="font-mono">Mnasbati Core v1.0</span>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Foundation Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-[#E8DED8] bg-[#FFFFFF] hover:bg-[#FAF7F2] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A45C]/40"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            aria-label="قائمة الملف الشخصي للإدارة"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#6F6668] transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180 text-[#5A1020]' : ''
              }`}
            />
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#171316] leading-tight truncate max-w-[130px]">
                {adminName}
              </span>
              <span className="text-[10px] text-[#6F6668] leading-none mt-0.5">
                {roleInfo ? roleInfo.nameAr : 'مشرف'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#5A1020] text-[#FAF7F2] border border-[#5A1020]/20 flex items-center justify-center text-xs font-serif font-bold shadow-xs">
              {adminInitial}
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              role="menu"
              className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-lg py-2 z-50 text-right motion-slide-up"
            >
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-[#E8DED8]">
                <p className="text-xs font-bold text-[#171316] truncate">{adminName}</p>
                <p className="text-[11px] text-[#6F6668] font-mono truncate mt-0.5">{admin?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {roleInfo && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${roleInfo.badgeBg} ${roleInfo.badgeText} ${roleInfo.badgeBorder}`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>{roleInfo.nameAr}</span>
                    </span>
                  )}
                  <span className="text-[10px] text-[#218739] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#218739]" />
                    <span>نشط</span>
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                {hasPermission('manage_settings') && (
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsProfileOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#171316] hover:bg-[#FAF7F2] transition"
                  >
                    <Settings className="w-4 h-4 text-[#6F6668]" />
                    <span>إعدادات النظام</span>
                  </Link>
                )}

                <a
                  href="/i/ahmed-sara"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className="flex items-center justify-between px-4 py-2.5 text-xs text-[#6F6668] hover:text-[#5A1020] hover:bg-[#FAF7F2] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-[#C9A45C]" />
                    <span>معاينة دعوة حية</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#9A8F92]">/i/ahmed-sara</span>
                </a>
              </div>

              {/* Logout Option */}
              <div className="pt-1 border-t border-[#E8DED8]">
                <button
                  type="button"
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#B42318] hover:bg-[#FEECEB] transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#B42318]" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
