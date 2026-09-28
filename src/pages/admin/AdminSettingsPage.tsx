/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Database, Shield, Globe, RefreshCw, CheckCircle, Music, Sliders, Bell } from 'lucide-react';
import { AdminMusicManager } from '../../components/admin/media/AdminMusicManager';
import { AdminNotificationManager } from '../../components/admin/notifications/AdminNotificationManager';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'general' | 'music' | 'notifications'>(
    tabParam === 'music'
      ? 'music'
      : tabParam === 'notifications'
      ? 'notifications'
      : 'general'
  );

  useEffect(() => {
    if (tabParam === 'music') {
      setActiveTab('music');
    } else if (tabParam === 'notifications') {
      setActiveTab('notifications');
    } else if (tabParam === 'general') {
      setActiveTab('general');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'general' | 'music' | 'notifications') => {
    setActiveTab(tab);
    setSearchParams(tab === 'general' ? {} : { tab });
  };

  const handleResetStorage = () => {
    if (window.confirm('هل تريد إعادة تعيين البيانات التجريبية إلى الوضع الافتراضي النظيف؟')) {
      localStorage.clear();
      success('تمت إعادة ضبط التخزين المحلي بنجاح، سيتم تحديث الصفحة.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto motion-fade-in pb-12">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED8]">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
            إعدادات المنصة وإدارة الوسائط
          </h1>
          <p className="text-xs text-[#6F6668] mt-1">
            إدارة إعدادات النظام، قواعد البيانات، ومكتبة الموسيقى الصوتية لمنصة منسباتي
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] border border-[#E8DED8] rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange('general')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-[#5A1020] text-[#FAF7F2] shadow-xs'
                : 'text-[#6F6668] hover:text-[#171316]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>البنية والمنصة</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('music')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'music'
                ? 'bg-[#5A1020] text-[#FAF7F2] shadow-xs'
                : 'text-[#6F6668] hover:text-[#171316]'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>مكتبة الموسيقى</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('notifications')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-[#5A1020] text-[#FAF7F2] shadow-xs'
                : 'text-[#6F6668] hover:text-[#171316]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#25D366]" />
            <span>الإشعارات و WhatsApp</span>
          </button>
        </div>
      </div>

      {activeTab === 'music' ? (
        <AdminMusicManager />
      ) : activeTab === 'notifications' ? (
        <AdminNotificationManager />
      ) : (
        <div className="space-y-6">
          {/* Database & Supabase Readiness */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DED8] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EDF7EE] text-[#218739]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#171316]">
                بنية قاعدة البيانات (PostgreSQL / Supabase)
              </h3>
              <p className="text-xs text-[#6F6668]">
                تم تجهيز هيكلية الجداول العشرة ومخطط العلاقات و RLS في `src/db/schema.sql`
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#EDF7EE] text-[#175E27] border border-[#BFE4C6] flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Schema Ready</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#6F6668]">
          <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
            <span className="text-[#9A8F92] block mb-1">محرك التخزين الحالي:</span>
            <span className="text-[#171316] font-mono font-medium">
              In-Browser Persistent Repository (Local + Seed)
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
            <span className="text-[#9A8F92] block mb-1">الربط السحابي المجهز:</span>
            <span className="text-[#171316] font-mono font-medium">Supabase PostgreSQL 15+</span>
          </div>
        </div>
      </Card>

      {/* Routing & Custom Domains Architecture */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#E8DED8] pb-3">
          <div className="p-2 rounded-lg bg-[#F9F5EC] text-[#C9A45C]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#171316]">
              نظام الروابط والتوجيه (Routing)
            </h3>
            <p className="text-xs text-[#6F6668]">
              جاهزية معالجة الروابط العامة والرموز المربعة والنطاقات المخصصة
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
            <div>
              <span className="font-semibold text-[#171316] block">رابط الدعوة العامة المباشر:</span>
              <span className="text-[11px] text-[#6F6668]">
                يتم توليد الدعوة ديناميكياً من معرّف السبيكة
              </span>
            </div>
            <code className="text-[#5A1020] font-mono bg-[#FFFFFF] border border-[#E8DED8] px-2.5 py-1 rounded-md font-semibold" dir="ltr">
              /i/:slug
            </code>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
            <div>
              <span className="font-semibold text-[#171316] block">رمز الاستجابة السريعة (QR):</span>
              <span className="text-[11px] text-[#6F6668]">
                توجيه سريع للبطاقات المطبوعة وشاشات الاستقبال
              </span>
            </div>
            <code className="text-[#5A1020] font-mono bg-[#FFFFFF] border border-[#E8DED8] px-2.5 py-1 rounded-md font-semibold" dir="ltr">
              /qr/:slug
            </code>
          </div>
        </div>
      </Card>

      {/* Admin Profile Details */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#E8DED8] pb-3">
          <div className="p-2 rounded-lg bg-[#F6ECF0] text-[#5A1020]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#171316]">حساب الإدارة الحالي</h3>
            <p className="text-xs text-[#6F6668]">معلومات جلسة المدير المسجل في النظام</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
            <span className="text-[#9A8F92] block mb-1">الاسم:</span>
            <span className="text-[#171316] font-semibold">{user?.name}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
            <span className="text-[#9A8F92] block mb-1">البريد الإلكتروني:</span>
            <span className="text-[#171316] font-mono" dir="ltr">
              {user?.email}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
            <span className="text-[#9A8F92] block mb-1">الدور والصلاحية:</span>
            <span className="text-[#5A1020] font-semibold">{user?.role}</span>
          </div>
        </div>
      </Card>

      {/* Data Management & Cache */}
      <Card className="space-y-4 border-[#F8B6B2]">
        <div className="flex items-center justify-between border-b border-[#E8DED8] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FEECEB] text-[#B42318]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#171316]">
                إدارة الذاكرة والبيانات التجريبية
              </h3>
              <p className="text-xs text-[#6F6668]">
                إعادة ضبط مستودع التخزين المحلي لاستعادة البيانات التأسيسية الأولية
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#6F6668]">
            سيؤدي هذا الإجراء إلى إعادة تعيين الدعوات والعملاء إلى البيانات التأسيسية النظيفة.
          </p>
          <Button variant="danger" size="sm" onClick={handleResetStorage}>
            إعادة الضبط
          </Button>
        </div>
      </Card>
      </div>
      )}
    </div>
  );
};
