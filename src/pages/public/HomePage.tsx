/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Shield, ExternalLink, Calendar, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BRAND } from '../../design-system/tokens';

export const HomePage: React.FC = () => {
  const [slugInput, setSlugInput] = useState('');
  const navigate = useNavigate();

  const handleOpenInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugInput.trim()) {
      navigate(`/i/${slugInput.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171316] flex flex-col justify-between selection:bg-[#C9A45C]/25 selection:text-[#5A1020] relative overflow-hidden select-none">
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C9A45C]/12 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#5A1020]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#E8DED8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5A1020] flex items-center justify-center text-[#C9A45C] shadow-xs">
            <Sparkles className="w-5 h-5 text-[#C9A45C]" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl text-[#5A1020] tracking-tight block">
              {BRAND.nameAr}
            </span>
            <span className="text-[10px] text-[#6F6668] block -mt-0.5">
              {BRAND.taglineAr}
            </span>
          </div>
        </div>

        <Link to="/admin/login">
          <Button variant="outline" size="sm" icon={<Shield className="w-3.5 h-3.5 text-[#5A1020]" />}>
            بوابة الإدارة
          </Button>
        </Link>
      </header>

      {/* Center Hero Section */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 sm:py-16 text-center space-y-8 motion-fade-in">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E8DED8] text-[#5A1020] text-xs font-medium shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span>استوديو تصميم وإدارة الدعوات الرقمية الفاخرة</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#5A1020] leading-tight tracking-tight">
          دعوتك... بأسلوب يليق بمناسبتك
        </h1>

        <p className="text-sm sm:text-base text-[#6F6668] max-w-xl mx-auto leading-relaxed">
          منصة متكاملة لإدارة وبناء الدعوات الرقمية الراقية لحفلات الزفاف، الخطوبة، العقيقة،
          التخرج، والمناسبات العائلية والخاصة مع نظام متابعة تأكيدات الحضور اللحظي.
        </p>

        {/* Guest Direct Invitation Access Box */}
        <div className="w-full max-w-md mx-auto bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl p-5 shadow-sm text-right">
          <p className="text-xs font-semibold text-[#171316] mb-2.5">
            هل وصلتك دعوة وتريد فتحها؟
          </p>
          <form onSubmit={handleOpenInvitation} className="flex items-center gap-2">
            <input
              type="text"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder="اكتب رمز أو رابط الدعوة (مثال: ahmed-sara)"
              className="flex-1 bg-[#FAF7F2] border border-[#E8DED8] rounded-lg px-3 py-2.5 text-xs text-[#171316] placeholder:text-[#9A8F92] focus:outline-none focus:border-[#5A1020] focus:ring-1 focus:ring-[#C9A45C]/30"
            />
            <Button type="submit" variant="primary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />}>
              فتح الدعوة
            </Button>
          </form>

          {/* Quick Access to Foundation Samples */}
          <div className="mt-4 pt-3 border-t border-[#E8DED8] flex items-center justify-between text-[11px] text-[#6F6668]">
            <span>نماذج معتمدة حالية:</span>
            <div className="flex items-center gap-2">
              <Link
                to="/i/ahmed-sara"
                className="text-[#5A1020] hover:underline font-mono inline-flex items-center gap-1 font-semibold"
              >
                <span>حفل زفاف أحمد وسارة</span>
                <ExternalLink className="w-3 h-3 text-[#C9A45C]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Pillars Foundation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-right">
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center mb-2.5">
              <Heart className="w-4 h-4 text-[#5A1020]" />
            </div>
            <h3 className="text-xs font-serif font-bold text-[#171316] mb-1">لكافة أنواع المناسبات</h3>
            <p className="text-[11px] text-[#6F6668] leading-relaxed">
              زفاف، خطوبة، عقيقة، تخرج، واحتفالات خاصة مع توافق متقن مع الهواتف الذكية.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#F9F5EC] text-[#C9A45C] flex items-center justify-center mb-2.5">
              <Calendar className="w-4 h-4 text-[#C9A45C]" />
            </div>
            <h3 className="text-xs font-serif font-bold text-[#171316] mb-1">محرك قوالب ديناميكي</h3>
            <p className="text-[11px] text-[#6F6668] leading-relaxed">
              فصل كامل بين بيانات المناسبة والتصميم، مما يتيح التبديل الفوري بين القوالب الفاخرة.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#F6ECF0] text-[#5A1020] flex items-center justify-center mb-2.5">
              <Shield className="w-4 h-4 text-[#5A1020]" />
            </div>
            <h3 className="text-xs font-serif font-bold text-[#171316] mb-1">لوحة إدارة مستقلة</h3>
            <p className="text-[11px] text-[#6F6668] leading-relaxed">
              إدارة العملاء، التحكم بحالات الروابط (نشطة، مسودة، متوقفة، منتهية)، وتأكيدات RSVP.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-[#E8DED8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6F6668]">
        <p>© 2026 {BRAND.nameAr} — {BRAND.nameEn}. جميع الحقوق محفوظة.</p>
        <p className="font-serif text-[#5A1020] font-semibold">{BRAND.taglineAr}</p>
      </footer>
    </div>
  );
};
