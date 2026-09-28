/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Repository Interfaces for Mnasbati platform.
 * Defines the contract for all data access layers (Supabase or Client Storage).
 */

import {
  AdminUser,
  Customer,
  CustomerNote,
  Invitation,
  InvitationSection,
  TemplateRecord,
  Guest,
  RsvpResponse,
  GalleryItem,
  InvitationVideo,
  MusicTrack,
  AnalyticsEvent,
  InvitationStatus,
  InvitationQrCode,
  CustomDomain,
  NotificationLog,
} from '../types/database';

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
  findById(id: string): Promise<AdminUser | null>;
  findByAuthUserId(authUserId: string): Promise<AdminUser | null>;
  linkAuthUserId(id: string, authUserId: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
}

export interface ICustomerRepository {
  getAll(includeDeleted?: boolean): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  findByPhone(phone: string, excludeId?: string): Promise<Customer | null>;
  create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer>;
  update(id: string, customer: Partial<Customer>): Promise<Customer>;
  delete(id: string, permanent?: boolean): Promise<boolean>;
  restore(id: string): Promise<Customer>;
  getNotes(customerId: string): Promise<CustomerNote[]>;
  addNote(customerId: string, note: string, adminUserId?: string, adminName?: string): Promise<CustomerNote>;
  updateNote(id: string, note: string): Promise<CustomerNote>;
  deleteNote(id: string): Promise<boolean>;
}

export interface IInvitationRepository {
  getAll(filter?: { status?: InvitationStatus; customerId?: string; includeDeleted?: boolean }): Promise<Invitation[]>;
  getById(id: string): Promise<Invitation | null>;
  getBySlug(slug: string): Promise<Invitation | null>;
  create(invitation: Omit<Invitation, 'id' | 'created_at' | 'updated_at'>): Promise<Invitation>;
  update(id: string, invitation: Partial<Invitation>): Promise<Invitation>;
  delete(id: string, permanent?: boolean): Promise<boolean>;
  restore(id: string): Promise<Invitation>;
  duplicate(id: string, newTitle?: string): Promise<Invitation>;
  checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
  generateUniqueSlug(baseText: string, excludeId?: string): Promise<string>;
  getSections(invitationId: string): Promise<InvitationSection[]>;
  saveSection(section: Omit<InvitationSection, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<InvitationSection>;
  deleteSection(id: string): Promise<boolean>;
  getQrCode(invitationId: string): Promise<InvitationQrCode | null>;
  saveQrCode(invitationId: string, qrValue: string, imageUrl?: string): Promise<InvitationQrCode>;
  getCustomDomain(invitationId: string): Promise<CustomDomain | null>;
}

export interface ITemplateRepository {
  getAll(): Promise<TemplateRecord[]>;
  getById(id: string): Promise<TemplateRecord | null>;
}

export interface IGuestRepository {
  getAll(): Promise<Guest[]>;
  getByInvitationId(invitationId: string): Promise<Guest[]>;
  getById(id: string): Promise<Guest | null>;
  create(guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Promise<Guest>;
  update(id: string, guest: Partial<Guest>): Promise<Guest>;
  delete(id: string): Promise<boolean>;
  findDuplicate(invitationId: string, name: string, phone?: string, email?: string, excludeId?: string): Promise<Guest | null>;
}

export interface IRsvpRepository {
  getAll(): Promise<RsvpResponse[]>;
  getByInvitationId(invitationId: string): Promise<RsvpResponse[]>;
  getById(id: string): Promise<RsvpResponse | null>;
  delete(id: string): Promise<boolean>;
  update(id: string, updates: Partial<RsvpResponse>): Promise<RsvpResponse>;
  submit(rsvp: {
    invitation_id: string;
    guest_id?: string;
    guest_name: string;
    phone?: string;
    attendance?: 'confirmed' | 'declined' | 'pending' | 'attending' | 'tentative';
    attendance_status?: 'confirmed' | 'declined' | 'pending' | 'attending' | 'tentative';
    party_size?: number;
    guests_count?: number;
    notes_or_wishes?: string;
    message?: string;
  }): Promise<RsvpResponse>;
}

export interface IMediaRepository {
  getGallery(invitationId: string): Promise<GalleryItem[]>;
  addGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryItem>;
  updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem>;
  removeGalleryItem(id: string): Promise<boolean>;
  reorderGallery(invitationId: string, orderedIds: string[]): Promise<boolean>;

  getVideos(invitationId: string): Promise<InvitationVideo[]>;
  addVideo(video: Omit<InvitationVideo, 'id' | 'created_at' | 'updated_at'>): Promise<InvitationVideo>;
  updateVideo(id: string, updates: Partial<InvitationVideo>): Promise<InvitationVideo>;
  removeVideo(id: string): Promise<boolean>;
  reorderVideos(invitationId: string, orderedIds: string[]): Promise<boolean>;

  getAllMusicTracks(): Promise<MusicTrack[]>;
  getMusicTrackById(id: string): Promise<MusicTrack | null>;
  createMusicTrack(track: Omit<MusicTrack, 'id' | 'created_at' | 'updated_at'>): Promise<MusicTrack>;
  updateMusicTrack(id: string, updates: Partial<MusicTrack>): Promise<MusicTrack>;
  deleteMusicTrack(id: string): Promise<boolean>;

  getMusic(invitationId: string): Promise<MusicTrack | null>;
  saveMusic(track: Omit<MusicTrack, 'id' | 'created_at' | 'updated_at'>): Promise<MusicTrack>;
  setInvitationMusic(invitationId: string, musicId: string | null): Promise<boolean>;
}

export interface IAnalyticsRepository {
  track(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void>;
  getEvents(invitationId?: string, startDate?: string, endDate?: string): Promise<AnalyticsEvent[]>;
  getSummaryByInvitationId(invitationId: string): Promise<{
    viewsCount: number;
    rsvpsCount: number;
    sharesCount: number;
  }>;
  getDetailedStats(invitationId?: string, dateRange?: 'today' | '7d' | '30d' | 'all'): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    invitationsOpened: number;
    rsvpConfirmed: number;
    rsvpDeclined: number;
    totalAttendees: number;
    mapClicks: number;
    whatsappClicks: number;
    shareClicks: number;
    galleryOpens: number;
    videoPlays: number;
    musicPlays: number;
    qrScans: number;
    devices: { mobile: number; tablet: number; desktop: number };
    viewsOverTime: { date: string; views: number; uniqueViews: number }[];
    topEvents: { eventType: string; labelAr: string; count: number }[];
  }>;
}

export interface IQrCodeRepository {
  getByInvitationId(invitationId: string): Promise<InvitationQrCode | null>;
  createOrUpdate(data: {
    invitation_id: string;
    qr_value: string;
    image_url?: string;
    is_active?: boolean;
  }): Promise<InvitationQrCode>;
  setActive(invitationId: string, isActive: boolean): Promise<boolean>;
}

export interface INotificationRepository {
  getAll(): Promise<NotificationLog[]>;
  getById(id: string): Promise<NotificationLog | null>;
  getByInvitationId(invitationId: string): Promise<NotificationLog[]>;
  log(entry: Omit<NotificationLog, 'id' | 'created_at'>): Promise<NotificationLog>;
  update(id: string, updates: Partial<NotificationLog>): Promise<NotificationLog>;
}

export interface IDatabaseService {
  admins: IAdminRepository;
  customers: ICustomerRepository;
  invitations: IInvitationRepository;
  templates: ITemplateRepository;
  guests: IGuestRepository;
  rsvp: IRsvpRepository;
  media: IMediaRepository;
  analytics: IAnalyticsRepository;
  qrCodes: IQrCodeRepository;
  notifications: INotificationRepository;
}
