/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex items-center justify-between gap-4 py-3 text-xs ${className}`}>
      <span className="text-[#6F6668]">
        صفحة <strong className="text-[#171316] font-mono tabular-nums">{currentPage}</strong> من{' '}
        <strong className="text-[#171316] font-mono tabular-nums">{totalPages}</strong>
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] text-[#171316] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4 rtl:block ltr:hidden" />
          <ChevronLeft className="w-4 h-4 rtl:hidden ltr:block" />
        </button>

        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                isCurrent
                  ? 'bg-[#5A1020] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#FFFFFF] border border-[#E8DED8] text-[#171316] hover:bg-[#FAF7F2]'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-[#E8DED8] bg-[#FFFFFF] text-[#171316] hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="w-4 h-4 rtl:block ltr:hidden" />
          <ChevronRight className="w-4 h-4 rtl:hidden ltr:block" />
        </button>
      </div>
    </div>
  );
};
