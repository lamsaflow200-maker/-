/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Supabase PostgreSQL Client & Secure Data Access Layer for Mnasbati.
 * Provides typed access to Supabase database, storage buckets, and public RPC functions.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AdminUser,
  Customer,
  CustomerNote,
  Invitation,
  InvitationSection,
  GalleryItem,
  InvitationVideo,
  MusicTrack,
  Guest,
  RsvpResponse,
  AnalyticsEvent,
  TemplateRecord,
  InvitationQrCode,
  CustomDomain,
  NotificationLog,
} from '../types/database';

// --------------------------------------------------------------------
// Environment Configuration & Safe Validation
// --------------------------------------------------------------------
function isValidSupabaseUrl(urlString?: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed || trimmed.includes('your-project.supabase.co')) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidSupabaseKey(keyString?: string): boolean {
  if (!keyString || typeof keyString !== 'string') return false;
  const trimmed = keyString.trim();
  return Boolean(
    trimmed &&
    !trimmed.includes('your-anon-public-key') &&
    trimmed.length > 20 // Real Supabase public anon keys / JWTs are substantial tokens
  );
}

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return String(import.meta.env[key]);
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return String(process.env[key]);
  }
  return '';
};

const rawSupabaseUrl = getEnvVar('VITE_SUPABASE_URL').trim();
const rawSupabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY').trim();

export const isSupabaseConfigured: boolean = Boolean(
  isValidSupabaseUrl(rawSupabaseUrl) && isValidSupabaseKey(rawSupabaseKey)
);

export const SUPABASE_URL = isSupabaseConfigured ? rawSupabaseUrl : '';
export const SUPABASE_ANON_KEY = isSupabaseConfigured ? rawSupabaseKey : '';

/**
 * Typed Supabase Database Schema mapping
 */
export interface DatabaseSchema {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<AdminUser, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>;
      };
      customer_notes: {
        Row: CustomerNote;
        Insert: Omit<CustomerNote, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<CustomerNote, 'id' | 'created_at'>>;
      };
      templates: {
        Row: TemplateRecord;
        Insert: TemplateRecord;
        Update: Partial<TemplateRecord>;
      };
      invitations: {
        Row: Invitation;
        Insert: Omit<Invitation, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Invitation, 'id' | 'created_at'>>;
      };
      invitation_sections: {
        Row: InvitationSection;
        Insert: Omit<InvitationSection, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<InvitationSection, 'id' | 'created_at'>>;
      };
      gallery_items: {
        Row: GalleryItem;
        Insert: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<GalleryItem, 'id' | 'created_at'>>;
      };
      invitation_videos: {
        Row: InvitationVideo;
        Insert: Omit<InvitationVideo, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<InvitationVideo, 'id' | 'created_at'>>;
      };
      music_tracks: {
        Row: MusicTrack;
        Insert: Omit<MusicTrack, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<MusicTrack, 'id' | 'created_at'>>;
      };
      guests: {
        Row: Guest;
        Insert: Omit<Guest, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Guest, 'id' | 'created_at'>>;
      };
      rsvp_responses: {
        Row: RsvpResponse;
        Insert: Omit<RsvpResponse, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<RsvpResponse, 'id' | 'created_at'>>;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>;
      };
      invitation_qr_codes: {
        Row: InvitationQrCode;
        Insert: Omit<InvitationQrCode, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<InvitationQrCode, 'id' | 'created_at'>>;
      };
      custom_domains: {
        Row: CustomDomain;
        Insert: Omit<CustomDomain, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<CustomDomain, 'id' | 'created_at'>>;
      };
      notification_logs: {
        Row: NotificationLog;
        Insert: Omit<NotificationLog, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<NotificationLog, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      get_public_invitation: {
        Args: { p_slug: string };
        Returns: Record<string, any>;
      };
      is_admin_user: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}

// Create Supabase client singleton safely
function initSupabaseClient(): SupabaseClient<any> | null {
  if (!isSupabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

export const supabase: SupabaseClient<any> | null = initSupabaseClient();

// --------------------------------------------------------------------
// Storage Buckets Constants
// --------------------------------------------------------------------
export const STORAGE_BUCKETS = {
  INVITATION_COVERS: 'invitation-covers',
  INVITATION_GALLERY: 'invitation-gallery',
  INVITATION_VIDEOS: 'invitation-videos',
  MUSIC: 'music',
  TEMPLATE_PREVIEWS: 'template-previews',
  QR_CODES: 'qr-codes',
} as const;

export type StorageBucketName = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Storage helpers
 */
export const storageService = {
  /**
   * Get public URL for an asset in Supabase storage
   */
  getPublicUrl(bucket: StorageBucketName, filePath: string): string {
    if (!supabase || !isSupabaseConfigured) {
      return filePath;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Upload an asset into a specified bucket (requires admin authentication)
   */
  async uploadFile(bucket: StorageBucketName, path: string, file: Blob | File): Promise<string | null> {
    if (!supabase || !isSupabaseConfigured) {
      console.warn('Supabase not configured, cannot upload file to bucket:', bucket);
      return null;
    }
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (error) {
      console.error(`Error uploading to ${bucket}/${path}:`, error);
      throw error;
    }
    return this.getPublicUrl(bucket, data.path);
  },
};

/**
 * Safe Public Data Access Methods (No Sensitive Leaks)
 */
export const publicDataAccess = {
  /**
   * Loads an active invitation by unique slug safely via RPC or direct constrained query.
   * Strips out customer private info, internal notes, admin info, and other invitations.
   */
  async getBySlug(slug: string): Promise<Record<string, any> | null> {
    const cleanSlug = slug.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      // 1. Try secure RPC
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('get_public_invitation', {
        p_slug: cleanSlug,
      });

      if (!rpcError && rpcData) {
        return rpcData;
      }

      // 2. Direct RLS-constrained SELECT fallback
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          slug,
          event_type,
          title,
          status,
          event_date,
          event_time,
          timezone,
          venue_name,
          venue_address,
          google_maps_url,
          host_whatsapp,
          cover_image_url,
          rsvp_enabled,
          content,
          theme,
          settings,
          templates!inner (
            id,
            name,
            slug,
            category,
            config
          ),
          invitation_sections (
            id,
            section_type,
            title,
            subtitle,
            content,
            sort_order
          ),
          gallery_items (
            id,
            media_url,
            thumbnail_url,
            media_type,
            caption,
            sort_order
          ),
          invitation_videos (
            id,
            video_url,
            thumbnail_url,
            title,
            description,
            sort_order
          )
        `)
        .eq('slug', cleanSlug)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching public invitation from Supabase:', error);
        return null;
      }

      return data;
    }

    return null;
  },

  /**
   * Submit RSVP response securely (validated insertion)
   */
  async submitRsvp(payload: {
    invitationId: string;
    guestName: string;
    phone?: string;
    attendance: 'confirmed' | 'declined' | 'pending' | 'attending' | 'tentative';
    guestsCount: number;
    message?: string;
  }): Promise<boolean> {
    if (!payload.guestName.trim()) {
      throw new Error('Guest name is required');
    }
    if (payload.guestsCount < 0) {
      throw new Error('Guests count cannot be negative');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('rsvp_responses').insert({
        invitation_id: payload.invitationId,
        guest_name: payload.guestName.trim(),
        phone: payload.phone?.trim() || null,
        attendance: payload.attendance,
        attendance_status: payload.attendance,
        guests_count: payload.guestsCount,
        party_size: payload.guestsCount,
        message: payload.message || null,
        notes_or_wishes: payload.message || null,
      } as any);

      if (error) {
        console.error('Error inserting RSVP to Supabase:', error);
        throw error;
      }
      return true;
    }

    return false;
  },

  /**
   * Track public analytics event
   */
  async trackEvent(payload: {
    invitationId: string;
    eventType: string;
    sessionId?: string;
    deviceType?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('analytics_events')
        .insert({
          invitation_id: payload.invitationId,
          event_type: payload.eventType as any,
          session_id: payload.sessionId || null,
          device_type: payload.deviceType || null,
          metadata: payload.metadata || {},
        } as any)
        .then(({ error }) => {
          if (error) console.error('Error tracking analytics event:', error);
        });
    }
  },
};

/**
 * Health check & validation verification
 */
export async function verifyDatabaseConnection(): Promise<{
  connected: boolean;
  isConfigured: boolean;
  provider: 'supabase' | 'local_repository';
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: true,
      isConfigured: false,
      provider: 'local_repository',
    };
  }

  try {
    const { error } = await supabase.from('templates').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        isConfigured: true,
        provider: 'supabase',
        error: error.message,
      };
    }
    return {
      connected: true,
      isConfigured: true,
      provider: 'supabase',
    };
  } catch (err: any) {
    return {
      connected: false,
      isConfigured: true,
      provider: 'supabase',
      error: err?.message || 'Connection failed',
    };
  }
}
