-- ====================================================================
-- Mnasbati (منسباتي) - Complete Production-Ready Supabase PostgreSQL Schema
-- "دعوتك... بأسلوب يليق بمناسبتك"
-- ====================================================================
--
-- This SQL script establishes the full database architecture for Mnasbati:
--  1. PostgreSQL Extensions & Utilities
--  2. Automated Timestamp Triggers
--  3. Admin Users & Roles
--  4. Customers & Private Customer Notes (with Soft Deletion)
--  5. Templates & JSONB Configuration Engine
--  6. Music Library & Licensed Audio Tracks
--  7. Invitations (Core Entity with Soft Deletion & Strict Statuses)
--  8. Normalized Invitation Content Sections (Extensible Engine)
--  9. Gallery Items & Media Storage
-- 10. Invitation Videos
-- 11. Guests Registry & Tokens
-- 12. RSVP Responses & Attendee Counters (Strict Validation)
-- 13. High-Performance Analytics Events
-- 14. Invitation QR Codes
-- 15. Custom Domains Registry (Foundation)
-- 16. Notification Logs & Multi-Channel Audit (WhatsApp / SMS / Email)
-- 17. High-Performance Relational Indexes
-- 18. Row Level Security (RLS) & Granular Access Policies
-- 19. Public Secure Data Access Function (Safe Slug Lookup without Private Leakage)
-- 20. Supabase Storage Buckets & File Security Policies
-- 21. Clean Foundation Seed (Templates Only, Zero Fake Customer Data)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 3. ADMIN USERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE, -- References auth.users(id) in Supabase Auth
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 4. CUSTOMERS TABLE (With Soft Deletion)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  city VARCHAR(100),
  address TEXT,
  notes TEXT,
  deleted_at TIMESTAMPTZ, -- Soft deletion for data safety
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 5. CUSTOMER NOTES (Private Admin Records)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_customer_notes_updated_at
BEFORE UPDATE ON customer_notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 6. TEMPLATES REGISTRY (Theme & Configuration Engine)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(64) PRIMARY KEY, -- Unique template key e.g. 'classic-elegance'
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'universal',
  preview_image_url TEXT,
  config JSONB NOT NULL DEFAULT '{
    "colors": {
      "primary": "#5A1020",
      "accent": "#C9A45C",
      "background": "#FAF7F2",
      "text": "#171316"
    },
    "fonts": {
      "arabic": "Amiri, Georgia, serif",
      "latin": "Cinzel, serif"
    },
    "layout": "standard",
    "animations": true,
    "decorations": "royal_gold",
    "opening_style": "card",
    "button_style": "luxury",
    "gallery_style": "masonry",
    "countdown_style": "classic",
    "rsvp_style": "integrated"
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 7. MUSIC TRACKS (Audio Library & Licensable Background Sounds)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  artist VARCHAR(150),
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  duration INT CHECK (duration >= 0), -- Duration in seconds
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_music_tracks_updated_at
BEFORE UPDATE ON music_tracks
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 8. INVITATIONS TABLE (Core Central Entity with Soft Deletion)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  template_id VARCHAR(64) NOT NULL REFERENCES templates(id) ON DELETE RESTRICT,
  slug VARCHAR(120) UNIQUE NOT NULL,
  event_type VARCHAR(50) NOT NULL DEFAULT 'wedding' CHECK (
    event_type IN (
      'wedding', 'engagement', 'aqiqah', 'birthday',
      'graduation', 'anniversary', 'family_event', 'family',
      'private_event', 'private', 'other'
    )
  ),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'active', 'paused', 'expired')
  ),
  event_date DATE,
  event_time VARCHAR(100),
  timezone VARCHAR(100) NOT NULL DEFAULT 'Africa/Casablanca',
  venue_name VARCHAR(255),
  venue_address TEXT,
  google_maps_url TEXT,
  host_whatsapp VARCHAR(50),
  cover_image_url TEXT,
  music_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
  rsvp_enabled BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ, -- Soft deletion for data recovery
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Preserves backward compatibility with engine
  theme JSONB NOT NULL DEFAULT '{}'::jsonb, -- Custom color/typography overrides
  settings JSONB NOT NULL DEFAULT '{
    "allow_rsvp": true,
    "enable_music": true,
    "enable_gallery": true,
    "enable_countdown": true,
    "enable_guest_messages": true,
    "is_password_protected": false,
    "show_qr_code": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_invitations_updated_at
BEFORE UPDATE ON invitations
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 9. INVITATION SECTIONS (Extensible Content Engine)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitation_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL CHECK (
    section_type IN (
      'hero', 'story', 'event_details', 'gallery', 'video',
      'countdown', 'location', 'rsvp', 'contact', 'custom'
    )
  ),
  title VARCHAR(255),
  subtitle VARCHAR(255),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_invitation_sections_updated_at
BEFORE UPDATE ON invitation_sections
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 10. GALLERY ITEMS (High-Resolution Media & Proofs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_gallery_items_updated_at
BEFORE UPDATE ON gallery_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 11. INVITATION VIDEOS (Dedicated Video Showcase)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitation_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_invitation_videos_updated_at
BEFORE UPDATE ON invitation_videos
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 12. GUESTS TABLE (Private Guest Registry & Invite Links)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  notes TEXT,
  qr_code_token VARCHAR(100),
  companion_count INT NOT NULL DEFAULT 0 CHECK (companion_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_guests_updated_at
BEFORE UPDATE ON guests
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 13. RSVP RESPONSES TABLE (Validated Feedback & Counters)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  attendance VARCHAR(20) NOT NULL CHECK (
    attendance IN ('confirmed', 'declined', 'pending', 'attending', 'tentative')
  ),
  guests_count INT NOT NULL DEFAULT 1 CHECK (guests_count >= 0),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_rsvp_responses_updated_at
BEFORE UPDATE ON rsvp_responses
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 14. ANALYTICS EVENTS TABLE (Telemetry & Performance Metrics)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (
    event_type IN (
      'page_view', 'unique_view', 'rsvp_open', 'rsvp_confirmed',
      'rsvp_declined', 'map_click', 'whatsapp_click', 'share_click',
      'music_play', 'gallery_open', 'video_play', 'qr_scan',
      'rsvp_submit', 'calendar_click'
    )
  ),
  session_id VARCHAR(100),
  device_type VARCHAR(50),
  country VARCHAR(50),
  city VARCHAR(50),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 15. INVITATION QR CODES (Cards & Stage Display)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitation_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  qr_value TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_invitation_qr_codes_updated_at
BEFORE UPDATE ON invitation_qr_codes
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 16. CUSTOM DOMAINS (Foundation for Dedicated URLs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  domain VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'verified', 'active', 'disabled')
  ),
  verification_token VARCHAR(120),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER trg_custom_domains_updated_at
BEFORE UPDATE ON custom_domains
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- --------------------------------------------------------------------
-- 17. NOTIFICATION LOGS (Audit for WhatsApp, SMS, Email)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  notification_type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  recipient VARCHAR(150) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'delivered', 'failed')
  ),
  provider_message_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 18. DATABASE INDEXES FOR QUERY OPTIMIZATION
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_customer_id ON invitations(customer_id);
CREATE INDEX IF NOT EXISTS idx_invitations_template_id ON invitations(template_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_event_date ON invitations(event_date);
CREATE INDEX IF NOT EXISTS idx_invitations_deleted_at ON invitations(deleted_at);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);

CREATE INDEX IF NOT EXISTS idx_invitation_sections_invitation_id ON invitation_sections(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_sections_sort_order ON invitation_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_gallery_items_invitation_id ON gallery_items(invitation_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_sort_order ON gallery_items(sort_order);

CREATE INDEX IF NOT EXISTS idx_invitation_videos_invitation_id ON invitation_videos(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_videos_sort_order ON invitation_videos(sort_order);

CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_qr_token ON guests(qr_code_token);

CREATE INDEX IF NOT EXISTS idx_rsvp_responses_invitation_id ON rsvp_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_attendance ON rsvp_responses(attendance);

CREATE INDEX IF NOT EXISTS idx_analytics_events_invitation_id ON analytics_events(invitation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_notification_logs_invitation_id ON notification_logs(invitation_id);

-- --------------------------------------------------------------------
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
-- Enable RLS across all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current session is an authenticated admin user
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
      AND admin_users.is_active = true
    )
    OR auth.role() = 'service_role'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- ADMIN ACCESS POLICIES (Full control for Admins & Service Role) ---
CREATE POLICY "Admins have full access to admin_users"
ON admin_users FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to customers"
ON customers FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to customer_notes"
ON customer_notes FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to templates"
ON templates FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to music_tracks"
ON music_tracks FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to invitations"
ON invitations FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to invitation_sections"
ON invitation_sections FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to gallery_items"
ON gallery_items FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to invitation_videos"
ON invitation_videos FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to guests"
ON guests FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to rsvp_responses"
ON rsvp_responses FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to analytics_events"
ON analytics_events FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to invitation_qr_codes"
ON invitation_qr_codes FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to custom_domains"
ON custom_domains FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins have full access to notification_logs"
ON notification_logs FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- --- PUBLIC ACCESS POLICIES (Strictly Minimal and Safe) ---

-- Public can view active templates
CREATE POLICY "Public can view active templates"
ON templates FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Public can view active music tracks
CREATE POLICY "Public can view active music_tracks"
ON music_tracks FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Public can view active, non-deleted invitations only
CREATE POLICY "Public can view active invitations"
ON invitations FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND deleted_at IS NULL
  AND (expires_at IS NULL OR expires_at > NOW())
);

-- Public can view visible sections belonging to active invitations
CREATE POLICY "Public can view visible invitation_sections"
ON invitation_sections FOR SELECT
TO anon, authenticated
USING (
  is_visible = true
  AND EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.id = invitation_sections.invitation_id
    AND invitations.status = 'active'
    AND invitations.deleted_at IS NULL
  )
);

-- Public can view visible gallery items belonging to active invitations
CREATE POLICY "Public can view visible gallery_items"
ON gallery_items FOR SELECT
TO anon, authenticated
USING (
  is_visible = true
  AND EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.id = gallery_items.invitation_id
    AND invitations.status = 'active'
    AND invitations.deleted_at IS NULL
  )
);

-- Public can view visible videos belonging to active invitations
CREATE POLICY "Public can view visible invitation_videos"
ON invitation_videos FOR SELECT
TO anon, authenticated
USING (
  is_visible = true
  AND EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.id = invitation_videos.invitation_id
    AND invitations.status = 'active'
    AND invitations.deleted_at IS NULL
  )
);

-- Public can view active QR codes for active invitations
CREATE POLICY "Public can view active invitation_qr_codes"
ON invitation_qr_codes FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.id = invitation_qr_codes.invitation_id
    AND invitations.status = 'active'
    AND invitations.deleted_at IS NULL
  )
);

-- Public can insert RSVP responses ONLY for active, RSVP-enabled invitations
CREATE POLICY "Public can insert rsvp_responses"
ON rsvp_responses FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.id = rsvp_responses.invitation_id
    AND invitations.status = 'active'
    AND invitations.rsvp_enabled = true
    AND invitations.deleted_at IS NULL
    AND (invitations.expires_at IS NULL OR invitations.expires_at > NOW())
  )
);

-- Public can insert telemetry events for active invitations
CREATE POLICY "Public can insert analytics_events"
ON analytics_events FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.id = analytics_events.invitation_id
    AND invitations.status = 'active'
    AND invitations.deleted_at IS NULL
  )
);

-- --------------------------------------------------------------------
-- 20. SECURE PUBLIC INVITATION VIEW & FUNCTION (NO PRIVATE DATA LEAKAGE)
-- --------------------------------------------------------------------
-- This database function securely loads public invitation data by slug.
-- It NEVER returns customer notes, customer private contact info,
-- guest lists, notification logs, or admin credentials.
CREATE OR REPLACE FUNCTION get_public_invitation(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', i.id,
    'slug', i.slug,
    'event_type', i.event_type,
    'title', i.title,
    'status', i.status,
    'event_date', i.event_date,
    'event_time', i.event_time,
    'timezone', i.timezone,
    'venue_name', i.venue_name,
    'venue_address', i.venue_address,
    'google_maps_url', i.google_maps_url,
    'host_whatsapp', i.host_whatsapp,
    'cover_image_url', i.cover_image_url,
    'rsvp_enabled', i.rsvp_enabled,
    'content', i.content,
    'theme', i.theme,
    'settings', i.settings,
    'template', jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'slug', t.slug,
      'category', t.category,
      'config', t.config
    ),
    'music', (
      SELECT jsonb_build_object(
        'id', m.id,
        'name', m.name,
        'artist', m.artist,
        'audio_url', m.audio_url
      )
      FROM music_tracks m
      WHERE m.id = i.music_id AND m.is_active = true
    ),
    'sections', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'section_type', s.section_type,
          'title', s.title,
          'subtitle', s.subtitle,
          'content', s.content,
          'sort_order', s.sort_order
        ) ORDER BY s.sort_order ASC
      ), '[]'::jsonb)
      FROM invitation_sections s
      WHERE s.invitation_id = i.id AND s.is_visible = true
    ),
    'gallery', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', g.id,
          'media_url', g.media_url,
          'thumbnail_url', g.thumbnail_url,
          'media_type', g.media_type,
          'caption', g.caption,
          'sort_order', g.sort_order
        ) ORDER BY g.sort_order ASC
      ), '[]'::jsonb)
      FROM gallery_items g
      WHERE g.invitation_id = i.id AND g.is_visible = true
    ),
    'videos', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'video_url', v.video_url,
          'thumbnail_url', v.thumbnail_url,
          'title', v.title,
          'description', v.description,
          'sort_order', v.sort_order
        ) ORDER BY v.sort_order ASC
      ), '[]'::jsonb)
      FROM invitation_videos v
      WHERE v.invitation_id = i.id AND v.is_visible = true
    )
  ) INTO v_result
  FROM invitations i
  JOIN templates t ON t.id = i.template_id
  WHERE i.slug = LOWER(TRIM(p_slug))
    AND i.status = 'active'
    AND i.deleted_at IS NULL
    AND (i.expires_at IS NULL OR i.expires_at > NOW());

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 21. SUPABASE STORAGE BUCKETS & POLICIES CONFIGURATION
-- --------------------------------------------------------------------
-- Setup buckets in the storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('invitation-covers', 'invitation-covers', true),
  ('invitation-gallery', 'invitation-gallery', true),
  ('invitation-videos', 'invitation-videos', true),
  ('music', 'music', true),
  ('template-previews', 'template-previews', true),
  ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to public media buckets
CREATE POLICY "Public read access to invitation media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('invitation-covers', 'invitation-gallery', 'invitation-videos', 'music', 'template-previews', 'qr-codes'));

-- Admin upload/manage access to storage
CREATE POLICY "Admins can upload invitation media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can update invitation media"
ON storage.objects FOR UPDATE
TO authenticated
USING (is_admin_user());

CREATE POLICY "Admins can delete invitation media"
ON storage.objects FOR DELETE
TO authenticated
USING (is_admin_user());

-- --------------------------------------------------------------------
-- 22. CLEAN FOUNDATION SEED (TEMPLATES ONLY - ZERO FAKE CUSTOMER DATA)
-- --------------------------------------------------------------------
INSERT INTO templates (id, name, slug, description, category, preview_image_url, config, is_active)
VALUES
  (
    'classic-elegance',
    'Classic Elegance',
    'classic-elegance',
    'A timeless royal luxury design with warm gold accents and refined Arabic calligraphy styling.',
    'universal',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    '{
      "colors": {
        "primary": "#5A1020",
        "accent": "#C9A45C",
        "background": "#FAF7F2",
        "text": "#171316"
      },
      "fonts": {
        "arabic": "Amiri, Georgia, serif",
        "latin": "Cinzel, serif"
      },
      "layout": "standard",
      "animations": true,
      "decorations": "royal_gold",
      "opening_style": "card",
      "button_style": "luxury",
      "gallery_style": "masonry",
      "countdown_style": "classic",
      "rsvp_style": "integrated"
    }'::jsonb,
    true
  ),
  (
    'royal-minimalist',
    'Royal Minimalist',
    'royal-minimalist',
    'Sleek, understated modern luxury with clean lines and subtle champagne gold highlights.',
    'universal',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    '{
      "colors": {
        "primary": "#5A1020",
        "accent": "#C9A45C",
        "background": "#FAF7F2",
        "text": "#171316"
      },
      "fonts": {
        "arabic": "Amiri, Georgia, serif",
        "latin": "Cinzel, serif"
      },
      "layout": "minimal",
      "animations": false,
      "decorations": "clean_geometric",
      "opening_style": "card",
      "button_style": "minimal_gold",
      "gallery_style": "grid",
      "countdown_style": "clean",
      "rsvp_style": "integrated"
    }'::jsonb,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  config = EXCLUDED.config,
  updated_at = NOW();

-- End of Supabase PostgreSQL Schema
