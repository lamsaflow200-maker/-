/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file PageTransitions component.
 * Seamless handoff between Opening Screen (Prompt 12) and the Invitation Page.
 * Prevents white flash, jumps, or layout shifts.
 */

import React from 'react';
import { useAnimationState } from './AnimationStateManager';
import { MOTION_EASINGS } from './tokens';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  style = {},
}) => {
  const { state, preset, isReducedMotion } = useAnimationState();

  if (isReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const isVisible = state === 'opened' || state === 'revealed_sections' || state === 'completed';

  return (
    <div
      className={`w-full min-h-screen transition-all will-change-transform ${className}`}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
        transitionDuration: `${preset.sectionDuration}ms`,
        transitionTimingFunction: MOTION_EASINGS.easeLuxury,
      }}
    >
      {children}
    </div>
  );
};
