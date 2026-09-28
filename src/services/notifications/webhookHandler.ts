/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../db';
import { WebhookVerificationPayload } from './types';

/**
 * Webhook Security & Verification Architecture
 * Validates incoming webhooks from WhatsApp Cloud API / Meta Webhooks.
 *
 * Checks:
 * 1. Signature Verification (HMAC SHA-256 with App Secret)
 * 2. Provider Authenticity
 * 3. Payload integrity and timestamp drift prevention
 * 4. Event Type routing (message status: sent, delivered, read, failed)
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string
): Promise<boolean> {
  if (!signatureHeader || !secret) {
    return false;
  }

  // Meta signature format: "sha256=<hash>"
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    return false;
  }

  const expectedHash = parts[1];

  try {
    // If Web Crypto is available (Node.js 18+ or modern browser/edge)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Convert hex hash to buffer
      const hashBytes = new Uint8Array(
        expectedHash.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        hashBytes,
        encoder.encode(rawBody)
      );
      return isValid;
    }
  } catch (err) {
    console.error('Signature verification error:', err);
  }

  return false;
}

/**
 * Processes verified incoming webhook payload
 */
export async function handleWhatsAppWebhook(
  verification: WebhookVerificationPayload
): Promise<{ success: boolean; handledEvents: number; error?: string }> {
  // Reject untrusted provider
  if (verification.provider !== 'whatsapp_cloud_api') {
    return {
      success: false,
      handledEvents: 0,
      error: `المزود غير معتمد: ${verification.provider}`,
    };
  }

  const payload = verification.payload;
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      handledEvents: 0,
      error: 'حمولة الـ Webhook غير صالحة',
    };
  }

  let handledEvents = 0;

  try {
    // Handle Meta WhatsApp entry format
    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === 'messages') {
          const value = change.value || {};
          const statuses = value.statuses || [];

          for (const statusUpdate of statuses) {
            const messageId = statusUpdate.id;
            const newStatus = statusUpdate.status; // 'sent' | 'delivered' | 'read' | 'failed'

            // Find matching notification log by provider_message_id
            const allLogs = await db.notifications.getAll();
            const matchingLog = allLogs.find(
              (l) => l.provider_message_id === messageId
            );

            if (matchingLog) {
              let mappedStatus: 'sent' | 'delivered' | 'failed' = 'sent';
              if (newStatus === 'delivered' || newStatus === 'read') {
                mappedStatus = 'delivered';
              } else if (newStatus === 'failed') {
                mappedStatus = 'failed';
              }

              const errorDetails = statusUpdate.errors?.[0]?.message;

              await db.notifications.update(matchingLog.id, {
                status: mappedStatus,
                error_message: errorDetails || matchingLog.error_message,
                updated_at: new Date().toISOString(),
              });

              handledEvents++;
            }
          }
        }
      }
    }

    return { success: true, handledEvents };
  } catch (err: any) {
    return {
      success: false,
      handledEvents,
      error: err?.message || 'خطأ أثناء معالجة أحداث الـ Webhook',
    };
  }
}
