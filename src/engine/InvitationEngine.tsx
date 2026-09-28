/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo } from 'react';
import {
  Invitation,
  Customer,
  InvitationSection,
  GalleryItem,
  InvitationVideo,
  MusicTrack,
} from '../types/database';
import { PublicInvitationViewModel } from '../types/engine';
import { resolveTemplateAdapter } from './TemplateAdapter';
import { TemplateRenderer } from './TemplateRenderer';
import { OpeningEngine } from './opening';
import { InvitationAnimationEngine } from './animation';
import { InvitationMusicPlayer } from './music';
import { analyticsEngine } from '../services/analytics/InvitationAnalyticsEngine';
import { db } from '../db';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Clock, PauseCircle, AlertTriangle, Sparkles, Eye, Shield, MailOpen } from 'lucide-react';

export interface InvitationEngineProps {
  invitation: Invitation;
  customer?: Customer | null;
  sections?: InvitationSection[];
  gallery?: GalleryItem[];
  videos?: InvitationVideo[];
  music?: MusicTrack | null;
  isPreview?: boolean;
  enableOpeningScreen?: boolean;
  onUserInteraction?: () => void;
}

export const InvitationEngine: React.FC<InvitationEngineProps> = ({
  invitation,
  customer,
  sections = [],
  gallery = [],
  videos = [],
  music = null,
  isPreview = false,
  enableOpeningScreen = !isPreview,
  onUserInteraction,
}) => {
  // Opening State (Prompt 12 requirement: Opens first on public invitation, can be tested in preview)
  const [isOpened, setIsOpened] = React.useState<boolean>(() => {
    return !enableOpeningScreen;
  });

  const [hasUserInteracted, setHasUserInteracted] = React.useState<boolean>(false);

  const handleUserInteraction = () => {
    setHasUserInteracted(true);
    onUserInteraction?.();
  };

  // 1. Analytics telemetry: track visit, unique view, and qr scan on mount if public (Prompt 18)
  useEffect(() => {
    if (!isPreview && invitation.status === 'active' && !invitation.deleted_at) {
      analyticsEngine.trackVisit(invitation.id);
    }
  }, [invitation.id, isPreview, invitation.status, invitation.deleted_at]);

  // 2. Resolve Template Adapter (Adapter architecture)
  const adapter = useMemo(() => {
    return resolveTemplateAdapter(invitation.template_id, {
      primaryColor: invitation.theme?.primary_color,
      accentColor: invitation.theme?.accent_color,
      backgroundColor: invitation.theme?.background_color,
      textColor: invitation.theme?.text_color,
      fontFamilyArabic: invitation.theme?.font_family_arabic,
      fontFamilyLatin: invitation.theme?.font_family_latin,
    });
  }, [invitation.template_id, invitation.theme]);

  // 3. Transform to sanitized Public View Model (safe from private data leakage)
  const publicViewModel: PublicInvitationViewModel = useMemo(() => {
    return {
      id: invitation.id,
      slug: invitation.slug,
      templateId: invitation.template_id || adapter.id,
      eventType: invitation.event_type,
      title: invitation.title,
      status: invitation.status,
      coverImageUrl: invitation.cover_image_url,
      hostWhatsapp: invitation.host_whatsapp || customer?.phone,
      eventDate: invitation.event_date || invitation.content?.date_iso,
      eventTime: invitation.event_time || invitation.content?.time_text,
      timezone: invitation.timezone || 'Africa/Casablanca',
      venueName: invitation.venue_name || invitation.content?.venue_name,
      venueAddress: invitation.venue_address || invitation.content?.venue_address,
      googleMapsUrl: invitation.google_maps_url || invitation.content?.google_maps_url,
      expiresAt: invitation.expires_at,
      content: {
        hostNames: invitation.content?.host_names || '',
        celebrantNames: invitation.content?.celebrant_names || '',
        firstCelebrantName: invitation.content?.first_celebrant_name,
        secondCelebrantName: invitation.content?.second_celebrant_name,
        eventTitle: invitation.content?.event_title || invitation.title,
        invitationText: invitation.content?.invitation_text || '',
        dateIso: invitation.content?.date_iso || invitation.event_date || '',
        hijriDate: invitation.content?.hijri_date,
        timeText: invitation.content?.time_text || invitation.event_time || '',
        venueName: invitation.content?.venue_name || invitation.venue_name || '',
        venueCity: invitation.content?.venue_city || '',
        venueAddress: invitation.content?.venue_address || invitation.venue_address,
        googleMapsUrl: invitation.content?.google_maps_url || invitation.google_maps_url,
        dressCode: invitation.content?.dress_code,
        additionalNotes: invitation.content?.additional_notes,
      },
      theme: {
        primary_color: invitation.theme?.primary_color || adapter.style.primaryColor,
        accent_color: invitation.theme?.accent_color || adapter.style.accentColor,
        background_color: invitation.theme?.background_color || adapter.style.backgroundColor,
        text_color: invitation.theme?.text_color || adapter.style.textColor,
        font_family_arabic: invitation.theme?.font_family_arabic || adapter.style.fontFamilyArabic,
        font_family_latin: invitation.theme?.font_family_latin || adapter.style.fontFamilyLatin,
      },
      settings: {
        allowRsvp: invitation.settings?.allow_rsvp ?? invitation.rsvp_enabled ?? true,
        rsvpDeadline: invitation.settings?.rsvp_deadline,
        maxPartySize: invitation.settings?.max_party_size ?? 4,
        enableMusic: invitation.settings?.enable_music ?? false,
        enableGallery: invitation.settings?.enable_gallery ?? false,
        enableCountdown: invitation.settings?.enable_countdown ?? true,
        enableGuestMessages: invitation.settings?.enable_guest_messages ?? true,
        showQrCode: invitation.settings?.show_qr_code ?? true,
      },
      sections,
      gallery,
      videos,
      music,
    };
  }, [invitation, customer, sections, gallery, videos, music, adapter]);

  // 4. RSVP submission handler
  const handleRsvpSubmit = async (data: {
    guestName: string;
    phone?: string;
    attendanceStatus: 'attending' | 'declined' | 'tentative';
    partySize: number;
    notesOrWishes?: string;
  }) => {
    try {
      await db.rsvp.submit({
        invitation_id: invitation.id,
        guest_name: data.guestName,
        phone: data.phone,
        attendance_status: data.attendanceStatus,
        attendance: data.attendanceStatus === 'attending' ? 'confirmed' : 'declined',
        party_size: data.partySize,
        guests_count: data.partySize,
        notes_or_wishes: data.notesOrWishes,
        message: data.notesOrWishes,
      });
      if (!isPreview) {
        const isConfirmed = data.attendanceStatus === 'attending';
        analyticsEngine.track(
          invitation.id,
          isConfirmed ? 'rsvp_confirmed' : 'rsvp_declined',
          { party_size: data.partySize }
        );
      }
      return true;
    } catch (err) {
      console.error('Failed to submit RSVP:', err);
      return false;
    }
  };

  // 5. Analytics track action handler
  const handleTrackAction = (actionName: string, metadata?: Record<string, any>) => {
    if (!isPreview) {
      analyticsEngine.track(invitation.id, actionName as any, metadata);
    }
  };

  // 6. Security & Status Guard for Public Visitors (if not preview)
  if (!isPreview) {
    // Paused State
    if (invitation.status === 'paused') {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center text-[#171316] select-none motion-fade-in" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF6E7] border border-[#F7DBA7] flex items-center justify-center text-[#B7791F] mb-4 shadow-xs">
            <PauseCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#5A1020] mb-2">هذه الدعوة متوقفة مؤقتاً</h1>
          <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm leading-relaxed font-serif">
            تم إيقاف عرض هذه الدعوة مؤقتاً بواسطة منظم المناسبة. يرجى مراجعة صاحب الدعوة أو المحاولة لاحقاً.
          </p>
        </div>
      );
    }

    // Expired State
    if (invitation.status === 'expired') {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center text-[#171316] select-none motion-fade-in" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] flex items-center justify-center text-[#9A8F92] mb-4 shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#5A1020] mb-2">انتهت صلاحية هذه الدعوة</h1>
          <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm leading-relaxed font-serif">
            نعتذر، لقد انتهى موعد هذه المناسبة أو انتهت صلاحية رابط الدعوة المحدد.
          </p>
        </div>
      );
    }

    // Draft or Archived State (Must not be exposed to public)
    if (invitation.status === 'draft' || invitation.deleted_at) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center text-[#171316] select-none motion-fade-in" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-[#F6ECF0] border border-[#E8DED8] flex items-center justify-center text-[#5A1020] mb-4 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#5A1020] mb-2">الدعوة قيد التجهيز</h1>
          <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm leading-relaxed font-serif">
            هذه الدعوة ما زالت في مرحلة المسودة والتجهيز ولم يتم نشرها رسمياً بعد.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="relative w-full overflow-x-hidden min-h-screen">
      {/* Admin Preview Header Indicator */}
      {isPreview && (
        <div className="sticky top-0 z-50 bg-[#5A1020] text-[#FAF7F2] px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm select-none" dir="rtl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A45C]" />
            <span>
              معاينة الإدارة: قالب {adapter.nameAr} — الحالة: {invitation.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpened(false)}
              className="flex items-center gap-1 bg-[#FAF7F2]/15 hover:bg-[#FAF7F2]/25 text-[#FAF7F2] px-2.5 py-1 rounded text-[11px] transition cursor-pointer font-serif"
              title="إعادة تشغيل الافتتاحية والظرف ثلاثي الأبعاد"
            >
              <MailOpen className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>معاينة فتح الظرف</span>
            </button>
            <span className="text-[10px] bg-[#FAF7F2]/20 text-[#FAF7F2] px-2 py-0.5 rounded font-mono">
              وضع المعاينة (Preview Foundation)
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Envelope Opening Screen (Prompt 12 requirement) */}
      <OpeningEngine
        invitation={publicViewModel}
        templateId={adapter.id}
        isOpen={isOpened}
        onOpenComplete={() => {
          setIsOpened(true);
          if (!isPreview) {
            analyticsEngine.trackOpen(invitation.id);
          }
        }}
        onUserInteraction={handleUserInteraction}
        isPreview={isPreview}
      />

      {/* Central Central Animation Engine & Page Transition (Prompt 13 requirement) */}
      <InvitationAnimationEngine
        templateId={adapter.id}
        isEnvelopeOpen={isOpened}
      >
        <InvitationAnimationEngine.PageTransition>
          <TemplateRenderer
            invitation={publicViewModel}
            adapter={adapter}
            isPreview={isPreview}
            onRsvpSubmit={handleRsvpSubmit}
            onTrackAction={handleTrackAction}
          />
        </InvitationAnimationEngine.PageTransition>
      </InvitationAnimationEngine>

      {/* Floating Background Music Player (Prompt 14 requirement) */}
      {publicViewModel.settings.enableMusic && publicViewModel.music && (
        <ErrorBoundary sectionName="مشغل الموسيقى" silent>
          <InvitationMusicPlayer
            track={publicViewModel.music}
            style={adapter.style}
            templateId={adapter.id}
            autoPlayEnabled={!isPreview}
            userInteracted={hasUserInteracted || isOpened}
            onTrackAction={handleTrackAction}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
