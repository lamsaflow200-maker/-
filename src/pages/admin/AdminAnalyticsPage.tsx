/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../../db';
import { Invitation } from '../../types/database';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  BarChart3,
  ArrowRight,
  Eye,
  Share2,
  CheckCircle2,
  XCircle,
  Users,
  MapPin,
  MessageCircle,
  Smartphone,
  Monitor,
  Tablet,
  QrCode,
  Music,
  Image,
  Video,
  MailOpen,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

type DateRangeFilter = 'today' | '7d' | '30d' | 'all';

export const AdminAnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialInvId = searchParams.get('invitation_id') || 'all';

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>(initialInvId);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detailed metrics
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    invitationsOpened: 0,
    rsvpConfirmed: 0,
    rsvpDeclined: 0,
    totalAttendees: 0,
    mapClicks: 0,
    whatsappClicks: 0,
    shareClicks: 0,
    galleryOpens: 0,
    videoPlays: 0,
    musicPlays: 0,
    qrScans: 0,
    devices: { mobile: 0, tablet: 0, desktop: 0 },
    viewsOverTime: [] as { date: string; views: number; uniqueViews: number }[],
    topEvents: [] as { eventType: string; labelAr: string; count: number }[],
  });

  // Load Invitations on Mount
  useEffect(() => {
    async function loadInvitations() {
      try {
        const list = await db.invitations.getAll();
        setInvitations(list);
      } catch (err) {
        console.error('Failed to load invitations for analytics:', err);
      }
    }
    loadInvitations();
  }, []);

  // Load Stats on selection or filter change
  const fetchStats = async (showSpin: boolean = false) => {
    try {
      if (showSpin) setIsRefreshing(true);
      else setLoading(true);

      const data = await db.analytics.getDetailedStats(
        selectedInvitationId === 'all' ? undefined : selectedInvitationId,
        dateRange
      );
      setStats(data);
    } catch (err) {
      console.error('Failed to load detailed analytics stats:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
  }, [selectedInvitationId, dateRange]);

  const handleInvitationChange = (id: string) => {
    setSelectedInvitationId(id);
    if (id === 'all') {
      searchParams.delete('invitation_id');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ invitation_id: id });
    }
  };

  // Device percentage helpers
  const totalDeviceEvents =
    stats.devices.mobile + stats.devices.tablet + stats.devices.desktop || 1;
  const mobilePct = Math.round((stats.devices.mobile / totalDeviceEvents) * 100);
  const tabletPct = Math.round((stats.devices.tablet / totalDeviceEvents) * 100);
  const desktopPct = Math.round((stats.devices.desktop / totalDeviceEvents) * 100);

  // Maximum value for time chart bars
  const maxDayViews = useMemo(() => {
    return Math.max(...stats.viewsOverTime.map((d) => d.views), 1);
  }, [stats.viewsOverTime]);

  const selectedInvitation = useMemo(() => {
    return invitations.find((i) => i.id === selectedInvitationId);
  }, [invitations, selectedInvitationId]);

  return (
    <div className="space-y-6 text-right motion-fade-in select-none pb-16" dir="rtl">
      {/* 1. Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DED8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
              لوحة التحليلات ومؤشرات التفاعل (Analytics Dashboard)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F2] text-[#5A1020] border border-[#E8DED8]">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-[#6F6668] mt-1">
            متابعة المشاهدات الحقيقية، والزيارات الفريدة، وردود الحضور وتفاعل الزوار مع الدعوة
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Invitation Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-[#E8DED8] rounded-xl px-2.5 py-1 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#C9A45C]" />
            <select
              value={selectedInvitationId}
              onChange={(e) => handleInvitationChange(e.target.value)}
              className="text-xs font-medium text-[#171316] bg-transparent outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
            >
              <option value="all">جميع الدعوات (كافة المناسبات)</option>
              {invitations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] border border-[#E8DED8] rounded-xl">
            {(
              [
                { id: 'today', label: 'اليوم' },
                { id: '7d', label: 'آخر 7 أيام' },
                { id: '30d', label: 'آخر 30 يوم' },
                { id: 'all', label: 'الكل' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setDateRange(filter.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  dateRange === filter.id
                    ? 'bg-[#5A1020] text-[#FAF7F2] shadow-xs'
                    : 'text-[#6F6668] hover:text-[#171316]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchStats(true)}
            className="p-2 rounded-xl border border-[#E8DED8] bg-white text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2] transition cursor-pointer shadow-2xs"
            title="تحديث الإحصائيات"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C9A45C]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selected Invitation Scoped Indicator */}
      {selectedInvitation && (
        <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#C9A45C]/40 text-xs text-[#5A1020] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A45C]" />
            <span>
              عرض تحليلات مخصصة للدعوة: <strong>{selectedInvitation.title}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleInvitationChange('all')}
            className="text-[11px] text-[#C9A45C] hover:underline cursor-pointer"
          >
            إلغاء التخصيص وعرض الكل
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" text="جاري استخراج وتحليل بيانات التفاعل الحقيقية..." />
        </div>
      ) : (
        <>
          {/* 2. Primary KPI Metric Cards (Prompt 18 Requirement 29) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* KPI 1: Total Page Views */}
            <Card className="flex flex-col justify-between border-[#E8DED8] hover:border-[#C9A45C]/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#6F6668]">إجمالي المشاهدات</span>
                <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#5A1020]">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#171316] font-mono tabular-nums">
                  {stats.totalViews}
                </span>
                <p className="text-[10px] text-[#6F6668] mt-0.5">مشاهدات الصفحة العامة</p>
              </div>
            </Card>

            {/* KPI 2: Unique Visitors */}
            <Card className="flex flex-col justify-between border-[#E8DED8] hover:border-[#C9A45C]/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#6F6668]">الزوار الفريدون</span>
                <div className="p-1.5 rounded-lg bg-[#EDF7EE] text-[#175E27]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#175E27] font-mono tabular-nums">
                  {stats.uniqueVisitors}
                </span>
                <p className="text-[10px] text-[#6F6668] mt-0.5">زوار بجلسات مستقلة</p>
              </div>
            </Card>

            {/* KPI 3: Invitations Opened */}
            <Card className="flex flex-col justify-between border-[#E8DED8] hover:border-[#C9A45C]/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#6F6668]">فتح الظرف والبطاقة</span>
                <div className="p-1.5 rounded-lg bg-[#F6ECF0] text-[#5A1020]">
                  <MailOpen className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#5A1020] font-mono tabular-nums">
                  {stats.invitationsOpened}
                </span>
                <p className="text-[10px] text-[#6F6668] mt-0.5">تفاعل مع الافتتاحية</p>
              </div>
            </Card>

            {/* KPI 4: RSVP Confirmed */}
            <Card className="flex flex-col justify-between border-[#BFE4C6] bg-[#F6FCF7]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#18642A]">تأكيدات الحضور</span>
                <div className="p-1.5 rounded-lg bg-[#E2F5E5] text-[#218739]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#218739] font-mono tabular-nums">
                  {stats.rsvpConfirmed}
                </span>
                <p className="text-[10px] text-[#18642A]/80 mt-0.5">ردود مؤكدة رسمياً</p>
              </div>
            </Card>

            {/* KPI 5: RSVP Declined */}
            <Card className="flex flex-col justify-between border-[#F8B6B2] bg-[#FFF8F8]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#912018]">الاعتذارات</span>
                <div className="p-1.5 rounded-lg bg-[#FEECEB] text-[#B42318]">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#B42318] font-mono tabular-nums">
                  {stats.rsvpDeclined}
                </span>
                <p className="text-[10px] text-[#912018]/80 mt-0.5">اعتذار بمحبة</p>
              </div>
            </Card>

            {/* KPI 6: Total Confirmed Attendees */}
            <Card className="flex flex-col justify-between border-[#C9A45C]/50 bg-[#FDFBF7]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#8F6A1E]">مجموع الحاضرين</span>
                <div className="p-1.5 rounded-lg bg-[#FBF3E0] text-[#9F7C36]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#8F6A1E] font-mono tabular-nums">
                  {stats.totalAttendees}
                </span>
                <p className="text-[10px] text-[#8F6A1E]/80 mt-0.5">فرد مؤكد الحضور</p>
              </div>
            </Card>
          </div>

          {/* 3. Charts & Analytics Visualizations (Prompt 18 Requirement 32) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart A: Views Over Time (2 Columns) */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DED8] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#5A1020]/10 text-[#5A1020]">
                    <BarChart3 className="w-4 h-4 text-[#C9A45C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#171316]">
                      مشاهدات الدعوة اليومية (Views Over Time)
                    </h3>
                    <p className="text-[11px] text-[#6F6668]">
                      توزيع المشاهدات العامة والزوار الفريدين على الأيام
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#5A1020]" />
                    <span className="text-[#6F6668]">المشاهدات</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#C9A45C]" />
                    <span className="text-[#6F6668]">فريدون</span>
                  </span>
                </div>
              </div>

              {/* Bar Chart Bars */}
              {stats.viewsOverTime.length === 0 || maxDayViews === 1 && stats.totalViews === 0 ? (
                <div className="py-16 text-center text-xs text-[#6F6668] bg-[#FAF7F2] rounded-xl border border-dashed border-[#E8DED8] p-4">
                  لا توجد مشاهدات مسجلة في هذا النطاق الزمني حتى الآن.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="h-44 flex items-end gap-2 sm:gap-4 pt-4 px-2 border-b border-[#E8DED8]">
                    {stats.viewsOverTime.map((item, idx) => {
                      const viewHeight = Math.max(12, Math.round((item.views / maxDayViews) * 100));
                      const uniqueHeight = Math.max(6, Math.round((item.uniqueViews / maxDayViews) * 100));
                      const dayLabel = new Date(item.date).toLocaleDateString('ar-MA', {
                        weekday: 'short',
                        day: 'numeric',
                      });

                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#171316] text-white text-[10px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                            {item.views} مشاهدة | {item.uniqueViews} فريد
                          </div>

                          <div className="w-full flex items-end justify-center gap-1 h-full">
                            {/* Views Bar */}
                            <div
                              className="w-3 sm:w-5 bg-[#5A1020] rounded-t-sm transition-all duration-300 group-hover:bg-[#721529]"
                              style={{ height: `${viewHeight}%` }}
                            />
                            {/* Unique Views Bar */}
                            <div
                              className="w-2.5 sm:w-4 bg-[#C9A45C] rounded-t-sm transition-all duration-300 group-hover:bg-[#D8B46C]"
                              style={{ height: `${uniqueHeight}%` }}
                            />
                          </div>

                          <span className="text-[10px] text-[#9A8F92] font-mono block mt-1 truncate max-w-full">
                            {dayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chart B: Device Analytics (1 Column) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E8DED8] pb-3">
                <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#5A1020]">
                  <Smartphone className="w-4 h-4 text-[#C9A45C]" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#171316]">
                    توزيع الأجهزة (Device Analytics)
                  </h3>
                  <p className="text-[11px] text-[#6F6668]">
                    أنواع الأجهزة المستخدمة من قبل الضيوف
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {/* Mobile */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171316] flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#5A1020]" />
                      <span>الهواتف الذكية (Mobile)</span>
                    </span>
                    <span className="font-mono font-bold text-[#5A1020]">
                      {stats.devices.mobile} ({mobilePct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FAF7F2] border border-[#E8DED8] overflow-hidden">
                    <div
                      className="h-full bg-[#5A1020] rounded-full transition-all duration-500"
                      style={{ width: `${mobilePct}%` }}
                    />
                  </div>
                </div>

                {/* Desktop */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171316] flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>الحواسيب المكتبية (Desktop)</span>
                    </span>
                    <span className="font-mono font-bold text-[#C9A45C]">
                      {stats.devices.desktop} ({desktopPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FAF7F2] border border-[#E8DED8] overflow-hidden">
                    <div
                      className="h-full bg-[#C9A45C] rounded-full transition-all duration-500"
                      style={{ width: `${desktopPct}%` }}
                    />
                  </div>
                </div>

                {/* Tablet */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171316] flex items-center gap-1.5">
                      <Tablet className="w-3.5 h-3.5 text-[#218739]" />
                      <span>الأجهزة اللوحية (Tablet)</span>
                    </span>
                    <span className="font-mono font-bold text-[#218739]">
                      {stats.devices.tablet} ({tabletPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FAF7F2] border border-[#E8DED8] overflow-hidden">
                    <div
                      className="h-full bg-[#218739] rounded-full transition-all duration-500"
                      style={{ width: `${tabletPct}%` }}
                    />
                  </div>
                </div>

                {/* Coarse Location Indicator */}
                <div className="pt-3 border-t border-[#E8DED8] text-[11px] text-[#6F6668] leading-relaxed">
                  🌍 <strong>النطاق الجغرافي:</strong> المملكة المغربية (Casablanca/Rabat)
                  دون جمع أي إحداثيات GPS دقيقة لحماية خصوصية الزوار.
                </div>
              </div>
            </div>
          </div>

          {/* 4. Interactions Breakdown & Feature Telemetry (Prompt 18 Requirement 30 & 32) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8DED8] pb-3">
              <div className="p-2 rounded-xl bg-[#F6ECF0] text-[#5A1020]">
                <Activity className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#171316]">
                  تفاعل الزوار مع خصائص الدعوة (Interactions Breakdown)
                </h3>
                <p className="text-[11px] text-[#6F6668]">
                  إحصاء النقرات على الخرائط، والتواصل عبر WhatsApp، والمشاركات، والميديا
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* Interaction 1: Map Clicks */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-1">
                <MapPin className="w-4 h-4 mx-auto text-[#C9A45C]" />
                <span className="text-[11px] text-[#6F6668] block">خرائط Google Maps</span>
                <strong className="text-base font-serif font-bold text-[#171316] font-mono">
                  {stats.mapClicks}
                </strong>
              </div>

              {/* Interaction 2: WhatsApp Clicks */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-1">
                <MessageCircle className="w-4 h-4 mx-auto text-[#1E7E34]" />
                <span className="text-[11px] text-[#6F6668] block">تواصل WhatsApp</span>
                <strong className="text-base font-serif font-bold text-[#1E7E34] font-mono">
                  {stats.whatsappClicks}
                </strong>
              </div>

              {/* Interaction 3: Shares */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-1">
                <Share2 className="w-4 h-4 mx-auto text-[#5A1020]" />
                <span className="text-[11px] text-[#6F6668] block">مشاركات الرابط</span>
                <strong className="text-base font-serif font-bold text-[#5A1020] font-mono">
                  {stats.shareClicks}
                </strong>
              </div>

              {/* Interaction 4: QR Scans */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-1">
                <QrCode className="w-4 h-4 mx-auto text-[#171316]" />
                <span className="text-[11px] text-[#6F6668] block">مسح الـ QR Code</span>
                <strong className="text-base font-serif font-bold text-[#171316] font-mono">
                  {stats.qrScans}
                </strong>
              </div>

              {/* Interaction 5: Gallery Opens */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-1">
                <Image className="w-4 h-4 mx-auto text-[#027A48]" />
                <span className="text-[11px] text-[#6F6668] block">ألبوم الصور</span>
                <strong className="text-base font-serif font-bold text-[#027A48] font-mono">
                  {stats.galleryOpens}
                </strong>
              </div>

              {/* Interaction 6: Video Plays */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-1">
                <Video className="w-4 h-4 mx-auto text-[#5925DC]" />
                <span className="text-[11px] text-[#6F6668] block">فيديو المناسبة</span>
                <strong className="text-base font-serif font-bold text-[#5925DC] font-mono">
                  {stats.videoPlays}
                </strong>
              </div>

              {/* Interaction 7: Music Plays */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-1">
                <Music className="w-4 h-4 mx-auto text-[#B7791F]" />
                <span className="text-[11px] text-[#6F6668] block">الموسيقى الصوتية</span>
                <strong className="text-base font-serif font-bold text-[#B7791F] font-mono">
                  {stats.musicPlays}
                </strong>
              </div>
            </div>
          </div>

          {/* 5. Top Events Table (Prompt 18 Requirement 34) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DED8] pb-3">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#171316]">
                  ترتيب الأحداث والعمليات (Top Interaction Events)
                </h3>
                <p className="text-[11px] text-[#6F6668]">
                  تفصيل إحصائي دقيق لكافة السلوكيات الموثقة بأعلى معدلات الحدوث
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E8DED8]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#FAF7F2] text-[#6F6668] border-b border-[#E8DED8] font-serif">
                  <tr>
                    <th className="py-3 px-4 font-bold">اسم الحدث (Event Action)</th>
                    <th className="py-3 px-4 font-bold">معرف الحدث (Type)</th>
                    <th className="py-3 px-4 font-bold">مجموع التكرار</th>
                    <th className="py-3 px-4 font-bold">نسبة التفاعل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DED8]">
                  {stats.topEvents.map((ev, index) => {
                    const totalAllEvents =
                      stats.topEvents.reduce((s, e) => s + e.count, 0) || 1;
                    const pct = Math.round((ev.count / totalAllEvents) * 100);

                    return (
                      <tr key={index} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="py-3 px-4 font-medium text-[#171316]">
                          {ev.labelAr}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#5A1020]" dir="ltr">
                          {ev.eventType}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#171316]">
                          {ev.count}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-[#FAF7F2] border border-[#E8DED8] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5A1020] rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-[#6F6668]">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
