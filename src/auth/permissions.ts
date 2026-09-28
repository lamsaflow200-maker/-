/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Role-Based Access Control (RBAC) & Modular Permission System for Mnasbati.
 * Separates Authentication (identity) from Authorization (permissions).
 */

import { AdminRole } from '../types/database';

export type Permission =
  | 'manage_admins'       // Manage administrator accounts, invitations, and active status
  | 'manage_customers'    // View, create, edit host customer profiles & private notes
  | 'manage_invitations'  // Create, edit, update invitation details & sections
  | 'delete_invitations'  // Permanently delete or archive invitations
  | 'manage_templates'    // Configure template registry, styling presets & layouts
  | 'view_templates'      // Browse templates catalog
  | 'manage_guests'       // View guest lists, RSVP records & companion allocations
  | 'view_analytics'      // View visitor counts, engagement metrics & conversion rates
  | 'manage_settings';    // System configuration, custom domains, notifications & security

/**
 * Explicit role-to-permissions mapping matrix.
 * Designed to be modular so additional roles (e.g. 'editor', 'event_planner') can be added later.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  super_admin: [
    'manage_admins',
    'manage_customers',
    'manage_invitations',
    'delete_invitations',
    'manage_templates',
    'view_templates',
    'manage_guests',
    'view_analytics',
    'manage_settings',
  ],
  admin: [
    'manage_customers',
    'manage_invitations',
    'view_templates',
    'manage_guests',
    'view_analytics',
  ],
  editor: [
    'manage_invitations',
    'view_templates',
    'manage_guests',
    'view_analytics',
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: AdminRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Check if a role satisfies any of the required permissions.
 */
export function hasAnyPermission(role: AdminRole | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role satisfies all of the required permissions.
 */
export function hasAllPermissions(role: AdminRole | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Human-readable Arabic role names and styling.
 */
export const ROLE_DETAILS: Record<
  AdminRole,
  {
    nameAr: string;
    descriptionAr: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  super_admin: {
    nameAr: 'مدير عام',
    descriptionAr: 'صلاحيات كاملة على كافة إعدادات المنصة وإدارة المسؤولين',
    badgeBg: 'bg-[#5A1020]/10',
    badgeText: 'text-[#5A1020]',
    badgeBorder: 'border-[#5A1020]/20',
  },
  admin: {
    nameAr: 'مشرف إدارة',
    descriptionAr: 'إدارة العملاء والدعوات والضيوف والإحصائيات',
    badgeBg: 'bg-[#C9A45C]/15',
    badgeText: 'text-[#8A6A23]',
    badgeBorder: 'border-[#C9A45C]/30',
  },
  editor: {
    nameAr: 'محرر محتوى',
    descriptionAr: 'تعديل نصوص وتصاميم الدعوات',
    badgeBg: 'bg-neutral-100',
    badgeText: 'text-neutral-700',
    badgeBorder: 'border-neutral-200',
  },
};
