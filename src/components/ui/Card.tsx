/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'gold' | 'burgundy';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#FFFFFF] border border-[#E8DED8] shadow-xs text-[#171316]',
    subtle: 'bg-[#FAF7F2] border border-[#E8DED8] shadow-xs text-[#171316]',
    gold: 'bg-[#FFFFFF] border border-[#E0C58A] shadow-xs text-[#171316]',
    burgundy: 'bg-[#FFFFFF] border border-[#5A1020]/25 shadow-xs text-[#171316]',
  };

  return (
    <div className={`rounded-xl p-5 sm:p-6 ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
