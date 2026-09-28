/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { qrCodeService } from '../../../services/qr/InvitationQRCodeService';
import { InvitationQrCode } from '../../../types/database';
import { downloadQrCodeFile, getPublicQrUrl, generateQrSvgString } from '../../../utils/qr';
import { useToast } from '../../ui/Toast';
import {
  QrCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Printer,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export interface InvitationQRCodeCardProps {
  invitationId: string;
  slug: string;
  title: string;
  isDraft?: boolean;
}

export const InvitationQRCodeCard: React.FC<InvitationQRCodeCardProps> = ({
  invitationId,
  slug,
  title,
  isDraft = false,
}) => {
  const { success, error: toastError } = useToast();

  const [qrRecord, setQrRecord] = useState<InvitationQrCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = getPublicQrUrl(slug, true);

  const loadQr = async (force: boolean = false) => {
    try {
      if (force) setIsRegenerating(true);
      else setIsLoading(true);

      const record = await qrCodeService.getOrGenerate(invitationId, slug, force);
      setQrRecord(record);
      if (force) {
        success('تم تحديث وتوليد رمز QR بدقة عالية بنجاح!');
      }
    } catch (err: any) {
      console.error(err);
      toastError(err?.message || 'فشل تحميل رمز الاستجابة السريعة (QR)');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    if (invitationId && slug) {
      loadQr(false);
    }
  }, [invitationId, slug]);

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
      } else {
        window.prompt('رابط QR المباشر:', publicUrl);
        setCopied(true);
      }
      success('تم نسخ رابط الـ QR بنجاح!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toastError('تعذر نسخ الرابط تلقائياً');
    }
  };

  const handleDownload = () => {
    if (!qrRecord?.image_url) return;
    downloadQrCodeFile(qrRecord.image_url, slug, 'png');
    success('تم بدء تحميل صورة الـ QR بجودة الطباعة (1024x1024)');
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await generateQrSvgString(publicUrl);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      downloadQrCodeFile(blobUrl, slug, 'svg');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      success('تم بدء تحميل رمز الـ QR بصيغة المتجهات SVG');
    } catch {
      toastError('تعذر توليد ملف SVG');
    }
  };

  const handleToggleActive = async () => {
    if (!qrRecord) return;
    const newState = !qrRecord.is_active;
    try {
      await qrCodeService.toggleActive(invitationId, newState);
      setQrRecord({ ...qrRecord, is_active: newState });
      success(newState ? 'تم تفعيل رمز QR للاستخدام العام' : 'تم تعطيل رمز QR مؤقتاً');
    } catch (err: any) {
      toastError(err?.message || 'فشل تحديث حالة الـ QR');
    }
  };

  return (
    <div
      dir="rtl"
      className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8DED8] shadow-xs space-y-5 text-right motion-fade-in"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DED8] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#5A1020] text-[#C9A45C] flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#171316] flex items-center gap-2">
              <span>رمز الاستجابة السريعة (QR Code)</span>
              {qrRecord?.is_active ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EDF7EE] text-[#175E27] border border-[#BFE4C6]">
                  فعال ونشط
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#6F6668] border border-[#E8DED8]">
                  معطل
                </span>
              )}
            </h3>
            <p className="text-xs text-[#6F6668] mt-0.5">
              رمز مخصص عالي الدقة للطباعة الفاخرة وشاشات الاستقبال والبطاقات الورقية
            </p>
          </div>
        </div>

        {/* Status Toggle & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleToggleActive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DED8] text-xs font-semibold hover:bg-[#FAF7F2] transition cursor-pointer"
            title={qrRecord?.is_active ? 'تعطيل QR' : 'تفعيل QR'}
          >
            {qrRecord?.is_active ? (
              <span className="text-[#175E27] flex items-center gap-1">
                <ToggleRight className="w-4 h-4 fill-[#175E27] text-white" />
                <span>مفعّل للعامة</span>
              </span>
            ) : (
              <span className="text-[#9A8F92] flex items-center gap-1">
                <ToggleLeft className="w-4 h-4 text-[#9A8F92]" />
                <span>معطل</span>
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => loadQr(true)}
            disabled={isRegenerating || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DED8] text-xs font-semibold text-[#5A1020] hover:bg-[#FAF7F2] transition cursor-pointer disabled:opacity-50"
            title="إعادة إنشاء رمز الـ QR"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>تحديث الرمز</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Preview & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* QR Preview Box */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DED8] text-center space-y-3">
          {isLoading ? (
            <div className="w-48 h-48 flex flex-col items-center justify-center text-xs text-[#6F6668]">
              <RefreshCw className="w-7 h-7 animate-spin text-[#C9A45C] mb-2" />
              <span>جاري توليد رمز الـ QR...</span>
            </div>
          ) : qrRecord?.image_url ? (
            <div className="relative group">
              <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-[#C9A45C]/30 transition transform group-hover:scale-[1.02]">
                <img
                  src={qrRecord.image_url}
                  alt={`QR Code - ${title}`}
                  className="w-44 h-44 object-contain rounded-lg"
                />
              </div>
              <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#171316] text-[#FAF7F2] shadow-xs">
                  1024 × 1024 (HD)
                </span>
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-[#B42318]">
              فشل تحميل الرمز
            </div>
          )}

          <div className="pt-2 flex items-center gap-1 text-[11px] text-[#6F6668] font-serif">
            <Printer className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>صالح للطباعة بدقة 300+ DPI</span>
          </div>
        </div>

        {/* Controls & Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Public URL Box */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171316] flex items-center gap-1.5">
                <span>الرابط المشفر داخل الـ QR:</span>
              </span>
              <span className="text-[10px] text-[#175E27] font-semibold bg-[#EDF7EE] px-2 py-0.5 rounded">
                آمن وخالٍ من البيانات الخاصة 🔒
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#E8DED8]">
              <code className="text-xs font-mono text-[#5A1020] truncate ltr text-left flex-1 px-1">
                {publicUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#5A1020] text-[#FAF7F2] hover:bg-[#721529] transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!qrRecord?.image_url}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#171316] text-[#FAF7F2] hover:bg-black transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#C9A45C]" />
              <span>تحميل صورة الـ QR (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={!publicUrl}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#5A1020] text-[#FAF7F2] hover:bg-[#721529] transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#C9A45C]" />
              <span>تحميل متجهي (SVG)</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-[#E8DED8] bg-white text-[#171316] hover:bg-[#FAF7F2] transition shadow-2xs cursor-pointer"
            >
              <span>تجربة فتح الرابط</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#6F6668]" />
            </a>
          </div>

          {/* Security & Camera Notice */}
          <div className="p-3 rounded-xl bg-[#EDF7EE]/70 border border-[#BFE4C6] text-xs text-[#175E27] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>التوافقية والخصوصية التامة:</span>
            </div>
            <p className="text-[11px] text-[#175E27]/90 leading-relaxed font-serif">
              تم فحص الرمز ليعمل فورياً مع كاميرا iPhone و Android وكافة تطبيقات المسح الضوئي.
              الدعوة في وضع {isDraft ? '«مسودة»' : '«نشطة»'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
