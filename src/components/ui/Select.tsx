/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).slice(2, 7);

  return (
    <div className="w-full text-right">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-[#171316] mb-1.5">
          {label}
          {props.required && <span className="text-[#5A1020] mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none bg-[#FFFFFF] border ${
            error ? 'border-[#B42318] focus:border-[#B42318]' : 'border-[#E8DED8] focus:border-[#5A1020]'
          } rounded-lg px-3.5 py-2 text-sm text-[#171316] transition-colors focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-[#B42318]/15' : 'focus:ring-[#C9A45C]/30'
          } rtl:pr-3.5 rtl:pl-10 ltr:pl-3.5 ltr:pr-10 cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#171316]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6F6668]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#B42318] font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6F6668]">{helperText}</p>
      ) : null}
    </div>
  );
};
