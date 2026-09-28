/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Users,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
  Shield,
  UserCheck,
  BarChart3,
  Music,
} from 'lucide-react';
import { useAdminAuth } from '../../auth/AuthContext';
import { Permission, ROLE_DETAILS } from '../../auth/permissions';
import { BRAND } from '../../design-system/tokens';

export interface AdminNavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  permission?: Permission;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    path: '/admin/dashboard',
    label: 'لوحة التحكم',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    path: '/admin/customers',
    label: 'الزبناء',
    icon: <Users className="w-4 h-4" />,
    permission: 'manage_customers',
  },
  {
    path: '/admin/invitations',
    label: 'الدعوات',
    icon: <Mail className="w-4 h-4" />,
    permission: 'manage_invitations',
  },
  {
    path: '/admin/templates',
    label: 'القوالب',
    icon: <Palette className="w-4 h-4" />,
    permission: 'view_templates',
  },
  {
    path: '/admin/guests',
    label: 'الضيوف',
    icon: <UserCheck className="w-4 h-4" />,
    permission: 'manage_guests',
  },
  {
    path: '/admin/analytics',
    label: 'الإحصائيات',
    icon: <BarChart3 className="w-4 h-4" />,
    permission: 'view_analytics',
  },
  {
    path: '/admin/settings?tab=music',
    label: 'مكتبة الموسيقى',
    icon: <Music className="w-4 h-4" />,
    permission: 'manage_settings',
  },
  {
    path: '/admin/settings',
    label: 'الإعدادات',
    icon: <Settings className="w-4 h-4" />,
    permission: 'manage_settings',
  },
];

export const AdminSidebar: React.FC = () => {
  const { admin, role, hasPermission, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const roleInfo = role ? ROLE_DETAILS[role] : null;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-l border-[#E8DED8] bg-[#FFFFFF] h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E8DED8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5A1020] flex items-center justify-center text-[#C9A45C] shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-[#C9A45C]" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-[#5A1020] tracking-tight leading-tight">
              {BRAND.nameAr}
            </h1>
            <p className="text-[10px] text-[#6F6668] truncate max-w-[140px]">
              {BRAND.taglineAr}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase font-bold text-[#9A8F92] px-3 py-1.5 tracking-wider">
          إدارة المنصة
        </p>
        {ADMIN_NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)).map(
          (item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#F6ECF0] text-[#5A1020] font-semibold border-r-3 border-[#5A1020]'
                    : 'text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2]'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        )}

        <div className="pt-4 mt-4 border-t border-[#E8DED8]">
          <p className="text-[10px] uppercase font-bold text-[#9A8F92] px-3 py-1.5 tracking-wider">
            معاينة حية للدعوات
          </p>
          <a
            href="/i/ahmed-sara"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-[#6F6668] hover:text-[#5A1020] hover:bg-[#FAF7F2] transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>دعوة زفاف أحمد وسارة</span>
            </span>
            <span className="text-[9px] bg-[#F4ECE4] text-[#6F6668] px-1.5 py-0.5 rounded font-mono">
              /i/ahmed-sara
            </span>
          </a>
        </div>
      </nav>

      {/* Admin User Footer Profile with Role Badge & Logout */}
      <div className="p-3.5 border-t border-[#E8DED8] bg-[#FAF7F2]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#5A1020] text-[#FAF7F2] flex items-center justify-center text-xs font-serif font-bold shrink-0">
              {admin?.full_name?.[0] || admin?.name?.[0] || 'م'}
            </div>
            <div className="overflow-hidden text-right">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[#171316] truncate">
                  {admin?.full_name || admin?.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {roleInfo && (
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.2 rounded border ${roleInfo.badgeBg} ${roleInfo.badgeText} ${roleInfo.badgeBorder}`}
                  >
                    <Shield className="w-2.5 h-2.5" />
                    <span>{roleInfo.nameAr}</span>
                  </span>
                )}
                <span className="text-[9px] text-[#6F6668] truncate font-mono">
                  {admin?.email}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="p-1.5 rounded-lg text-[#6F6668] hover:text-[#B42318] hover:bg-[#FEECEB] transition cursor-pointer"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
