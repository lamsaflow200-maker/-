/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isDangerous = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            isDangerous
              ? 'bg-[#FEECEB] text-[#B42318] border border-[#F8B6B2]'
              : 'bg-[#FEF6E7] text-[#B7791F] border border-[#F7DBA7]'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-serif font-bold text-[#171316] mb-2">{title}</h3>
        <p className="text-xs text-[#6F6668] mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            size="md"
            className="flex-1"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
