/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  label: string; // Accessible aria-label requirement
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg focus-visible:ring-2 focus-visible:ring-[#C9A45C] focus-visible:outline-none shrink-0';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs p-1.5',
    md: 'w-9 h-9 text-sm p-2',
    lg: 'w-11 h-11 text-base p-2.5',
  };

  const variantClasses = {
    primary: 'bg-[#5A1020] hover:bg-[#460C18] text-[#FAF7F2] shadow-xs border border-[#5A1020]',
    secondary: 'bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#171316] border border-[#E8DED8] shadow-xs',
    gold: 'bg-[#C9A45C] hover:bg-[#B89249] text-[#171316] border border-[#C9A45C]',
    outline: 'bg-transparent hover:bg-[#F6ECF0] text-[#5A1020] border border-[#5A1020]/40',
    ghost: 'bg-transparent hover:bg-[#F4ECE4] text-[#6F6668] hover:text-[#171316]',
    danger: 'bg-[#FEECEB] hover:bg-[#FDD8D5] text-[#912018] border border-[#F8B6B2]',
  };

  return (
    <button
      aria-label={label}
      title={label}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
