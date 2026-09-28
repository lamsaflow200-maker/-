/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { verifyWebhookSignature, handleWhatsAppWebhook } from '../services/notifications/webhookHandler';

export const webhookRouter = express.Router();

/**
 * Meta WhatsApp Cloud API Webhook Verification (GET)
 * Used by Meta / Facebook App Dashboard to verify endpoint ownership.
 */
webhookRouter.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'mnasbati_webhook_secret_verify_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Webhook] WhatsApp webhook verified successfully.');
    res.status(200).send(challenge);
  } else {
    console.warn('[Webhook] WhatsApp verification token mismatch.');
    res.status(403).json({ error: 'Verification token invalid' });
  }
});

/**
 * Meta WhatsApp Cloud API Webhook Event Receiver (POST)
 * Verifies HMAC-SHA256 signature and processes message delivery/status updates.
 */
webhookRouter.post('/whatsapp', async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const rawBody = JSON.stringify(req.body);
  const appSecret = process.env.WHATSAPP_APP_SECRET || '';

  // In production with appSecret set, strictly enforce signature verification
  if (appSecret) {
    const isSignatureValid = await verifyWebhookSignature(rawBody, signature, appSecret);
    if (!isSignatureValid) {
      console.warn('[Webhook] Rejected untrusted webhook signature');
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }
  }

  // Handle payload and delivery events
  try {
    const result = await handleWhatsAppWebhook({
      signature,
      provider: 'whatsapp_cloud_api',
      eventType: 'messages',
      payload: req.body,
    });

    return res.status(200).json({ status: 'success', handled: result.handledEvents });
  } catch (err: any) {
    console.error('[Webhook] Processing error:', err);
    return res.status(500).json({ error: err?.message || 'Processing failure' });
  }
});

/**
 * Server-Side WhatsApp Notification Dispatcher Route
 * Protects WhatsApp Business API token from being exposed to client bundle.
 */
export const notificationRouter = express.Router();

notificationRouter.post('/whatsapp', async (req: Request, res: Response) => {
  const { recipient, message, templateName, parameters, invitationId, guestId } = req.body;

  const apiToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!apiToken || !phoneNumberId) {
    return res.status(503).json({
      error: 'WhatsApp Cloud API credentials not configured on server',
      configured: false,
    });
  }

  try {
    // Official Meta Graph API call: https://graph.facebook.com/v19.0/{phone_number_id}/messages
    const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: message ? 'text' : 'template',
        text: message ? { body: message } : undefined,
        template: templateName
          ? {
              name: templateName,
              language: { code: 'ar' },
              components: [
                {
                  type: 'body',
                  parameters: Object.entries(parameters || {}).map(([_, val]) => ({
                    type: 'text',
                    text: String(val),
                  })),
                },
              ],
            }
          : undefined,
      }),
    });

    const data = await metaResponse.json();
    if (!metaResponse.ok) {
      return res.status(metaResponse.status).json(data);
    }

    return res.status(200).json({
      success: true,
      messageId: data.messages?.[0]?.id,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to dispatch via WhatsApp Graph API' });
  }
});
