/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Database entity types, relationships, and validation schemas for Mnasbati platform.
 * Mirrors the Supabase PostgreSQL production schema.
 */

// --------------------------------------------------------------------
// Enums & Literal Unions
// --------------------------------------------------------------------

export type EventType =
  | 'wedding'
  | 'engagement'
  | 'aqiqah'
  | 'birthday'
  | 'graduation'
  | 'anniversary'
  | 'family_event'
  | 'family'
  | 'private_event'
  | 'private'
  | 'other';

export type InvitationStatus = 'draft' | 'active' | 'paused' | 'expired';

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export type RsvpAttendance =
  | 'confirmed'
  | 'declined'
  | 'pending'
  | 'attending'
  | 'tentative';

// Backward compatibility alias for UI components
export type RsvpStatus = RsvpAttendance;

export type SectionType =
  | 'hero'
  | 'story'
  | 'event_details'
  | 'gallery'
  | 'video'
  | 'countdown'
  | 'location'
  | 'rsvp'
  | 'contact'
  | 'custom';

export type MediaType = 'image' | 'video';

export type DomainStatus = 'pending' | 'verified' | 'active' | 'disabled';

export type NotificationChannel = 'whatsapp' | 'sms' | 'email';

export type NotificationStatus = 'queued' | 'pending' | 'sent' | 'delivered' | 'failed';

export type AnalyticsEventType =
  | 'page_view'
  | 'unique_view'
  | 'invitation_open'
  | 'section_view'
  | 'rsvp_open'
  | 'rsvp_confirmed'
  | 'rsvp_declined'
  | 'map_click'
  | 'whatsapp_click'
  | 'share_open'
  | 'share_whatsapp'
  | 'share_messenger'
  | 'share_telegram'
  | 'share_sms'
  | 'native_share'
  | 'copy_link'
  | 'music_play'
  | 'music_pause'
  | 'gallery_open'
  | 'gallery_image_view'
  | 'video_play'
  | 'video_complete'
  | 'qr_scan'
  | 'share_click'
  | 'rsvp_submit'
  | 'calendar_click';

// --------------------------------------------------------------------
// Entity Interfaces
// --------------------------------------------------------------------

/**
 * Admin User profile linked with Supabase Auth credentials.
 */
export interface AdminUser {
  id: string; // UUID
  auth_user_id?: string; // References auth.users(id) in Supabase
  full_name: string;
  name?: string; // Compatibility alias for existing UI
  email: string;
  phone?: string;
  role: AdminRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

/**
 * Customer profile (the event host on whose behalf invitations are created).
 */
export interface Customer {
  id: string; // UUID
  full_name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
  deleted_at?: string; // Soft deletion
  created_at: string;
  updated_at: string;
}

/**
 * Private Admin notes on a customer. Never exposed to public.
 */
export interface CustomerNote {
  id: string; // UUID
  customer_id: string; // Foreign Key -> Customer
  admin_user_id?: string; // Foreign Key -> AdminUser
  admin_name?: string; // Author display name
  note: string;
  created_at: string;
  updated_at: string;
}

import { TemplateConfig } from './template';

/**
 * Template Definition record with customizable JSON config.
 */
export interface TemplateRecord {
  id: string; // Identifier e.g. "royal-gold"
  name: string;
  slug: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  category: EventType | 'universal';
  preview_image_url?: string;
  thumbnail_url?: string;
  version?: string;
  is_active: boolean;
  config: TemplateConfig | Record<string, any>;
  supported_features?: {
    gallery: boolean;
    music: boolean;
    rsvp: boolean;
    video: boolean;
    countdown: boolean;
    map: boolean;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Licensable background audio track.
 */
export interface MusicTrack {
  id: string; // UUID
  name: string;
  artist?: string;
  audio_url: string;
  cover_image_url?: string;
  duration?: number; // In seconds
  is_active: boolean;
  auto_play?: boolean;
  loop?: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvitationThemeConfig {
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family_arabic: string;
  font_family_latin: string;
  custom_css?: string;
}

export interface InvitationContent {
  host_names?: string;
  celebrant_names: string;
  first_celebrant_name?: string;
  second_celebrant_name?: string;
  event_title?: string;
  invitation_text: string;
  date_iso: string;
  hijri_date?: string;
  time_text?: string;
  venue_name: string;
  venue_city: string;
  venue_address?: string;
  google_maps_url?: string;
  map_coordinates?: {
    lat: number;
    lng: number;
  };
  dress_code?: string;
  additional_notes?: string;
}

export interface InvitationSettings {
  allow_rsvp: boolean;
  rsvp_deadline?: string;
  max_party_size?: number;
  enable_music: boolean;
  enable_gallery: boolean;
  enable_countdown: boolean;
  enable_guest_messages: boolean;
  is_password_protected: boolean;
  password_hash?: string;
  show_qr_code: boolean;
}

/**
 * Core Invitation Entity.
 */
export interface Invitation {
  id: string; // UUID
  slug: string; // Unique URL slug e.g. "ahmed-sara"
  customer_id: string; // Foreign Key -> Customer
  template_id: string; // Foreign Key -> Template
  event_type: EventType;
  title: string;
  status: InvitationStatus;

  // Normalized event fields
  event_date?: string;
  event_time?: string;
  timezone?: string;
  venue_name?: string;
  venue_address?: string;
  google_maps_url?: string;
  host_whatsapp?: string;
  cover_image_url?: string;
  music_id?: string;
  rsvp_enabled?: boolean;
  expires_at?: string;
  deleted_at?: string; // Soft delete

  // JSON engine fields (preserves compatibility with frontend InvitationEngine)
  content: InvitationContent;
  theme: InvitationThemeConfig;
  settings: InvitationSettings;

  created_at: string;
  updated_at: string;
}

/**
 * Extensible modular invitation content section.
 */
export interface InvitationSection {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  section_type: SectionType;
  title?: string;
  subtitle?: string;
  content: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * High-resolution media item in invitation gallery.
 */
export interface GalleryItem {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  media_url: string;
  thumbnail_url?: string;
  media_type: MediaType;
  caption?: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Video feature showcase item.
 */
export interface InvitationVideo {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  video_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Backward compatibility alias for UI components
export type VideoItem = InvitationVideo;

/**
 * Private guest entry for individualized links and QR tickets.
 */
export interface Guest {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  qr_code_token?: string;
  companion_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Guest RSVP Confirmation with strict validation.
 */
export interface RsvpResponse {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  guest_id?: string; // Optional Foreign Key -> Guest
  guest_name: string;
  phone?: string;
  attendance: RsvpAttendance;
  guests_count: number;
  message?: string;

  // Compatibility aliases
  attendance_status: RsvpAttendance;
  party_size: number;
  notes_or_wishes?: string;

  created_at: string;
  updated_at: string;
}

/**
 * Telemetry and behavioral analytics event.
 */
export interface AnalyticsEvent {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  event_type: AnalyticsEventType;
  session_id?: string;
  device_type?: string;
  country?: string;
  city?: string;
  metadata?: Record<string, any>;
  created_at: string;

  // Compatibility aliases
  visitor_ip_hash?: string;
  user_agent?: string;
  referrer?: string;
}

/**
 * Invitation QR Code entity.
 */
export interface InvitationQrCode {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  qr_value: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Custom Domain mapping foundation.
 */
export interface CustomDomain {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  domain: string;
  status: DomainStatus;
  verification_token?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Multi-channel notification audit trail.
 */
export interface NotificationLog {
  id: string; // UUID
  invitation_id: string; // Foreign Key -> Invitation
  guest_id?: string; // Foreign Key -> Guest
  notification_type: string;
  channel: NotificationChannel;
  recipient: string;
  status: NotificationStatus;
  provider_message_id?: string;
  error_message?: string;
  retry_count?: number;
  payload?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}
