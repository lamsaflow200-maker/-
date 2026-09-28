/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    right: 'inset-y-0 right-0 w-full max-w-md border-l',
    left: 'inset-y-0 left-0 w-full max-w-md border-r',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] border-t rounded-t-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#171316]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        className={`fixed bg-[#FFFFFF] border-[#E8DED8] shadow-xl flex flex-col z-10 transition-transform ${positionClasses[position]}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E8DED8]">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6F6668] hover:text-[#171316] hover:bg-[#FAF7F2] transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          {title && <h3 className="text-base font-serif font-bold text-[#171316]">{title}</h3>}
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-right">{children}</div>
      </div>
    </div>
  );
};
