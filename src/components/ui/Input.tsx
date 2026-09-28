/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, startIcon, endIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).slice(2, 7);

    return (
      <div className="w-full text-right">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#171316] mb-1.5">
            {label}
            {props.required && <span className="text-[#5A1020] mr-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute right-3 rtl:right-3 ltr:left-3 text-[#6F6668] pointer-events-none flex items-center">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#FFFFFF] border ${
              error ? 'border-[#B42318] focus:border-[#B42318]' : 'border-[#E8DED8] focus:border-[#5A1020]'
            } rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-[#171316] placeholder:text-[#9A8F92] transition-colors focus:outline-none focus:ring-2 ${
              error ? 'focus:ring-[#B42318]/15' : 'focus:ring-[#C9A45C]/30'
            } ${startIcon ? 'rtl:pr-10 ltr:pl-10' : ''} ${endIcon ? 'rtl:pl-10 ltr:pr-10' : ''} ${className}`}
            {...props}
          />
          {endIcon && (
            <div className="absolute left-3 rtl:left-3 ltr:right-3 text-[#6F6668] flex items-center">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#B42318] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#6F6668]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
