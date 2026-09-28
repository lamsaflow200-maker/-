/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../db';
import {
  NotificationPayload,
  NotificationProviderResult,
  NotificationSystemSettings,
  NotificationType,
} from './types';
import { WhatsAppNotificationProvider } from './WhatsAppNotificationProvider';
import { NotificationChannel, NotificationLog } from '../../types/database';

const SETTINGS_STORAGE_KEY = 'mnasbati_notification_settings';

const DEFAULT_SETTINGS: NotificationSystemSettings = {
  whatsappNotificationsEnabled: true,
  rsvpNotificationsEnabled: true,
  reminderNotificationsEnabled: false,
  emailNotificationsEnabled: false,
  smsNotificationsEnabled: false,
  providerName: 'whatsapp_cloud_api',
  businessPhoneNumberId: '',
  webhookEndpoint: '/api/webhooks/whatsapp',
  hasValidConfig: false,
};

/**
 * NotificationService
 * Multi-channel orchestration layer for WhatsApp, SMS, and Email notifications.
 *
 * CRITICAL REQUIREMENTS IMPLEMENTED (Prompt 17 Requirements 9 - 16):
 * - Non-blocking: Failures NEVER break RSVP submission or invitation lifecycle.
 * - Central audit logging in `notification_logs`.
 * - Controlled retry foundation with max retry limit (3).
 * - Provider separation from frontend and Invitation Engine.
 */
class NotificationService {
  private whatsappProvider = new WhatsAppNotificationProvider();

  /**
   * Retrieves active notification settings from storage
   */
  public getSettings(): NotificationSystemSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Updates notification settings (Admin only)
   */
  public updateSettings(updates: Partial<NotificationSystemSettings>): NotificationSystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save notification settings:', e);
      }
    }
    return updated;
  }

  /**
   * Core dispatch method. Sends notification, records audit log, and handles status.
   */
  public async send(payload: NotificationPayload): Promise<NotificationProviderResult> {
    const settings = this.getSettings();

    // Check if channel is enabled
    if (payload.channel === 'whatsapp' && !settings.whatsappNotificationsEnabled) {
      return {
        success: false,
        status: 'queued',
        errorMessage: 'إشعارات WhatsApp معطلة في إعدادات المنصة',
      };
    }

    let result: NotificationProviderResult;

    try {
      if (payload.channel === 'whatsapp') {
        result = await this.whatsappProvider.send(payload);
      } else {
        // SMS & Email foundations
        result = {
          success: false,
          status: 'queued',
          errorMessage: `قناة ${payload.channel} قيد التجهيز وسيتم تفعيلها لاحقاً`,
        };
      }
    } catch (err: any) {
      result = {
        success: false,
        status: 'failed',
        errorMessage: err?.message || 'خطأ غير متوقع أثناء إرسال الإشعار',
      };
    }

    // Persist to notification_logs in database
    try {
      await db.notifications.log({
        invitation_id: payload.invitationId,
        guest_id: payload.guestId,
        notification_type: payload.notificationType,
        channel: payload.channel,
        recipient: payload.recipient,
        status: result.status,
        provider_message_id: result.providerMessageId,
        error_message: result.errorMessage,
        retry_count: 0,
        payload: {
          title: payload.title,
          message: payload.message,
          params: payload.templateParams,
        },
      });
    } catch (logError) {
      console.warn('Could not record notification log:', logError);
    }

    return result;
  }

  /**
   * Automatic RSVP Notification Handler (Prompt 17 Requirement 9 & 14)
   * Dispatches automated notification to host/admin when an RSVP is received.
   * Completely safe and non-blocking: wrapped in top-level try/catch.
   */
  public async notifyRsvp(params: {
    invitationId: string;
    invitationTitle: string;
    hostPhone?: string;
    guestId?: string;
    guestName: string;
    guestPhone?: string;
    attendance: 'confirmed' | 'declined';
    guestsCount: number;
    message?: string;
  }): Promise<void> {
    try {
      const settings = this.getSettings();
      if (!settings.rsvpNotificationsEnabled) return;

      const recipient = params.hostPhone?.trim();
      if (!recipient) return;

      const isConfirmed = params.attendance === 'confirmed';
      const notificationType: NotificationType = isConfirmed
        ? 'rsvp_confirmed'
        : 'rsvp_declined';

      const statusAr = isConfirmed ? 'مؤكد ✅' : 'اعتذار ❌';
      const attendeesText = isConfirmed
        ? `${params.guestsCount} ${params.guestsCount > 1 ? 'أشخاص' : 'شخص'}`
        : '0';

      const notificationMessage = [
        `📩 رد جديد على الدعوة (${params.invitationTitle}):`,
        `• الحالة: ${statusAr}`,
        `• الضيف: ${params.guestName}`,
        params.guestPhone ? `• الهاتف: ${params.guestPhone}` : null,
        isConfirmed ? `• عدد الحاضرين: ${attendeesText}` : null,
        params.message ? `• الرسالة: "${params.message}"` : null,
      ]
        .filter(Boolean)
        .join('\n');

      // Dispatch via notification provider (server-side Cloud API or queued)
      await this.send({
        invitationId: params.invitationId,
        guestId: params.guestId,
        notificationType,
        channel: 'whatsapp',
        recipient,
        title: `رد جديد: ${params.guestName}`,
        message: notificationMessage,
        templateName: 'mnasbati_rsvp_alert',
        templateParams: {
          invitation_title: params.invitationTitle,
          guest_name: params.guestName,
          status: statusAr,
          party_size: String(params.guestsCount),
        },
      });
    } catch (err) {
      // Non-blocking: Logging error only, never throwing
      console.error('Safe notification dispatch error:', err);
    }
  }

  /**
   * Retry Foundation (Prompt 17 Requirement 15)
   * Safely re-attempts sending a failed notification up to 3 times.
   */
  public async retryNotification(logId: string): Promise<NotificationProviderResult> {
    try {
      const log = await db.notifications.getById(logId);
      if (!log) {
        throw new Error('سجل الإشعار غير موجود');
      }

      const currentRetries = log.retry_count || 0;
      const MAX_RETRIES = 3;

      if (currentRetries >= MAX_RETRIES) {
        throw new Error(`تم الوصول إلى الحد الأقصى لإعادة المحاولة (${MAX_RETRIES} مرات)`);
      }

      // Increment retry count and mark pending
      await db.notifications.update(log.id, {
        status: 'queued',
        retry_count: currentRetries + 1,
        error_message: 'جاري إعادة الإرسال...',
      });

      // Dispatch payload
      let result: NotificationProviderResult;
      if (log.channel === 'whatsapp') {
        result = await this.whatsappProvider.send({
          invitationId: log.invitation_id,
          guestId: log.guest_id,
          notificationType: log.notification_type as NotificationType,
          channel: 'whatsapp',
          recipient: log.recipient,
          message: (log as any).payload?.message,
        });
      } else {
        result = {
          success: false,
          status: 'failed',
          errorMessage: `القناة ${log.channel} غير متوفرة لإعادة المحاولة`,
        };
      }

      // Update log with result
      await db.notifications.update(log.id, {
        status: result.status,
        provider_message_id: result.providerMessageId || log.provider_message_id,
        error_message: result.errorMessage,
        updated_at: new Date().toISOString(),
      });

      return result;
    } catch (err: any) {
      return {
        success: false,
        status: 'failed',
        errorMessage: err?.message || 'فشلت عملية إعادة المحاولة',
      };
    }
  }
}

export const notificationService = new NotificationService();
