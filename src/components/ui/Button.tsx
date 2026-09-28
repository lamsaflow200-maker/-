/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg focus-visible:ring-2 focus-visible:ring-[#C9A45C] focus-visible:outline-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[46px]',
  };

  const variantClasses = {
    primary:
      'bg-[#5A1020] hover:bg-[#460C18] active:bg-[#380913] text-[#FAF7F2] font-medium shadow-sm hover:shadow active:scale-[0.99] border border-[#5A1020]',
    secondary:
      'bg-[#FFFFFF] hover:bg-[#FAF7F2] active:bg-[#F4ECE4] text-[#171316] border border-[#E8DED8] shadow-xs active:scale-[0.99]',
    gold:
      'bg-[#C9A45C] hover:bg-[#B89249] active:bg-[#9F7C36] text-[#171316] font-medium shadow-sm active:scale-[0.99] border border-[#C9A45C]',
    outline:
      'bg-transparent hover:bg-[#F6ECF0] text-[#5A1020] border border-[#5A1020]/40 hover:border-[#5A1020] active:scale-[0.99]',
    danger:
      'bg-[#FEECEB] hover:bg-[#FDD8D5] text-[#912018] border border-[#F8B6B2] active:scale-[0.99]',
    ghost:
      'bg-transparent hover:bg-[#FAF7F2] text-[#6F6668] hover:text-[#171316] border border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};
