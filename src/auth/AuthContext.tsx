/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Unified Admin Authentication Context for Mnasbati.
 * Manages administrative session state, RBAC role-checking, and lifecycle events.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AdminUser, AdminRole } from '../types/database';
import { adminAuthService, AdminLoginCredentials, AdminAuthResult } from './adminAuthService';
import {
  Permission,
  ROLE_PERMISSIONS,
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
} from './permissions';

export interface AdminAuthContextType {
  admin: AdminUser | null;
  user: AdminUser | null; // Compatibility alias
  role: AdminRole | null;
  permissions: readonly Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    credentialsOrEmail: AdminLoginCredentials | string,
    maybePassword?: string,
    maybeRememberMe?: boolean
  ) => Promise<AdminAuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount and subscribe to auth lifecycle events
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const restored = await adminAuthService.restoreSession();
        if (isMounted) {
          setAdmin(restored);
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Subscribe to auth state changes (e.g. token refresh or external logout)
    const unsubscribe = adminAuthService.subscribeToAuthChanges((freshAdmin) => {
      if (isMounted) {
        setAdmin(freshAdmin);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (
      credentialsOrEmail: AdminLoginCredentials | string,
      maybePassword?: string,
      maybeRememberMe?: boolean
    ): Promise<AdminAuthResult> => {
      setIsLoading(true);
      setError(null);

      const credentials: AdminLoginCredentials =
        typeof credentialsOrEmail === 'string'
          ? {
              email: credentialsOrEmail,
              password: maybePassword,
              rememberMe: maybeRememberMe ?? true,
            }
          : credentialsOrEmail;

      try {
        const result = await adminAuthService.signIn(credentials);
        if (result.success && result.admin) {
          setAdmin(result.admin);
          setError(null);
        } else {
          setError(result.error || 'فشل تسجيل الدخول');
        }
        return result;
      } catch (err: any) {
        const msg = err.message || 'حدث خطأ غير متوقع';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await adminAuthService.signOut();
      setAdmin(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return adminAuthService.sendPasswordReset(email);
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshed = await adminAuthService.restoreSession();
    setAdmin(refreshed);
  }, []);

  const role = admin?.role || null;
  const permissions = useMemo(() => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  const checkPerm = useCallback(
    (permission: Permission) => {
      return checkPermission(role, permission);
    },
    [role]
  );

  const checkAnyPerm = useCallback(
    (perms: Permission[]) => {
      return checkAnyPermission(role, perms);
    },
    [role]
  );

  const checkAllPerm = useCallback(
    (perms: Permission[]) => {
      return checkAllPermissions(role, perms);
    },
    [role]
  );

  const value: AdminAuthContextType = {
    admin,
    user: admin, // alias
    role,
    permissions,
    isAuthenticated: Boolean(admin && admin.is_active),
    isLoading,
    error,
    login,
    logout,
    resetPassword,
    hasPermission: checkPerm,
    hasAnyPermission: checkAnyPerm,
    hasAllPermissions: checkAllPerm,
    refreshSession,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

/**
 * Hook to access authenticated admin context.
 */
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Backward compatibility alias for useAdminAuth
 */
export const useAuth = useAdminAuth;
