/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Protected Route Component for Mnasbati Admin.
 * Enforces authentication and granular role-based authorization for all /admin/* routes.
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from './AuthContext';
import { Permission, ROLE_DETAILS } from './permissions';
import { AdminRole } from '../types/database';
import { ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { BRAND } from '../design-system/tokens';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  allowedRoles?: AdminRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, admin, role, hasPermission } = useAdminAuth();
  const location = useLocation();

  // 1. Loading State (Checking session and token validity)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 select-none">
        <div className="w-12 h-12 rounded-xl bg-[#5A1020] flex items-center justify-center text-[#C9A45C] shadow-md animate-pulse mb-4">
          <Sparkles className="w-6 h-6 text-[#C9A45C]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold text-[#171316]">جاري التحقق من الصلاحيات الأمنية...</h2>
          <p className="text-xs text-[#6F6668]">{BRAND.nameAr} — بوابة الإدارة المعتمدة</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Redirect to Login with requested route in state
  if (!isAuthenticated || !admin || !admin.is_active) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Authorization Role Check (if specific roles are required)
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-right select-none">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl p-7 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-[#FEECEB] text-[#B42318] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#171316] mb-1">منطقة محددة الصلاحيات</h2>
          <p className="text-xs text-[#6F6668] mb-4 leading-relaxed">
            حسابك الحالي مسجل برتبة{' '}
            <span className="font-semibold text-[#5A1020]">
              {role ? ROLE_DETAILS[role]?.nameAr : 'مشرف'}
            </span>
            ، ولا يملك الصلاحية اللازمة للوصول إلى هذا القسم.
          </p>
          <div className="pt-4 border-t border-[#E8DED8] flex justify-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5A1020] text-[#FAF7F2] text-xs font-semibold hover:bg-[#480c19] transition"
            >
              <span>العودة إلى لوحة التحكم</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorization Permission Check (if specific permission is required)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-right select-none">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl p-7 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-[#FEECEB] text-[#B42318] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#171316] mb-1">غير مصرح بالوصول</h2>
          <p className="text-xs text-[#6F6668] mb-4 leading-relaxed">
            يتطلب هذا الإجراء صلاحيات إدارية متقدمة غير متوفرة في حسابك الحالي.
          </p>
          <div className="pt-4 border-t border-[#E8DED8] flex justify-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5A1020] text-[#FAF7F2] text-xs font-semibold hover:bg-[#480c19] transition"
            >
              <span>العودة إلى لوحة التحكم</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authorized & Authenticated -> Render Child Route
  return <>{children}</>;
};
