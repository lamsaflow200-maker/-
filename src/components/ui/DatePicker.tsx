/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const dateId = id || props.name || Math.random().toString(36).slice(2, 7);

  return (
    <div className="w-full text-right">
      {label && (
        <label htmlFor={dateId} className="block text-xs font-medium text-[#171316] mb-1.5">
          {label}
          {props.required && <span className="text-[#5A1020] mr-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <div className="absolute rtl:right-3 ltr:left-3 text-[#C9A45C] pointer-events-none flex items-center">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <input
          id={dateId}
          type="date"
          className={`w-full bg-[#FFFFFF] border ${
            error ? 'border-[#B42318] focus:border-[#B42318]' : 'border-[#E8DED8] focus:border-[#5A1020]'
          } rounded-lg px-3.5 py-2 text-sm text-[#171316] transition-colors focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-[#B42318]/15' : 'focus:ring-[#C9A45C]/30'
          } rtl:pr-10 ltr:pl-10 cursor-pointer ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#B42318] font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6F6668]">{helperText}</p>
      ) : null}
    </div>
  );
};
