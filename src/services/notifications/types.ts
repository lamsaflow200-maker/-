/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationChannel, NotificationStatus } from '../../types/database';

export type NotificationType =
  | 'rsvp_confirmed'
  | 'rsvp_declined'
  | 'invitation_created'
  | 'invitation_updated'
  | 'invitation_reminder';

export interface NotificationPayload {
  invitationId: string;
  guestId?: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  title?: string;
  message?: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface NotificationProviderResult {
  success: boolean;
  status: NotificationStatus;
  providerMessageId?: string;
  errorMessage?: string;
  deliveredAt?: string;
}

export interface INotificationProvider {
  channel: NotificationChannel;
  isConfigured(): boolean;
  send(payload: NotificationPayload): Promise<NotificationProviderResult>;
}

export interface IWhatsAppNotificationProvider extends INotificationProvider {
  channel: 'whatsapp';
  sendTemplate(
    recipient: string,
    templateName: string,
    params: Record<string, string>
  ): Promise<NotificationProviderResult>;
  sendDirect(
    recipient: string,
    message: string
  ): Promise<NotificationProviderResult>;
}

export interface NotificationSystemSettings {
  whatsappNotificationsEnabled: boolean;
  rsvpNotificationsEnabled: boolean;
  reminderNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  providerName: 'whatsapp_cloud_api' | 'twilio' | 'infobip' | 'custom';
  businessPhoneNumberId?: string;
  webhookEndpoint: string;
  hasValidConfig: boolean;
}

export interface WebhookVerificationPayload {
  signature?: string;
  provider: string;
  eventType: string;
  payload: any;
  timestamp?: number;
}
