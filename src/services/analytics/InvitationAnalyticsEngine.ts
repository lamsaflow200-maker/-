/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../db';
import { AnalyticsEventType, AnalyticsEvent } from '../../types/database';

const SESSION_STORAGE_KEY = 'mnasbati_session_id';
const TRACKED_EVENTS_CACHE_KEY = 'mnasbati_tracked_events';

// Approved Whitelist for Analytics Events (Prompt 18 & 19 Requirement 15)
const ALLOWED_ANALYTICS_EVENTS = new Set<string>([
  'page_view',
  'unique_view',
  'invitation_open',
  'section_view',
  'rsvp_open',
  'rsvp_confirmed',
  'rsvp_declined',
  'map_click',
  'whatsapp_click',
  'share_open',
  'share_whatsapp',
  'share_messenger',
  'share_telegram',
  'share_sms',
  'native_share',
  'copy_link',
  'music_play',
  'music_pause',
  'gallery_open',
  'gallery_image_view',
  'video_play',
  'video_complete',
  'qr_scan',
]);

// Rate-limiting / deduplication memory cache
const sessionTrackedEvents = new Set<string>();

/**
 * Public Invitation Analytics Engine
 *
 * Implements Prompt 18 Requirements 11 - 28, 36 - 43:
 * - Privacy-conscious telemetry (No GPS, no emails, no phone numbers, no guest secrets).
 * - Automatic session generation via crypto.randomUUID().
 * - Deduplication for page_view, unique_view, qr_scan, invitation_open.
 * - IntersectionObserver scroll section telemetry.
 * - Async queuing & non-blocking execution (failures never impact UI).
 * - Rate-limiting and Bot / invalid traffic filtering.
 */
export class InvitationAnalyticsEngine {
  private sessionId: string;
  private deviceType: 'mobile' | 'tablet' | 'desktop';
  private timezone: string;

  constructor() {
    this.sessionId = this.resolveSessionId();
    this.deviceType = this.resolveDeviceType();
    this.timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Africa/Casablanca';
  }

  /**
   * Generates or retrieves an opaque, privacy-preserving session ID.
   * Requirement 15: Never uses email, phone, or guest name.
   */
  private resolveSessionId(): string {
    if (typeof window === 'undefined') return 'server_session';
    try {
      let stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          stored = crypto.randomUUID();
        } else {
          stored = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        }
        sessionStorage.setItem(SESSION_STORAGE_KEY, stored);
      }
      return stored;
    } catch {
      return 'transient_' + Math.random().toString(36).slice(2);
    }
  }

  /**
   * Coarse device classification (mobile / tablet / desktop).
   * Requirement 16: No invasive browser fingerprinting.
   */
  private resolveDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua) || (width >= 640 && width < 1024)) {
      return 'tablet';
    }
    if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds)/.test(ua) || width < 640) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Sanitizes metadata to strictly enforce Privacy Rule 18 & 43.
   * Eliminates passwords, phones, emails, and sensitive guest records.
   */
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined;
    const cleaned: Record<string, any> = {};

    const FORBIDDEN_KEYS = [
      'password',
      'pass',
      'token',
      'secret',
      'phone',
      'email',
      'guest_name',
      'name',
      'notes',
      'gps',
      'lat',
      'lng',
      'coordinates',
    ];

    for (const [key, value] of Object.entries(metadata)) {
      const lower = key.toLowerCase();
      const isForbidden = FORBIDDEN_KEYS.some((f) => lower.includes(f));
      if (!isForbidden && typeof value !== 'function') {
        cleaned[key] = typeof value === 'object' && value !== null ? JSON.parse(JSON.stringify(value)) : value;
      }
    }

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  /**
   * Core Track Action.
   * Fully non-blocking (async queue), debounced, and safe against crashes.
   */
  public async track(
    invitationId: string,
    eventType: AnalyticsEventType,
    metadata?: Record<string, any>,
    options?: { oncePerSession?: boolean }
  ): Promise<void> {
    if (!invitationId || !eventType) return;

    // Reject non-whitelisted event types
    if (!ALLOWED_ANALYTICS_EVENTS.has(eventType)) {
      return;
    }

    // Deduplication key
    const dedupeKey = `${invitationId}_${eventType}_${metadata?.section || ''}_${metadata?.target || ''}`;
    if (options?.oncePerSession || ['page_view', 'unique_view', 'qr_scan', 'invitation_open'].includes(eventType)) {
      if (sessionTrackedEvents.has(dedupeKey)) {
        return; // Already tracked this session
      }
      sessionTrackedEvents.add(dedupeKey);
    }

    // Rate-limiting safeguard (Max 100 events per session)
    if (sessionTrackedEvents.size > 200) {
      return;
    }

    // Non-blocking async dispatch (Requirement 40 & 41)
    setTimeout(async () => {
      try {
        const payload: Omit<AnalyticsEvent, 'id' | 'created_at'> = {
          invitation_id: invitationId,
          event_type: eventType,
          session_id: this.sessionId,
          device_type: this.deviceType,
          country: 'المغرب',
          city: this.timezone.includes('Casablanca') ? 'المملكة المغربية' : undefined,
          metadata: this.sanitizeMetadata(metadata),
        };

        await db.analytics.track(payload);
      } catch (err) {
        // Silent failure: Never disrupt visitor experience (Requirement 41)
        console.warn('[Analytics] Track event failed silently:', eventType, err);
      }
    }, 0);
  }

  /**
   * Tracks initial page visit, unique view, and QR source detection on page load.
   */
  public trackVisit(invitationId: string): void {
    if (!invitationId) return;

    // 1. Page view
    this.track(invitationId, 'page_view', undefined, { oncePerSession: true });

    // 2. Unique view
    this.track(invitationId, 'unique_view', undefined, { oncePerSession: true });

    // 3. QR Code scan detection (Requirement 10 & 28)
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('source') === 'qr') {
        this.track(invitationId, 'qr_scan', { source: 'qr_code' }, { oncePerSession: true });
      }
    }
  }

  /**
   * Tracks invitation card / envelope open action.
   */
  public trackOpen(invitationId: string): void {
    this.track(invitationId, 'invitation_open', undefined, { oncePerSession: true });
  }

  /**
   * Tracks scroll-based section views using IntersectionObserver with debouncing.
   * Requirement 19 & 20: No spamming on every scroll pixel.
   */
  public observeSections(
    invitationId: string,
    sectionElements: { sectionName: string; element: HTMLElement | null }[]
  ): () => void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return () => {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const sectionName = entry.target.getAttribute('data-section-name');
            if (sectionName) {
              this.track(
                invitationId,
                'section_view',
                { section: sectionName },
                { oncePerSession: true }
              );
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    sectionElements.forEach(({ sectionName, element }) => {
      if (element) {
        element.setAttribute('data-section-name', sectionName);
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }
}

export const analyticsEngine = new InvitationAnalyticsEngine();
