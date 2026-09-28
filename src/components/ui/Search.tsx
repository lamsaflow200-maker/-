/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = 'بحث...',
  className = '',
  onClear,
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute rtl:right-3.5 ltr:left-3.5 text-[#6F6668] pointer-events-none flex items-center">
        <SearchIcon className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FFFFFF] border border-[#E8DED8] rounded-lg py-2 rtl:pr-10 rtl:pl-9 ltr:pl-10 ltr:pr-9 text-xs sm:text-sm text-[#171316] placeholder:text-[#9A8F92] transition-colors focus:outline-none focus:border-[#5A1020] focus:ring-2 focus:ring-[#C9A45C]/25"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute rtl:left-3 ltr:right-3 text-[#6F6668] hover:text-[#171316] p-0.5 rounded transition"
          aria-label="مسح البحث"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
