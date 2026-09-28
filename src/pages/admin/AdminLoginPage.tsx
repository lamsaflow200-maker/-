/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Luxury Mnasbati Admin Login Screen.
 * Exclusively provides authentication for administrators to access /admin/*.
 * Supports Supabase Auth, RBAC validation, remember-me sessions, and password recovery.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../auth/AuthContext';
import {
  Sparkles,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BRAND } from '../../design-system/tokens';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field-level error messages
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Recovery Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Quick Testing Credentials Panel (Collapsible for reviewers)
  const [showTestCredentials, setShowTestCredentials] = useState(false);

  const { login, resetPassword, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after successful login
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // If already authenticated, redirect straight to intended destination
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Email format validation helper
  const isValidEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error states
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    let hasValidationError = false;
    const cleanEmail = email.trim();

    // 1. Email Validation
    if (!cleanEmail) {
      setEmailError('المرجو إدخال البريد الإلكتروني');
      hasValidationError = true;
    } else if (!isValidEmail(cleanEmail)) {
      setEmailError('المرجو إدخال بريد إلكتروني صحيح');
      hasValidationError = true;
    }

    // 2. Password Validation
    if (!password) {
      setPasswordError('المرجو إدخال كلمة المرور');
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({
        email: cleanEmail,
        password,
        rememberMe,
      });

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        // Display user-friendly Arabic error message
        setGeneralError(res.error || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setGeneralError('تعذر الاتصال بخادم المصادقة، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Recovery handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessMessage('');

    const clean = forgotEmail.trim();
    if (!clean) {
      setForgotError('المرجو إدخال البريد الإلكتروني');
      return;
    }
    if (!isValidEmail(clean)) {
      setForgotError('المرجو إدخال بريد إلكتروني صحيح');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await resetPassword(clean);
      setForgotSuccessMessage(res.message);
    } catch {
      setForgotError('حدث خطأ أثناء إرسال طلب استعادة كلمة المرور');
    } finally {
      setForgotLoading(false);
    }
  };

  const fillTestCredentials = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#5A1020] selection:text-[#FAF7F2]"
    >
      {/* Background Luxury Ambient Glows */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-[#C9A45C]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 rounded-full bg-[#5A1020]/5 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl p-6 sm:p-9 shadow-sm text-right transition-all">
          {/* Logo & Section Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-13 h-13 rounded-2xl bg-[#5A1020] flex items-center justify-center text-[#C9A45C] shadow-sm mb-3.5 border border-[#5A1020]/20">
              <Sparkles className="w-6 h-6 text-[#C9A45C]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A1020] tracking-tight">
              {BRAND.nameAr}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#171316] tracking-wide">
                لوحة التحكم
              </span>
              <span className="text-[#C9A45C]">•</span>
              <span className="text-[11px] text-[#6F6668]">بوابة الإدارة المعتمدة</span>
            </div>
          </div>

          {/* General Error Alert */}
          {generalError && (
            <div
              role="alert"
              className="p-3.5 mb-5 rounded-xl bg-[#FEECEB] border border-[#F8B6B2] text-xs text-[#912018] font-medium flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-[#B42318] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{generalError}</div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <Input
                label="البريد الإلكتروني للإدارة"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (generalError) setGeneralError('');
                }}
                error={emailError}
                placeholder="admin@mnasbati.ma"
                dir="ltr"
                startIcon={<Mail className="w-4 h-4 text-[#6F6668]" />}
                className="text-left"
              />
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="space-y-1">
              <Input
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (generalError) setGeneralError('');
                }}
                error={passwordError}
                placeholder="••••••••"
                dir="ltr"
                startIcon={<Lock className="w-4 h-4 text-[#6F6668]" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded-md text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#C9A45C] transition cursor-pointer"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#6F6668]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#6F6668]" />
                    )}
                  </button>
                }
                className="text-left"
              />
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E8DED8] text-[#5A1020] focus:ring-[#C9A45C] focus:ring-offset-0 cursor-pointer accent-[#5A1020]"
                />
                <span className="text-[#6F6668] hover:text-[#171316]">تذكرني</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError('');
                  setForgotSuccessMessage('');
                  setIsForgotModalOpen(true);
                }}
                className="text-xs font-medium text-[#5A1020] hover:text-[#380913] hover:underline focus:outline-none cursor-pointer"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3 font-semibold min-h-[46px]"
              isLoading={isSubmitting}
            >
              تسجيل الدخول
            </Button>
          </form>

          {/* Security Notice Footer */}
          <div className="mt-6 pt-5 border-t border-[#E8DED8] text-center">
            <div className="inline-flex items-center justify-center gap-1.5 text-[11px] text-[#6F6668]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C] shrink-0" />
              <span>منطقة وصول مشفرة ومخصصة حصرياً لإدارة منصة منسباتي</span>
            </div>
          </div>
        </div>

        {/* Security Testing Profiles (Accessible helper for development & testing requirements) */}
        <div className="mt-4 bg-[#FFFFFF]/80 backdrop-blur-xs border border-[#E8DED8] rounded-xl p-3 text-xs text-right">
          <button
            type="button"
            onClick={() => setShowTestCredentials(!showTestCredentials)}
            className="w-full flex items-center justify-between text-[#6F6668] hover:text-[#171316] font-medium cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>حسابات الاختبار الأمني للمراجعة (انقر للتعبئة السريعة)</span>
            </span>
            <span className="text-[10px] text-[#5A1020] underline">
              {showTestCredentials ? 'إخفاء' : 'عرض'}
            </span>
          </button>

          {showTestCredentials && (
            <div className="mt-3 pt-3 border-t border-[#E8DED8]/70 space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]/50">
                <div>
                  <p className="font-semibold text-[#5A1020]">1. مدير عام (Super Admin)</p>
                  <p className="text-[10px] text-[#6F6668] font-mono">admin@mnasbati.ma</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillTestCredentials('admin@mnasbati.ma', 'admin123')}
                  className="px-2.5 py-1 rounded bg-[#5A1020] text-[#FAF7F2] text-[10px] font-medium hover:bg-[#460C18] cursor-pointer"
                >
                  تعبئة الحساب
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]/50">
                <div>
                  <p className="font-semibold text-[#8A6A23]">2. مشرف إدارة (Admin)</p>
                  <p className="text-[10px] text-[#6F6668] font-mono">manager@mnasbati.ma</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillTestCredentials('manager@mnasbati.ma', 'manager123')}
                  className="px-2.5 py-1 rounded bg-[#C9A45C] text-[#171316] text-[10px] font-medium hover:bg-[#B89249] cursor-pointer"
                >
                  تعبئة الحساب
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]/50">
                <div>
                  <p className="font-semibold text-[#B42318]">3. حساب معطل (Inactive Admin)</p>
                  <p className="text-[10px] text-[#6F6668] font-mono">inactive@mnasbati.ma</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillTestCredentials('inactive@mnasbati.ma', 'test123')}
                  className="px-2.5 py-1 rounded bg-[#FEECEB] text-[#912018] border border-[#F8B6B2] text-[10px] font-medium hover:bg-[#FDD8D5] cursor-pointer"
                >
                  اختبار المنع
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Recovery Modal */}
      {isForgotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171316]/50 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-sm bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl p-6 shadow-xl relative text-right">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute left-4 top-4 p-1 rounded-lg text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2] cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#5A1020]/10 text-[#5A1020] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h2 id="forgot-modal-title" className="text-base font-bold text-[#171316]">
                استعادة كلمة المرور
              </h2>
            </div>

            <p className="text-xs text-[#6F6668] mb-4 leading-relaxed">
              أدخل البريد الإلكتروني المعتمد لحسابك الإداري، وسنرسل لك تعليمات استعادة كلمة المرور
              بأمان.
            </p>

            {forgotError && (
              <div className="p-2.5 mb-3 rounded-lg bg-[#FEECEB] border border-[#F8B6B2] text-xs text-[#912018]">
                {forgotError}
              </div>
            )}

            {forgotSuccessMessage ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#EBFDF3] border border-[#A4F4C7] text-xs text-[#067647] flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{forgotSuccessMessage}</span>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsForgotModalOpen(false)}
                >
                  العودة لتسجيل الدخول
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <Input
                  label="البريد الإلكتروني للإدارة"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@mnasbati.ma"
                  dir="ltr"
                  startIcon={<Mail className="w-4 h-4 text-[#6F6668]" />}
                />

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={forgotLoading}
                  >
                    إرسال رابط الاستعادة
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsForgotModalOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
