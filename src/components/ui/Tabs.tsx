/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'segmented' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  className = '',
  variant = 'segmented',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`flex items-center gap-6 border-b border-[#E8DED8] ${className}`}>
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#5A1020] text-[#5A1020]'
                  : 'border-transparent text-[#6F6668] hover:text-[#171316] hover:border-[#E8DED8]'
              }`}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#5A1020]/10 text-[#5A1020]' : 'bg-[#E8DED8] text-[#6F6668]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 bg-[#F4ECE4] border border-[#E8DED8] rounded-lg gap-1 ${className}`}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              isActive
                ? 'bg-[#FFFFFF] text-[#5A1020] shadow-xs'
                : 'text-[#6F6668] hover:text-[#171316]'
            }`}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#5A1020]/10 text-[#5A1020]' : 'bg-[#E8DED8]/60 text-[#6F6668]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
