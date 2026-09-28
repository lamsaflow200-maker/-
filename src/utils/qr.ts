/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';

export interface QRCodeGenerateOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  withTrackingSource?: boolean;
}

/**
 * Builds the canonical public invitation URL for QR codes.
 * Ensures NO private guest data, personal notes, or secret credentials are ever encoded.
 */
export function getPublicQrUrl(slug: string, withTracking: boolean = true): string {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://mnasbati.ma';

  const cleanSlug = slug.trim().replace(/^\/+/, '');
  const baseUrl = `${origin}/i/${cleanSlug}`;

  if (withTracking) {
    return `${baseUrl}?source=qr`;
  }
  return baseUrl;
}

/**
 * Generates high-resolution PNG Data URL for print and digital display.
 * Tested for compatibility with iOS Camera, Android Google Lens / Camera, and QR readers.
 */
export async function generateQrPngDataUrl(
  url: string,
  options?: QRCodeGenerateOptions
): Promise<string> {
  const width = options?.width || 1024; // High print resolution
  const margin = options?.margin !== undefined ? options?.margin : 2;
  const dark = options?.darkColor || '#171316';
  const light = options?.lightColor || '#FFFFFF';

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width,
      margin,
      errorCorrectionLevel: 'H', // High error correction (30% damage recovery for print)
      color: {
        dark,
        light,
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR PNG Data URL:', err);
    throw new Error('فشل توليد رمز الاستجابة السريعة (QR Code)');
  }
}

/**
 * Generates vector SVG markup for infinite-scale luxury invitations and physical print shops.
 */
export async function generateQrSvgString(
  url: string,
  options?: QRCodeGenerateOptions
): Promise<string> {
  const margin = options?.margin !== undefined ? options?.margin : 2;
  const dark = options?.darkColor || '#171316';
  const light = options?.lightColor || '#FFFFFF';

  try {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      margin,
      errorCorrectionLevel: 'H',
      color: {
        dark,
        light,
      },
    });
    return svg;
  } catch (err) {
    console.error('Failed to generate QR SVG:', err);
    throw new Error('فشل توليد رمز QR بصيغة SVG');
  }
}

/**
 * Triggers clean client-side file download with formatted file name.
 * e.g. "mnasbati-sara-ahmed-qr.png"
 */
export function downloadQrCodeFile(
  dataUrl: string,
  slug: string,
  format: 'png' | 'svg' = 'png'
): void {
  if (typeof document === 'undefined') return;

  const safeSlug = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF_-]/g, '-')
    .replace(/-+/g, '-');

  const filename = `mnasbati-${safeSlug || 'invitation'}-qr.${format}`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
