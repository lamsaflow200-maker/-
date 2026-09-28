/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171316] flex flex-col items-center justify-center p-6 text-center motion-fade-in select-none">
      <div className="w-16 h-16 rounded-2xl bg-[#FEF6E7] border border-[#F7DBA7] flex items-center justify-center text-[#B7791F] mb-6 shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A1020] mb-2">
        404 — الصفحة غير موجودة
      </h1>
      <p className="text-xs text-[#6F6668] max-w-sm mb-6 leading-relaxed">
        الصفحة أو الدعوة التي تحاول الوصول إليها غير متوفرة أو قد تم تغيير مسارها.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
};
