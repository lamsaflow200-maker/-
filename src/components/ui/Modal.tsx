/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171316]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Body */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#FFFFFF] border border-[#E8DED8] rounded-xl shadow-lg p-6 text-right z-10 motion-scale`}
      >
        <div className="flex items-start justify-between mb-4 border-b border-[#E8DED8] pb-3">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2] transition cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            {title && (
              <h3 id="modal-title" className="text-base sm:text-lg font-serif font-bold text-[#171316]">
                {title}
              </h3>
            )}
            {description && <p className="text-xs text-[#6F6668] mt-1">{description}</p>}
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
