/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InvitationStatus } from '../../types/database';

export type ExtendedStatus =
  | InvitationStatus
  | 'attending'
  | 'declined'
  | 'tentative'
  | 'pending';

export interface StatusBadgeProps {
  status: ExtendedStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const configs: Record<
    ExtendedStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    // Invitation Status
    active: {
      label: 'نشطة',
      bg: 'bg-[#EDF7EE]',
      text: 'text-[#175E27]',
      border: 'border-[#BFE4C6]',
      dot: 'bg-[#218739]',
    },
    draft: {
      label: 'مسودة',
      bg: 'bg-[#F0EAE6]',
      text: 'text-[#453E40]',
      border: 'border-[#E0D4CE]',
      dot: 'bg-[#6F6668]',
    },
    paused: {
      label: 'متوقفة',
      bg: 'bg-[#FEF6E7]',
      text: 'text-[#8B5B16]',
      border: 'border-[#F7DBA7]',
      dot: 'bg-[#B7791F]',
    },
    expired: {
      label: 'منتهية',
      bg: 'bg-[#FEECEB]',
      text: 'text-[#912018]',
      border: 'border-[#F8B6B2]',
      dot: 'bg-[#B42318]',
    },
    // RSVP Status
    attending: {
      label: 'مؤكد الحضور',
      bg: 'bg-[#EDF7EE]',
      text: 'text-[#175E27]',
      border: 'border-[#BFE4C6]',
      dot: 'bg-[#218739]',
    },
    declined: {
      label: 'معتذر',
      bg: 'bg-[#FEECEB]',
      text: 'text-[#912018]',
      border: 'border-[#F8B6B2]',
      dot: 'bg-[#B42318]',
    },
    tentative: {
      label: 'ربما يحضر',
      bg: 'bg-[#FEF6E7]',
      text: 'text-[#8B5B16]',
      border: 'border-[#F7DBA7]',
      dot: 'bg-[#B7791F]',
    },
    pending: {
      label: 'في انتظار الرد',
      bg: 'bg-[#F9F5EC]',
      text: 'text-[#9F7C36]',
      border: 'border-[#E8D8B6]',
      dot: 'bg-[#C9A45C]',
    },
  };

  const current = configs[status] || configs.draft;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${sizeClasses} ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      <span>{current.label}</span>
    </span>
  );
};
