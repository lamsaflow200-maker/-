/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../navigation/AdminSidebar';
import { AdminMobileNav } from '../navigation/AdminMobileNav';
import { AdminTopBar } from '../navigation/AdminTopBar';

export const AdminLayout: React.FC = () => {
  // Enforce noindex on all Admin routes (Prompt 19 Requirement 52)
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    const previousContent = robotsMeta ? robotsMeta.getAttribute('content') : null;

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (previousContent) {
        robotsMeta?.setAttribute('content', previousContent);
      } else {
        robotsMeta?.setAttribute('content', 'index, follow');
      }
    };
  }, []);
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171316] flex flex-col lg:flex-row antialiased selection:bg-[#C9A45C]/25 selection:text-[#5A1020]">
      {/* Mobile Top Navigation & Drawer */}
      <AdminMobileNav />

      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content Column with Top Bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:block">
          <AdminTopBar />
        </div>
        <main className="flex-1 min-w-0 pb-24 lg:pb-12 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
