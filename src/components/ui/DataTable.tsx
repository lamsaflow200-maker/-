/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  isNumeric?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'لا توجد بيانات',
  emptyDescription = 'لم يتم إضافة أي عناصر بعد.',
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-12 bg-[#FFFFFF] rounded-xl border border-[#E8DED8] flex justify-center">
        <LoadingSpinner size="md" text="جاري تحميل البيانات..." />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#E8DED8] bg-[#FFFFFF] shadow-xs">
      {/* Desktop & Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#FAF7F2] border-b border-[#E8DED8] text-xs font-semibold text-[#6F6668]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DED8]">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors hover:bg-[#FAF7F2] ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-4 text-[#171316] ${
                      col.isNumeric ? 'font-mono tabular-nums' : ''
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Mobile-First responsive transformation) */}
      <div className="sm:hidden divide-y divide-[#E8DED8]">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={`p-4 space-y-2 hover:bg-[#FAF7F2] transition-colors ${
              onRowClick ? 'cursor-pointer active:bg-[#F4ECE4]' : ''
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#6F6668] font-medium">{col.header}:</span>
                <span
                  className={`text-[#171316] ${
                    col.isNumeric ? 'font-mono tabular-nums' : ''
                  }`}
                >
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
