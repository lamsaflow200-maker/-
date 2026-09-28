import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Layouts
import { AdminLayout } from './components/layouts/AdminLayout';

// Code-split Lazy-Loaded Admin Pages (Prompt 19 Requirement 34)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminInvitationsPage = lazy(() => import('./pages/admin/AdminInvitationsPage').then(m => ({ default: m.AdminInvitationsPage })));
const AdminInvitationWizardPage = lazy(() => import('./pages/admin/AdminInvitationWizardPage').then(m => ({ default: m.AdminInvitationWizardPage })));
const AdminInvitationEditorPage = lazy(() => import('./pages/admin/AdminInvitationEditorPage').then(m => ({ default: m.AdminInvitationEditorPage })));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })));
const AdminCustomerDetailsPage = lazy(() => import('./pages/admin/AdminCustomerDetailsPage').then(m => ({ default: m.AdminCustomerDetailsPage })));
const AdminTemplatesPage = lazy(() => import('./pages/admin/AdminTemplatesPage').then(m => ({ default: m.AdminTemplatesPage })));
const AdminGuestsPage = lazy(() => import('./pages/admin/AdminGuestsPage').then(m => ({ default: m.AdminGuestsPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

// Code-split Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage').then(m => ({ default: m.HomePage })));
const PublicInvitationPage = lazy(() => import('./pages/public/PublicInvitationPage').then(m => ({ default: m.PublicInvitationPage })));
const QrRedirectPage = lazy(() => import('./pages/public/QrRedirectPage').then(m => ({ default: m.QrRedirectPage })));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
    <LoadingSpinner size="md" text="جاري التحميل..." />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/i/:slug" element={<PublicInvitationPage />} />
              <Route path="/qr/:slug" element={<QrRedirectPage />} />

              {/* Admin Login (Unprotected) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin Protected Area */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                {/* Default /admin redirects to /admin/dashboard */}
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="invitations" element={<AdminInvitationsPage />} />
                <Route path="invitations/new" element={<AdminInvitationWizardPage />} />
                <Route path="invitations/create" element={<AdminInvitationWizardPage />} />
                <Route path="invitations/:id/edit" element={<AdminInvitationEditorPage />} />
                <Route path="invitations/edit/:id" element={<AdminInvitationEditorPage />} />
                <Route path="invitations/:id" element={<AdminGuestsPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="customers/:id" element={<AdminCustomerDetailsPage />} />
                <Route path="templates" element={<AdminTemplatesPage />} />
                <Route path="guests" element={<AdminGuestsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute requiredPermission="manage_settings">
                      <AdminSettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
