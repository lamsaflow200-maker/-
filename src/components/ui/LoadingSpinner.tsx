/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div
        className={`${sizeClasses[size]} border-[#C9A45C]/30 border-t-[#5A1020] rounded-full animate-spin`}
      />
      {text && <p className="mt-3 text-xs text-[#6F6668] font-medium">{text}</p>}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'جاري معالجة البيانات...',
}) => (
  <div className="py-16 flex flex-col items-center justify-center text-center">
    <LoadingSpinner size="lg" text={message} />
  </div>
);
