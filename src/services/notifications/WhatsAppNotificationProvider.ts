/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IWhatsAppNotificationProvider,
  NotificationPayload,
  NotificationProviderResult,
} from './types';
import { getWhatsAppDigits, isValidWhatsAppNumber } from '../../utils/phone';

/**
 * WhatsApp Notification Provider Abstraction
 * Designed for WhatsApp Business Platform / Meta Cloud API integration.
 *
 * CRITICAL ARCHITECTURE RULE (Prompt 17 Requirements 10 & 17):
 * - Never store or bundle API tokens, Access Tokens, or Webhook secrets in Frontend.
 * - All token authentication must stay strictly server-side.
 * - This provider communicates via secure server-side route or safe backend delegation.
 */
export class WhatsAppNotificationProvider implements IWhatsAppNotificationProvider {
  public readonly channel = 'whatsapp' as const;

  // Server-side proxy endpoint (never exposes secrets to client)
  private readonly proxyEndpoint: string = '/api/notifications/whatsapp';

  /**
   * Checks whether the server environment has configured WhatsApp Cloud API credentials.
   * Client-side only checks readiness flag without holding secrets.
   */
  public isConfigured(): boolean {
    if (typeof window !== 'undefined') {
      // In browser: check if provider configuration flag is set in window / app config
      return Boolean((window as any).__MNASBATI_WHATSAPP_CONFIGURED__);
    }
    // Server-side runtime check
    return Boolean(
      process.env.WHATSAPP_CLOUD_API_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID
    );
  }

  /**
   * Dispatches WhatsApp notification payload
   */
  public async send(payload: NotificationPayload): Promise<NotificationProviderResult> {
    const rawRecipient = payload.recipient;
    const digits = getWhatsAppDigits(rawRecipient);

    // 1. Validation guard
    if (!digits || !isValidWhatsAppNumber(rawRecipient)) {
      return {
        success: false,
        status: 'failed',
        errorMessage: `رقم الواتساب غير صالح: ${rawRecipient}`,
      };
    }

    // 2. Check if provider configuration is valid
    if (!this.isConfigured()) {
      // Prompt 17 requirement 16 & 17:
      // Without valid server configuration, do not fake live API call.
      // Record as queued / config_required so it never crashes RSVP or blocks workflow.
      return {
        success: false,
        status: 'queued',
        errorMessage: 'مزود WhatsApp Cloud API غير مفعّل: يلزم ضبط المفاتيح في خادم المنصة (Server-side Config Required)',
      };
    }

    // 3. Delegate to server-side endpoint with payload
    try {
      const response = await fetch(this.proxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: digits,
          notificationType: payload.notificationType,
          templateName: payload.templateName || 'rsvp_notification_ar',
          parameters: payload.templateParams || {},
          message: payload.message,
          invitationId: payload.invitationId,
          guestId: payload.guestId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          status: 'failed',
          errorMessage: `خطأ من مزود الخدمة WhatsApp (${response.status}): ${errorText}`,
        };
      }

      const result = await response.json();
      return {
        success: true,
        status: 'sent',
        providerMessageId: result.messageId || `wamid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };
    } catch (err: any) {
      // Network or offline fallback
      return {
        success: false,
        status: 'failed',
        errorMessage: err?.message || 'تعذر الاتصال بخادم إشعارات WhatsApp',
      };
    }
  }

  /**
   * Pre-approved WhatsApp Template Message sender
   */
  public async sendTemplate(
    recipient: string,
    templateName: string,
    params: Record<string, string>
  ): Promise<NotificationProviderResult> {
    return this.send({
      invitationId: 'template_dispatch',
      notificationType: 'rsvp_confirmed',
      channel: 'whatsapp',
      recipient,
      templateName,
      templateParams: params,
    });
  }

  /**
   * Direct Session Text Message sender (Within 24-hr customer care window)
   */
  public async sendDirect(
    recipient: string,
    message: string
  ): Promise<NotificationProviderResult> {
    return this.send({
      invitationId: 'direct_dispatch',
      notificationType: 'invitation_reminder',
      channel: 'whatsapp',
      recipient,
      message,
    });
  }
}
