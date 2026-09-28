/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Admin Authentication & Session Management Service for Mnasbati.
 * Bridges Supabase Auth with admin_users RBAC database table, ensuring
 * that only active administrators (super_admin / admin) can access /admin/*.
 */

import { supabase, isSupabaseConfigured } from '../db/supabase';
import { db } from '../db';
import { AdminUser, AdminRole } from '../types/database';

export const ADMIN_AUTH_STORAGE_KEY = 'mnasbati_admin_session';
export const ADMIN_REMEMBER_KEY = 'mnasbati_admin_remember';

export interface AdminAuthResult {
  success: boolean;
  admin?: AdminUser;
  error?: string;
}

export interface AdminLoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

// Development fallback credentials for testing role & authorization scenarios
const LOCAL_CREDENTIAL_PASSWORDS: Record<string, string> = {
  'admin@mnasbati.ma': 'admin123',
  'manager@mnasbati.ma': 'manager123',
  'inactive@mnasbati.ma': 'test123',
};

class AdminAuthService {
  /**
   * Authenticate administrator using Supabase Auth, verify admin_users table and active status.
   */
  async signIn(credentials: AdminLoginCredentials): Promise<AdminAuthResult> {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password || '';
    const rememberMe = Boolean(credentials.rememberMe);

    // Validation
    if (!email) {
      return { success: false, error: 'المرجو إدخال البريد الإلكتروني للإدارة' };
    }
    if (!password) {
      return { success: false, error: 'المرجو إدخال كلمة المرور' };
    }

    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Supabase Auth credential verification
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError || !authData.user) {
          return { success: false, error: 'بيانات الدخول غير صحيحة' };
        }

        const authUserId = authData.user.id;

        // 2. Fetch corresponding admin_users record
        let admin = await db.admins.findByAuthUserId(authUserId);

        // If not yet linked by auth_user_id, match by verified email
        if (!admin) {
          admin = await db.admins.findByEmail(email);
          if (admin) {
            await db.admins.linkAuthUserId(admin.id, authUserId);
          }
        }

        // Check existence in admin_users
        if (!admin) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'هذا الحساب غير مصرح له بالوصول إلى لوحة التحكم.',
          };
        }

        // Check account active status
        if (!admin.is_active) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'هذا الحساب غير مفعل حالياً.',
          };
        }

        // Verify role
        if (!['super_admin', 'admin'].includes(admin.role)) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'نوع الحساب لا يملك صلاحية الوصول إلى الإدارة.',
          };
        }

        // Update last login timestamp
        await db.admins.updateLastLogin(admin.id);

        this.persistSession(admin, rememberMe);
        return { success: true, admin };
      }

      // --- LOCAL / DEMO FALLBACK (When Supabase Auth is offline or unconfigured) ---
      const admin = await db.admins.findByEmail(email);
      if (!admin) {
        return { success: false, error: 'بيانات الدخول غير صحيحة' };
      }

      // In local mode, verify against demo passwords
      const expectedPassword = LOCAL_CREDENTIAL_PASSWORDS[email] || 'admin123';
      if (password !== expectedPassword && password !== 'admin123') {
        return { success: false, error: 'بيانات الدخول غير صحيحة' };
      }

      // Check account active status
      if (!admin.is_active) {
        return {
          success: false,
          error: 'هذا الحساب غير مفعل حالياً.',
        };
      }

      // Verify role
      if (!['super_admin', 'admin'].includes(admin.role)) {
        return {
          success: false,
          error: 'نوع الحساب لا يملك صلاحية الوصول إلى الإدارة.',
        };
      }

      await db.admins.updateLastLogin(admin.id);
      this.persistSession(admin, rememberMe);
      return { success: true, admin };
    } catch (err: any) {
      console.error('Admin authentication error:', err);
      return {
        success: false,
        error: err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول',
      };
    }
  }

  /**
   * Log out administrator, invalidating both Supabase Auth and local session state.
   */
  async signOut(): Promise<void> {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signOut warning:', err);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Send password reset email via Supabase Auth recovery.
   * Never exposes whether an email belongs to an existing administrator.
   */
  async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'المرجو إدخال البريد الإلكتروني' };
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const redirectTo = `${window.location.origin}/admin/login?reset=true`;
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
        });
      }
    } catch (err) {
      console.warn('Password reset request error:', err);
    }

    // Always return safe generic confirmation (Timing/User Enumeration Attack prevention)
    return {
      success: true,
      message: 'إذا كان هذا البريد مسجلاً في إدارة منسباتي، فستتلقى رابطاً لإعادة تعيين كلمة المرور.',
    };
  }

  /**
   * Restore current session on page load or token refresh.
   */
  async restoreSession(): Promise<AdminUser | null> {
    try {
      // 1. Check Supabase session first if configured
      if (isSupabaseConfigured && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const authUserId = sessionData.session.user.id;
          let admin = await db.admins.findByAuthUserId(authUserId);
          if (!admin && sessionData.session.user.email) {
            admin = await db.admins.findByEmail(sessionData.session.user.email);
          }
          if (admin && admin.is_active && ['super_admin', 'admin'].includes(admin.role)) {
            return admin;
          }
          // If deactivated in database while session was active, sign out
          await supabase.auth.signOut();
          this.clearSession();
          return null;
        }
      }

      // 2. Check local persistent session (localStorage or sessionStorage)
      if (typeof window === 'undefined') return null;

      const stored =
        localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) ||
        sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY);

      if (stored) {
        const cachedAdmin: AdminUser = JSON.parse(stored);
        // Verify current status against DB to guarantee is_active wasn't revoked
        const freshAdmin = await db.admins.findById(cachedAdmin.id);
        if (freshAdmin && freshAdmin.is_active && ['super_admin', 'admin'].includes(freshAdmin.role)) {
          return freshAdmin;
        }
        // Account became inactive or deleted
        this.clearSession();
        return null;
      }
    } catch (err) {
      console.error('Failed to restore admin session:', err);
      this.clearSession();
    }
    return null;
  }

  /**
   * Subscribe to Supabase Auth state changes (token refresh, logout, session expiration).
   */
  subscribeToAuthChanges(callback: (admin: AdminUser | null) => void): () => void {
    if (!isSupabaseConfigured || !supabase) {
      return () => {};
    }

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        this.clearSession();
        callback(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const admin = await db.admins.findByAuthUserId(session.user.id);
        if (admin && admin.is_active) {
          callback(admin);
        } else {
          this.clearSession();
          callback(null);
        }
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }

  private persistSession(admin: AdminUser, rememberMe: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      const data = JSON.stringify(admin);
      if (rememberMe) {
        localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, data);
        localStorage.setItem(ADMIN_REMEMBER_KEY, 'true');
        sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      } else {
        sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, data);
        localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
        localStorage.removeItem(ADMIN_REMEMBER_KEY);
      }
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }
  }

  private clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      localStorage.removeItem(ADMIN_REMEMBER_KEY);
      sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Storage clear warning:', e);
    }
  }
}

export const adminAuthService = new AdminAuthService();
