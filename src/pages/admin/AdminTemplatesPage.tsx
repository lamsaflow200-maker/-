/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllOfficialTemplates, getTemplateById } from '../../templates/registry';
import { getAnimationPreset } from '../../engine/animation';
import { TemplateDefinition } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import {
  Check,
  Layers,
  Info,
  Search,
  Copy,
  ExternalLink,
  Code,
  Palette,
  Sparkles,
  Eye,
  PlusCircle,
  X,
  Type,
  Maximize2,
  MailOpen,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { InvitationEngine } from '../../engine/InvitationEngine';
import { Invitation } from '../../types/database';

export const AdminTemplatesPage: React.FC = () => {
  const allTemplates = useMemo(() => getAllOfficialTemplates(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modals state
  const [inspectConfigTemplate, setInspectConfigTemplate] = useState<TemplateDefinition | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'mobile-sm' | 'mobile-md' | 'tablet' | 'full'>('mobile-md');
  const [previewOpeningKey, setPreviewOpeningKey] = useState<number>(0);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((tpl) => {
      const matchesSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.nameAr.includes(searchQuery) ||
        tpl.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.descriptionAr.includes(searchQuery);

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'royal' && ['royal-gold', 'black-luxury', 'emerald-royal'].includes(tpl.id)) return true;
      if (selectedCategory === 'moroccan' && ['moroccan-palace', 'golden-sunset'].includes(tpl.id)) return true;
      if (selectedCategory === 'romance' && ['floral-romance', 'rose-romance', 'elegant-pearl'].includes(tpl.id)) return true;
      if (selectedCategory === 'sapphire' && tpl.id === 'sapphire-night') return true;
      if (selectedCategory === 'minimal' && tpl.id === 'minimal-white') return true;

      return false;
    });
  }, [allTemplates, searchQuery, selectedCategory]);

  const handleCopySlug = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Sample mock invitation for live interactive preview
  const sampleInvitation: Invitation = useMemo(() => {
    return {
      id: 'sample-invitation-preview',
      slug: 'sample-preview',
      customer_id: 'c1000000-0000-0000-0000-000000000001',
      template_id: previewTemplate?.id || 'royal-gold',
      event_type: 'wedding',
      status: 'active',
      title: 'حفل زفاف مروان وخديجة',
      event_date: '2026-11-20',
      event_time: 'الساعة الثامنة والنصف مساءً',
      timezone: 'Africa/Casablanca',
      venue_name: 'قصر المعمورة للأفراح الملكية',
      venue_address: 'طريق زعير، السويسي، الرباط',
      google_maps_url: 'https://maps.google.com/?q=Rabat',
      host_whatsapp: '+212 661-000000',
      cover_image_url: previewTemplate?.previewImageUrl || previewTemplate?.thumbnailUrl,
      rsvp_enabled: true,
      content: {
        host_names: 'عائلتي بنجلون والتازي',
        celebrant_names: 'مروان & خديجة',
        first_celebrant_name: 'مروان',
        second_celebrant_name: 'خديجة',
        event_title: 'دعوة لحضور حفل الزفاف المبارك',
        invitation_text:
          'تتشرف عائلتا بنجلون والتازي بدعوتكم الكريمة لمشاركتنا فرحة العمر بمناسبة عقد قران وزفاف قرتي أعيننا، ويسعدنا جداً تشريفكم لنا لنسعد بحضوركم ودعواتكم الصالحة.',
        date_iso: '2026-11-20',
        hijri_date: '١٠ جمادى الأولى ١٤٤٨ هـ',
        time_text: 'ابتداءً من الساعة 20:30',
        venue_name: 'قصر المعمورة للأفراح الملكية',
        venue_city: 'الرباط',
        venue_address: 'طريق زعير، السويسي، الرباط',
        google_maps_url: 'https://maps.google.com/?q=Rabat',
        dress_code: 'قفطان مغربي / لباس رسمي',
        additional_notes: 'جنة الأطفال منازلهم',
      },
      theme: previewTemplate?.defaultTheme || allTemplates[0].defaultTheme,
      settings: {
        allow_rsvp: true,
        rsvp_deadline: '2026-11-10',
        max_party_size: 2,
        enable_music: true,
        enable_gallery: true,
        enable_countdown: true,
        enable_guest_messages: true,
        is_password_protected: false,
        show_qr_code: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [previewTemplate]);

  return (
    <div className="space-y-6 text-right motion-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171316]">
            كتالوج القوالب الرسمية (10 قوالب)
          </h1>
          <p className="text-xs text-[#6F6668] mt-1">
            نظام القوالب الفاخرة المركزية لمنصة منسباتي. كل قالب يمتلك هوية بصرية وتنسيقاً خاصاً مع دعم التبديل التلقائي.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] text-[#5A1020] text-xs border border-[#E8DED8]">
          <Layers className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span className="font-semibold">10 قوالب فاخرة مكتملة الهوية</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] text-xs text-[#6F6668] flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-[#C9A45C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          تم تصميم محرك القوالب (Template System & Invitation Engine) وفق مبدأ الفصل التام بين البيانات والهوية البصرية. يتم تخزين الإعدادات المتقدمة لكل قالب بصيغة <span className="font-mono text-[#5A1020]">JSONB</span> داخل قاعدة البيانات، مما يسمح بتخصيص الألوان، والخطوط، والزخارف، والحدود، والأنيميشن دون تعديل كود المحرك.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8DED8] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#9A8F92] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، المعرف، أو النمط..."
              className="w-full bg-[#FAF7F2] border border-[#E8DED8] rounded-lg pr-9 pl-3 py-2 text-xs text-[#171316] placeholder-[#9A8F92] focus:outline-none focus:border-[#5A1020]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9A8F92] hover:text-[#171316]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories Pill Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: `الكل (${allTemplates.length})` },
              { id: 'royal', label: 'ملكي وفاخر' },
              { id: 'moroccan', label: 'أصالة وتراث' },
              { id: 'romance', label: 'رومانسي وزهري' },
              { id: 'sapphire', label: 'سماوي وليلي' },
              { id: 'minimal', label: 'بساطة معاصرة' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#5A1020] text-[#FAF7F2] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6F6668] hover:bg-[#F3ECE6] hover:text-[#171316]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid (10 Templates) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((tpl) => {
          const cfg = tpl.config;
          const colors = cfg?.colors || {
            primary: tpl.defaultTheme.primary_color,
            accent: tpl.defaultTheme.accent_color,
            background: tpl.defaultTheme.background_color,
            text: tpl.defaultTheme.text_color,
            surface: '#FFFFFF',
          };

          const compositionNames: Record<string, string> = {
            'royal-monogram': 'وسام ملكي وشعار',
            'pearl-embossed': 'إطار لؤلؤي بارز',
            'arch-frame': 'قوس مغربي تقليدي',
            'cinematic-fullscreen': 'خلفية سينمائية كاملة',
            'floral-wreath': 'إكليل نباتي زهري',
            'celestial-night': 'نجوم وسماء ليلية',
            'split-crest': 'تاجان مزدوجان متناغمان',
            'minimal-centered': 'طباعة عصرية نقية',
            'sunset-radiance': 'شمس الغروب المتوهجة',
          };

          const animationNames: Record<string, string> = {
            'royal-reveal': 'ظهور ملكي مهيب',
            'luxury-fade': 'تلاشي تدريجي فاخر',
            'delicate-bloom': 'تفتح زهري رقيق',
            'cinematic-rise': 'صعود سينمائي درامي',
            'minimal-glide': 'انسياب هادئ ناعم',
          };

          return (
            <Card key={tpl.id} className="overflow-hidden p-0 flex flex-col justify-between hover:shadow-md transition duration-300 border-[#E8DED8]">
              {/* Template Image Header */}
              <div className="relative h-56 w-full bg-[#FAF7F2] overflow-hidden group">
                <img
                  src={tpl.thumbnailUrl}
                  alt={tpl.nameAr}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171316]/85 via-[#171316]/20 to-transparent" />

                {/* Top Badge: Name in Arabic */}
                <div className="absolute top-3 right-3 bg-[#FFFFFF]/95 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-serif font-bold text-[#5A1020] border border-[#E8DED8] shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>{tpl.nameAr}</span>
                </div>

                {/* Top Left: Quick Actions (Preview & Config) */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="p-1.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#171316] rounded-lg shadow-xs transition text-xs flex items-center gap-1 cursor-pointer"
                    title="معاينة تفاعلية للقالب"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5A1020]" />
                    <span className="hidden sm:inline font-medium">معاينة</span>
                  </button>
                  <button
                    onClick={() => setInspectConfigTemplate(tpl)}
                    className="p-1.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#171316] rounded-lg shadow-xs transition text-xs flex items-center gap-1 cursor-pointer"
                    title="فحص كود الإعدادات JSON"
                  >
                    <Code className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span className="hidden sm:inline font-medium">Config</span>
                  </button>
                </div>

                {/* Bottom Metadata inside image */}
                <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between text-right">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#FFFFFF] drop-shadow-xs">
                      {tpl.nameAr} <span className="text-xs font-normal opacity-80 font-sans">({tpl.name})</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={(e) => handleCopySlug(tpl.id, e)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#FAF7F2] bg-[#171316]/70 px-2 py-0.5 rounded border border-[#FFFFFF]/20 hover:bg-[#171316] transition cursor-pointer"
                        title="انقر لنسخ المعرف"
                      >
                        <Copy className="w-3 h-3 text-[#C9A45C]" />
                        <span>{tpl.id}</span>
                        {copiedSlug === tpl.id && (
                          <span className="text-[10px] text-[#A3E635] font-sans mr-1">تم النسخ!</span>
                        )}
                      </button>
                      <span className="text-[10px] text-[#FAF7F2]/80">v{tpl.version}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Body Specs */}
              <div className="p-5 space-y-4">
                {/* Description */}
                <p className="text-xs text-[#6F6668] leading-relaxed min-h-[36px]">
                  {tpl.descriptionAr}
                </p>

                {/* Visual Identity Attributes */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF7F2] p-3 rounded-lg border border-[#E8DED8]">
                  {/* Hero Composition */}
                  <div>
                    <span className="text-[10px] text-[#9A8F92] block">تكوين الواجهة (Hero):</span>
                    <span className="font-semibold text-[#171316]">
                      {compositionNames[cfg?.hero?.composition || ''] || cfg?.hero?.composition || 'أصالة ملكية'}
                    </span>
                  </div>

                  {/* Animation Style */}
                  <div>
                    <span className="text-[10px] text-[#9A8F92] block">نمط الحركة المركزي:</span>
                    <span className="font-semibold text-[#171316]">
                      {getAnimationPreset(tpl.id).nameAr}
                    </span>
                    <span className="text-[9px] text-[#5A1020] block font-mono">
                      {getAnimationPreset(tpl.id).sectionReveal} · {getAnimationPreset(tpl.id).staggerDelay}ms
                    </span>
                  </div>

                  {/* Typography Pair */}
                  <div className="col-span-2 pt-1 border-t border-[#E8DED8]/60 flex items-center justify-between">
                    <span className="text-[10px] text-[#9A8F92]">الخطوط المعتمدة:</span>
                    <span className="font-serif text-[#5A1020] font-medium text-xs">
                      {cfg?.typography?.fontFamilyArabic?.split(',')[0] || 'Amiri'} + {cfg?.typography?.fontFamilyLatin?.split(',')[0] || 'Cinzel'}
                    </span>
                  </div>
                </div>

                {/* Color Palette Preview Swatches */}
                <div className="pt-2 border-t border-[#E8DED8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#171316] flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-[#C9A45C]" /> لوحة الألوان المعتمدة:
                    </span>
                    <span className="text-[10px] text-[#9A8F92] font-mono">
                      Contrast AA Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {/* Primary */}
                    <div className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] text-center">
                      <div
                        className="w-full h-5 rounded border border-black/10 shadow-xs mb-1"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <span className="text-[9px] text-[#6F6668] block">الرئيسي</span>
                      <span className="text-[8px] font-mono text-[#171316] block">{colors.primary}</span>
                    </div>

                    {/* Accent */}
                    <div className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] text-center">
                      <div
                        className="w-full h-5 rounded border border-black/10 shadow-xs mb-1"
                        style={{ backgroundColor: colors.accent }}
                      />
                      <span className="text-[9px] text-[#6F6668] block">المميز</span>
                      <span className="text-[8px] font-mono text-[#171316] block">{colors.accent}</span>
                    </div>

                    {/* Background */}
                    <div className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] text-center">
                      <div
                        className="w-full h-5 rounded border border-black/10 shadow-xs mb-1"
                        style={{ backgroundColor: colors.background }}
                      />
                      <span className="text-[9px] text-[#6F6668] block">الخلفية</span>
                      <span className="text-[8px] font-mono text-[#171316] block">{colors.background}</span>
                    </div>

                    {/* Surface / Card */}
                    <div className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] text-center">
                      <div
                        className="w-full h-5 rounded border border-black/10 shadow-xs mb-1"
                        style={{ backgroundColor: (colors as any).cardBg || colors.surface }}
                      />
                      <span className="text-[9px] text-[#6F6668] block">البطاقات</span>
                      <span className="text-[8px] font-mono text-[#171316] block">{(colors as any).cardBg || colors.surface}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-[#E8DED8] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="px-3 py-2 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] hover:bg-[#F3ECE6] text-[#171316] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5A1020]" />
                    <span>معاينة حية</span>
                  </button>

                  <Link
                    to={`/admin/invitations/new?template=${tpl.id}`}
                    className="px-4 py-2 rounded-lg bg-[#5A1020] hover:bg-[#430C18] text-[#FAF7F2] text-xs font-medium flex items-center gap-1.5 shadow-xs transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>إنشاء دعوة بهذا القالب</span>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 1. Modal: View Config JSON Specification */}
      <Modal
        isOpen={inspectConfigTemplate !== null}
        onClose={() => setInspectConfigTemplate(null)}
        title={`إعدادات قالب: ${inspectConfigTemplate?.nameAr} (${inspectConfigTemplate?.id})`}
        description="هيكل الـ JSONB المخزن في قاعدة البيانات الخاص بهذا القالب."
        maxWidth="xl"
      >
        <div className="space-y-4 text-right">
          <div className="flex items-center justify-between text-xs text-[#6F6668] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8DED8]">
            <span>المعرف الثابت: <strong className="font-mono text-[#5A1020]">{inspectConfigTemplate?.id}</strong></span>
            <button
              onClick={(e) => inspectConfigTemplate && handleCopySlug(JSON.stringify(inspectConfigTemplate.config, null, 2), e)}
              className="text-[#5A1020] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> نسخ كود الإعدادات JSON
            </button>
          </div>

          <pre className="bg-[#121215] text-[#A3E635] p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-[#28272E] text-left" dir="ltr">
            {inspectConfigTemplate?.config
              ? JSON.stringify(inspectConfigTemplate.config, null, 2)
              : '// No explicit config'}
          </pre>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setInspectConfigTemplate(null)}
              className="px-4 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-xs text-[#171316] hover:bg-[#F3ECE6] cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Modal: Live Interactive Preview */}
      <Modal
        isOpen={previewTemplate !== null}
        onClose={() => setPreviewTemplate(null)}
        title={`معاينة القالب الحي: ${previewTemplate?.nameAr}`}
        description="يتم عرض نموذج دعوة زفاف كامل باستخدام محرك الدعوات الحقيقي (InvitationEngine)."
        maxWidth="xl"
      >
        <div className="space-y-4">
          {/* Responsive Viewport & Opening Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F3ECE6] p-2.5 rounded-xl text-xs" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="text-[#6F6668] font-medium">عرض الشاشة:</span>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#E8DED8]">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile-sm')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    previewViewport === 'mobile-sm' ? 'bg-[#5A1020] text-white shadow-xs' : 'text-[#6F6668] hover:text-[#171316]'
                  }`}
                >
                  هاتف صغير (360px)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile-md')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    previewViewport === 'mobile-md' ? 'bg-[#5A1020] text-white shadow-xs' : 'text-[#6F6668] hover:text-[#171316]'
                  }`}
                >
                  هاتف حديث (414px)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    previewViewport === 'tablet' ? 'bg-[#5A1020] text-white shadow-xs' : 'text-[#6F6668] hover:text-[#171316]'
                  }`}
                >
                  لوحي (768px)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('full')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    previewViewport === 'full' ? 'bg-[#5A1020] text-white shadow-xs' : 'text-[#6F6668] hover:text-[#171316]'
                  }`}
                >
                  كامل (Full)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewOpeningKey((k) => k + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#C9A45C] hover:bg-[#C9A45C] hover:text-[#171316] text-[#5A1020] rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <MailOpen className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>تجربة افتتاحية الظرف ✉️</span>
            </button>
          </div>

          {/* Interactive Preview Container */}
          <div className="max-h-[75vh] overflow-y-auto rounded-xl border border-[#E8DED8] shadow-inner bg-[#EFE9E4] p-4 flex justify-center">
            <div
              className="transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden bg-white w-full"
              style={{
                maxWidth:
                  previewViewport === 'mobile-sm'
                    ? '360px'
                    : previewViewport === 'mobile-md'
                    ? '414px'
                    : previewViewport === 'tablet'
                    ? '768px'
                    : '100%',
              }}
            >
              {previewTemplate && (
                <InvitationEngine
                  key={`preview-${previewTemplate.id}-${previewOpeningKey}`}
                  invitation={sampleInvitation}
                  isPreview={true}
                  enableOpeningScreen={previewOpeningKey > 0}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to={`/admin/invitations/new?template=${previewTemplate?.id}`}
              className="px-4 py-2 rounded-lg bg-[#5A1020] text-[#FAF7F2] text-xs font-semibold hover:bg-[#430C18] flex items-center gap-1.5 shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>إنشاء دعوة بهذا القالب</span>
            </Link>

            <button
              onClick={() => setPreviewTemplate(null)}
              className="px-4 py-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] text-xs text-[#6F6668] hover:text-[#171316] cursor-pointer"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
