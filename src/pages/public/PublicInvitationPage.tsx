/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../db';
import {
  Invitation,
  Customer,
  InvitationSection,
  GalleryItem,
  InvitationVideo,
  MusicTrack,
} from '../../types/database';
import { InvitationEngine } from '../../engine/InvitationEngine';
import { generateEventStructuredData } from '../../utils/datetime';
import { sanitizeText } from '../../utils/security';
import {
  AlertCircle,
  Clock,
  PauseCircle,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

export const PublicInvitationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sections, setSections] = useState<InvitationSection[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<InvitationVideo[]>([]);
  const [music, setMusic] = useState<MusicTrack | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [statusError, setStatusError] = useState<
    'not_found' | 'draft' | 'paused' | 'expired' | 'archived' | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchInvitationData() {
      if (!slug) {
        if (isMounted) {
          setStatusError('not_found');
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const inv = await db.invitations.getBySlug(slug);

        if (!inv || !isMounted) {
          if (isMounted) setStatusError('not_found');
          return;
        }

        // 1. Strict Status Verification (No URL tampering allowed)
        if (inv.deleted_at) {
          setStatusError('archived');
          return;
        }

        if (inv.status === 'draft') {
          setStatusError('draft');
          return;
        }

        if (inv.status === 'paused') {
          setStatusError('paused');
          return;
        }

        if (inv.status === 'expired') {
          setStatusError('expired');
          return;
        }

        // Check if expires_at is set and in the past
        if (inv.expires_at) {
          const expireTime = new Date(inv.expires_at).getTime();
          if (expireTime < Date.now()) {
            setStatusError('expired');
            return;
          }
        }

        // If status is active, load associated dynamic relations
        const [cust, secList, galleryList, videoList, musicTrack] =
          await Promise.all([
            inv.customer_id ? db.customers.getById(inv.customer_id) : Promise.resolve(null),
            db.invitations.getSections(inv.id),
            db.media.getGallery(inv.id),
            db.media.getVideos(inv.id),
            db.media.getMusic(inv.id),
          ]);

        if (isMounted) {
          setInvitation(inv);
          setCustomer(cust);
          setSections(secList);
          setGallery(galleryList);
          setVideos(videoList);
          setMusic(musicTrack);
          setStatusError(null);

          // 2. SEO Foundation & Social Sharing Metadata
          updateSeoMetadata(inv);
        }
      } catch (err) {
        console.error('Error loading invitation:', err);
        if (isMounted) setStatusError('not_found');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchInvitationData();

    return () => {
      isMounted = false;
      // Reset document title to base
      document.title = 'منسباتي — Mnasbati | دعوتك بأسلوب يليق بمناسبتك';
    };
  }, [slug]);

  // Dynamic SEO Metadata Injector
  const updateSeoMetadata = (inv: Invitation) => {
    const rawTitle = inv.title ? sanitizeText(inv.title, 80) : 'دعوة خاصة';
    const pageTitle = `${rawTitle} | منسباتي`;
    document.title = pageTitle;

    const rawDesc =
      inv.content?.invitation_text?.slice(0, 160) ||
      `دعوة لحضور ${rawTitle}، نتشرف بحضوركم ومشاركتنا هذه المناسبة المباركة.`;
    const description = sanitizeText(rawDesc, 180);

    const canonicalUrl = `${window.location.origin}/i/${inv.slug}`;

    // Helper to safely set or update meta tag
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow');
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', description);

    if (inv.cover_image_url) {
      setMetaTag('property', 'og:image', inv.cover_image_url);
      setMetaTag('name', 'twitter:image', inv.cover_image_url);
    }

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  };

  // 1. Loading State (Branded Mnasbati Luxury Shimmer)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center select-none" dir="rtl">
        <div className="relative mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#5A1020] flex items-center justify-center text-[#C9A45C] shadow-md animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-base font-serif font-bold text-[#5A1020] mb-1">
          منسباتي
        </h2>
        <p className="text-xs text-[#6F6668] font-serif">
          جاري تجهيز بطاقة دعوتكم الفاخرة...
        </p>
      </div>
    );
  }

  // 2. Status Error Screen Handlers (Never expose internal DB errors)
  if (statusError || !invitation) {
    // 2.1 Paused Invitation
    if (statusError === 'paused') {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#171316] flex flex-col items-center justify-center p-6 text-center select-none motion-fade-in" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF6E7] border border-[#F7DBA7] flex items-center justify-center text-[#B7791F] mb-5 shadow-xs">
            <PauseCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#5A1020] mb-2">
            هذه الدعوة متوقفة مؤقتاً
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm mb-6 leading-relaxed font-serif">
            تم إيقاف عرض هذه الدعوة مؤقتاً من قبل منظم المناسبة. يرجى مراجعة صاحب الدعوة أو العودة لاحقاً.
          </p>
          <Link
            to="/"
            className="text-xs text-[#5A1020] hover:text-[#C9A45C] font-serif font-bold inline-flex items-center gap-1.5 transition"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      );
    }

    // 2.2 Expired Invitation
    if (statusError === 'expired') {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#171316] flex flex-col items-center justify-center p-6 text-center select-none motion-fade-in" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] flex items-center justify-center text-[#9A8F92] mb-5 shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#5A1020] mb-2">
            انتهت صلاحية هذه الدعوة
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm mb-6 leading-relaxed font-serif">
            نعتذر، لقد انتهى موعد هذه المناسبة أو انتهت صلاحية رابط الدعوة المحدد. دامت دياركم عامرة بالأفراح.
          </p>
          <Link
            to="/"
            className="text-xs text-[#5A1020] hover:text-[#C9A45C] font-serif font-bold inline-flex items-center gap-1.5 transition"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      );
    }

    // 2.3 Draft or Archived Invitation (Forbidden for general public)
    if (statusError === 'draft' || statusError === 'archived') {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#171316] flex flex-col items-center justify-center p-6 text-center select-none motion-fade-in" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-[#F6ECF0] border border-[#E8DED8] flex items-center justify-center text-[#5A1020] mb-5 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#5A1020] mb-2">
            الدعوة غير متاحة حالياً
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm mb-6 leading-relaxed font-serif">
            هذه الدعوة ما زالت في مرحلة الإعداد والتجهيز أو تم إغلاقها ولم تُنشر للعامة بعد.
          </p>
          <Link
            to="/"
            className="text-xs text-[#5A1020] hover:text-[#C9A45C] font-serif font-bold inline-flex items-center gap-1.5 transition"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </Link>
        </div>
      );
    }

    // 2.4 Not Found (404)
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#171316] flex flex-col items-center justify-center p-6 text-center select-none motion-fade-in" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF6E7] border border-[#F7DBA7] flex items-center justify-center text-[#B7791F] mb-5 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#5A1020] mb-2">
          الدعوة غير موجودة
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm mb-6 leading-relaxed font-serif">
          هذه الدعوة غير موجودة أو أن الرابط غير صحيح. يرجى التحقق من الرابط أو التواصل مع صاحب المناسبة.
        </p>
        <Link
          to="/"
          className="text-xs text-[#5A1020] hover:text-[#C9A45C] font-serif font-bold inline-flex items-center gap-1.5 transition"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
          <span>العودة إلى الصفحة الرئيسية</span>
        </Link>
      </div>
    );
  }

  // 3. Render Dynamic Invitation Engine with resolved data
  const structuredData = invitation
    ? generateEventStructuredData({
        title: invitation.title,
        description: invitation.content?.invitation_text,
        eventType: invitation.event_type,
        startDateIso: invitation.event_date || invitation.content?.date_iso,
        venueName: invitation.venue_name || invitation.content?.venue_name,
        venueAddress: invitation.venue_address || invitation.content?.venue_address,
        venueCity: invitation.content?.venue_city,
        googleMapsUrl: invitation.google_maps_url || invitation.content?.google_maps_url,
        imageUrl: invitation.cover_image_url || undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      })
    : null;

  return (
    <main className="min-h-screen bg-[#FAF7F2] antialiased selection:bg-[#C9A45C]/25 selection:text-[#5A1020]">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <InvitationEngine
        invitation={invitation}
        customer={customer}
        sections={sections}
        gallery={gallery}
        videos={videos}
        music={music}
        isPreview={false}
      />
    </main>
  );
};
