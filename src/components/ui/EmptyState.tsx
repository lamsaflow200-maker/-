/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#E8DED8] bg-[#FFFFFF] ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#F9F5EC] border border-[#E8D8B6] flex items-center justify-center text-[#C9A45C] mb-4 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-serif font-bold text-[#171316] mb-1.5">{title}</h3>
      <p className="text-xs text-[#6F6668] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
