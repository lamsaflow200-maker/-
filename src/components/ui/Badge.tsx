/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'gold'
  | 'primary'
  | 'info';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-[#F0EAE6] text-[#453E40] border-[#E0D4CE]',
    success: 'bg-[#EDF7EE] text-[#175E27] border-[#BFE4C6]',
    warning: 'bg-[#FEF6E7] text-[#8B5B16] border-[#F7DBA7]',
    error: 'bg-[#FEECEB] text-[#912018] border-[#F8B6B2]',
    gold: 'bg-[#F9F5EC] text-[#9F7C36] border-[#E8D8B6]',
    primary: 'bg-[#F6ECF0] text-[#5A1020] border-[#E3C8D0]',
    info: 'bg-[#EBF3FA] text-[#1D4D7D] border-[#B8D5ED]',
  };

  const dotStyles = {
    neutral: 'bg-[#6F6668]',
    success: 'bg-[#218739]',
    warning: 'bg-[#B7791F]',
    error: 'bg-[#B42318]',
    gold: 'bg-[#C9A45C]',
    primary: 'bg-[#5A1020]',
    info: 'bg-[#2867A6]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};
