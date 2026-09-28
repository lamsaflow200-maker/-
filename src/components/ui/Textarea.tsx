/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).slice(2, 7);

    return (
      <div className="w-full text-right">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-[#171316] mb-1.5">
            {label}
            {props.required && <span className="text-[#5A1020] mr-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full bg-[#FFFFFF] border ${
            error ? 'border-[#B42318] focus:border-[#B42318]' : 'border-[#E8DED8] focus:border-[#5A1020]'
          } rounded-lg p-3 text-sm text-[#171316] placeholder:text-[#9A8F92] transition-colors focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-[#B42318]/15' : 'focus:ring-[#C9A45C]/30'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#B42318] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#6F6668]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
