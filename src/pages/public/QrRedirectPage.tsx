/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../../db';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { analyticsEngine } from '../../services/analytics/InvitationAnalyticsEngine';
import { QrCode, AlertCircle, ArrowRight } from 'lucide-react';

export const QrRedirectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [inactiveError, setInactiveError] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate('/', { replace: true });
      return;
    }

    async function handleRedirect() {
      try {
        const inv = await db.invitations.getBySlug(slug!);
        if (!inv || inv.deleted_at) {
          navigate(`/i/${slug}`, { replace: true });
          return;
        }

        // Check if QR code is explicitly marked inactive
        const qrRecord = await db.qrCodes.getByInvitationId(inv.id);
        if (qrRecord && qrRecord.is_active === false) {
          setInactiveError(true);
          return;
        }

        // Track QR Scan Event (Requirement 28)
        analyticsEngine.track(inv.id, 'qr_scan', { source: 'qr_redirect' }, { oncePerSession: true });

        // Redirect seamlessly to the public invitation with source tracking parameter
        navigate(`/i/${slug}?source=qr`, { replace: true });
      } catch (err) {
        console.error('QR Redirect error:', err);
        navigate(`/i/${slug}?source=qr`, { replace: true });
      }
    }

    handleRedirect();
  }, [slug, navigate]);

  if (inactiveError) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center text-[#171316] select-none" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF6E7] border border-[#F7DBA7] flex items-center justify-center text-[#B7791F] mb-4 shadow-xs">
          <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#5A1020] mb-2">
          رمز QR غير نشط حالياً
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6668] max-w-sm mb-6 leading-relaxed font-serif">
          تم إيقاف تفعيل رمز الاستجابة السريعة هذا مؤقتاً من قبل منظم الحفل.
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

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center text-[#171316]">
      <LoadingSpinner size="md" text="جاري قراءة رمز الاستجابة وتوجيهك للدعوة الفاخرة..." />
    </div>
  );
};
