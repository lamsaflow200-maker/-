/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../db';
import { InvitationQrCode } from '../../types/database';
import { generateQrPngDataUrl, getPublicQrUrl } from '../../utils/qr';

export class InvitationQRCodeService {
  /**
   * Retrieves existing QR code or generates a fresh print-ready QR code for an invitation.
   * If slug changed or forceRegenerate is true, updates the record with fresh image.
   */
  public async getOrGenerate(
    invitationId: string,
    slug: string,
    forceRegenerate: boolean = false
  ): Promise<InvitationQrCode> {
    const existing = await db.qrCodes.getByInvitationId(invitationId);
    const expectedUrl = getPublicQrUrl(slug, true);

    // If already generated with identical URL and not forcing regeneration
    if (existing && !forceRegenerate && existing.qr_value === expectedUrl && existing.image_url) {
      return existing;
    }

    // Generate high-resolution print-ready QR Code
    const dataUrl = await generateQrPngDataUrl(expectedUrl, {
      width: 1024,
      margin: 2,
      darkColor: '#171316',
      lightColor: '#FFFFFF',
    });

    const record = await db.qrCodes.createOrUpdate({
      invitation_id: invitationId,
      qr_value: expectedUrl,
      image_url: dataUrl,
      is_active: existing ? existing.is_active : true,
    });

    return record;
  }

  /**
   * Toggles the active status of a QR code
   */
  public async toggleActive(invitationId: string, isActive: boolean): Promise<boolean> {
    return await db.qrCodes.setActive(invitationId, isActive);
  }
}

export const qrCodeService = new InvitationQRCodeService();
