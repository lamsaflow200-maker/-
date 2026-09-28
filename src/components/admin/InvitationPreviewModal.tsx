/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Invitation, TemplateRecord } from '../../types/database';
import { InvitationEngine } from '../../engine/InvitationEngine';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import {
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  ShieldAlert,
  Layers,
  Heart,
  FileText,
  Smartphone,
  Eye,
} from 'lucide-react';

export interface InvitationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: Invitation | null;
  customerName?: string;
  template?: TemplateRecord | null;
}

export const InvitationPreviewModal: React.FC<InvitationPreviewModalProps> = ({
  isOpen,
  onClose,
  invitation,
  customerName,
  template,
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'overview'>('interactive');

  if (!invitation) return null;

  const isPublicReady = invitation.status === 'active' && !invitation.deleted_at;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="معاينة محرك الدعوات الرقمي (Dynamic Engine Preview)"
      description="نظرة مسبقة على الدعوة كما تظهر للضيوف على الأجهزة الذكية"
      maxWidth="xl"
    >
      <div className="space-y-4 text-right">
        {/* Top Controls: Switch between Interactive Phone Preview and Data Overview */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DED8]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'interactive'
                  ? 'bg-[#5A1020] text-[#FFFFFF] shadow-2xs'
                  : 'text-[#6F6668] hover:text-[#171316]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>معاينة الهاتف التفاعلية</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'overview'
                  ? 'bg-[#5A1020] text-[#FFFFFF] shadow-2xs'
                  : 'text-[#6F6668] hover:text-[#171316]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ملخص البيانات الأساسية</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] text-[#6F6668] font-mono">الحالة:</span>
            <StatusBadge status={invitation.status} size="sm" />
          </div>
        </div>

        {/* View Mode 1: Interactive Mobile View Frame */}
        {viewMode === 'interactive' && (
          <div className="relative py-2 flex justify-center bg-[#FAF7F2]/60 rounded-2xl border border-[#E8DED8]">
            <div className="w-full max-w-sm rounded-[2rem] border-4 border-[#171316] shadow-xl overflow-hidden bg-[#FAF7F2] flex flex-col max-h-[640px]">
              {/* Fake Mobile Top Notch & Speaker */}
              <div className="w-full bg-[#171316] py-1.5 flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-[#453E40]" />
              </div>

              {/* Engine Scrollable Area */}
              <div className="flex-1 overflow-y-auto">
                <InvitationEngine
                  invitation={invitation}
                  customer={{
                    id: invitation.customer_id,
                    full_name: customerName || 'صاحب الدعوة',
                    phone: invitation.host_whatsapp || '',
                    created_at: '',
                    updated_at: '',
                  }}
                  isPreview={true}
                />
              </div>

              {/* Fake Mobile Bottom Bar */}
              <div className="w-full bg-[#FAF7F2] py-2 flex items-center justify-center border-t border-[#E8DED8]">
                <div className="w-24 h-1 rounded-full bg-[#171316]/30" />
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: Data Overview */}
        {viewMode === 'overview' && (
          <div className="space-y-4">
            {/* Status Notice */}
            {!isPublicReady ? (
              <div className="p-3 rounded-lg bg-[#FEF6E7] border border-[#F7DBA7] text-xs text-[#8B5B16] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#B7791F]" />
                <span>
                  هذه الدعوة في حالة <strong className="text-[#171316]">"{invitation.status}"</strong>. الرابط العام لا يفتح للزوار إلا بعد التفعيل كـ "Active".
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#EDF7EE] border border-[#BFE4C6] text-xs text-[#175E27] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#218739]" />
                  <span>الدعوة نشطة ومتاحة للزوار عبر الرابط العام</span>
                </div>
                <a
                  href={`/i/${invitation.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#175E27] underline flex items-center gap-1"
                >
                  <span>فتح الرابط</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Key Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">صاحب المناسبة</span>
                <strong className="text-[#171316] truncate block">{customerName || 'غير محدد'}</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">نوع المناسبة</span>
                <span className="font-medium text-[#5A1020]">{invitation.event_type}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">القالب المعتمد</span>
                <strong className="text-[#171316]">
                  {template?.name_ar || template?.name || invitation.template_id}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">الرابط العام (Slug)</span>
                <span dir="ltr" className="font-mono text-[11px] text-[#C9A45C] block truncate">
                  /i/{invitation.slug}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">تأكيد الحضور (RSVP)</span>
                <span className={invitation.rsvp_enabled ? 'text-[#218739] font-bold' : 'text-[#9A8F92]'}>
                  {invitation.rsvp_enabled ? 'مفعلة' : 'غير مفعلة'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DED8]">
                <span className="text-[10px] text-[#6F6668] block">تاريخ المناسبة</span>
                <span className="font-mono text-[#171316]">
                  {invitation.event_date || invitation.content?.date_iso || 'غير محدد'}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] space-y-2 text-xs">
              <h4 className="font-bold text-[#171316] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C9A45C]" />
                محتوى الدعوة
              </h4>

              {invitation.content?.celebrant_names && (
                <p className="text-sm font-serif font-bold text-[#5A1020]">
                  {invitation.content.celebrant_names}
                </p>
              )}

              {invitation.content?.invitation_text && (
                <p className="text-xs text-[#171316] leading-relaxed whitespace-pre-wrap">
                  {invitation.content.invitation_text}
                </p>
              )}

              <div className="pt-2 border-t border-[#E8DED8] flex flex-wrap gap-4 text-xs text-[#6F6668]">
                {invitation.venue_name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
                    {invitation.venue_name}
                  </span>
                )}
                {invitation.host_whatsapp && (
                  <span className="flex items-center gap-1 font-mono" dir="ltr">
                    <Phone className="w-3.5 h-3.5 text-[#218739]" />
                    {invitation.host_whatsapp}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8DED8]">
          <Button variant="secondary" size="md" onClick={onClose}>
            إغلاق
          </Button>

          {isPublicReady && (
            <a href={`/i/${invitation.slug}`} target="_blank" rel="noreferrer">
              <Button
                variant="primary"
                size="md"
                icon={<ExternalLink className="w-4 h-4" />}
              >
                فتح الرابط العام في المتصفح
              </Button>
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};
