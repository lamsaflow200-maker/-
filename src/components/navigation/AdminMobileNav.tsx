/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, LogOut, ExternalLink, Shield } from 'lucide-react';
import { ADMIN_NAV_ITEMS } from './AdminSidebar';
import { useAdminAuth } from '../../auth/AuthContext';
import { ROLE_DETAILS } from '../../auth/permissions';
import { BRAND } from '../../design-system/tokens';

export const AdminMobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { admin, role, hasPermission, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/admin/login', { replace: true });
  };

  const roleInfo = role ? ROLE_DETAILS[role] : null;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E8DED8] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5A1020] flex items-center justify-center text-[#C9A45C] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#C9A45C]" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm text-[#5A1020]">{BRAND.nameAr}</span>
            <span className="text-[9px] text-[#C9A45C] block -mt-1 font-mono uppercase">
              لوحة التحكم
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] hover:bg-[#F4ECE4] transition cursor-pointer"
          aria-label="تبديل القائمة"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#171316]/50 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#FFFFFF] border-l border-[#E8DED8] h-full flex flex-col p-5 z-10 text-right motion-slide-up shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DED8]">
              <span className="font-serif font-bold text-sm text-[#5A1020]">{BRAND.nameAr}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2] cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {ADMIN_NAV_ITEMS.filter(
                (item) => !item.permission || hasPermission(item.permission)
              ).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#F6ECF0] text-[#5A1020] font-semibold border-r-3 border-[#5A1020]'
                        : 'text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2]'
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div className="pt-4 border-t border-[#E8DED8] mt-4">
                <a
                  href="/i/ahmed-sara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-[#6F6668] hover:text-[#5A1020] hover:bg-[#FAF7F2]"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>معاينة دعوة حية</span>
                  </span>
                </a>
              </div>
            </nav>

            <div className="pt-4 border-t border-[#E8DED8] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#171316]">
                  {admin?.full_name || admin?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {roleInfo && (
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.2 rounded border ${roleInfo.badgeBg} ${roleInfo.badgeText} ${roleInfo.badgeBorder}`}
                    >
                      <Shield className="w-2.5 h-2.5" />
                      <span>{roleInfo.nameAr}</span>
                    </span>
                  )}
                  <span className="text-[9px] text-[#6F6668] font-mono">{admin?.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#B42318] hover:bg-[#FEECEB] rounded-lg cursor-pointer"
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick-Access Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFFFFF] border-t border-[#E8DED8] px-2 py-1.5 flex items-center justify-around shadow-md">
        {ADMIN_NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission))
          .slice(0, 4)
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition ${
                  isActive ? 'text-[#5A1020] font-semibold' : 'text-[#6F6668] hover:text-[#171316]'
                }`
              }
            >
              {item.icon}
              <span className="mt-1">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
      </div>
    </>
  );
};
