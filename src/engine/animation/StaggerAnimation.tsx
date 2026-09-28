/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file StaggerAnimation system.
 * Coordinates cascading element entrance (Title -> Subtitle -> Date -> Location -> Button)
 * with refined luxury pacing (40–100ms).
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAnimationState } from './AnimationStateManager';
import { useScrollReveal } from './useScrollReveal';

interface StaggerContextValue {
  isTriggered: boolean;
  baseDelay: number;
  staggerDelay: number;
  duration: number;
  easing: string;
  isReduced: boolean;
}

const StaggerContext = createContext<StaggerContextValue | null>(null);

export interface StaggerContainerProps {
  /** Base delay before first item appears (ms) */
  baseDelay?: number;
  /** Gap between consecutive elements (ms: 40–100ms, defaults to template preset) */
  staggerDelay?: number;
  /** Duration of each item's transition (ms) */
  duration?: number;
  /** Easing curve (defaults to template preset) */
  easing?: string;
  /** Scroll trigger threshold */
  threshold?: number;
  /** Trigger immediately without waiting for scroll */
  immediate?: boolean;
  /** Container CSS classes */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  baseDelay = 0,
  staggerDelay,
  duration = 450,
  easing,
  threshold = 0.1,
  immediate = false,
  className = '',
  style = {},
  children,
}) => {
  const { preset, isReducedMotion, canAnimateSections } = useAnimationState();
  const effectiveStagger = staggerDelay !== undefined ? staggerDelay : preset.staggerDelay;
  const effectiveEasing = easing || preset.easing;

  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold,
    triggerOnce: true,
    disabled: immediate,
  });

  const isTriggered = isReducedMotion || (immediate ? canAnimateSections : isVisible && canAnimateSections);

  const contextValue = useMemo<StaggerContextValue>(() => ({
    isTriggered,
    baseDelay,
    staggerDelay: effectiveStagger,
    duration,
    easing: effectiveEasing,
    isReduced: isReducedMotion,
  }), [isTriggered, baseDelay, effectiveStagger, duration, effectiveEasing, isReducedMotion]);

  return (
    <StaggerContext.Provider value={contextValue}>
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
};

export interface StaggerItemProps {
  /** Index in the sequence (0-based) */
  index: number;
  /** Additional custom delay offset (ms) */
  delayOffset?: number;
  /** Movement direction on entrance */
  direction?: 'up' | 'down' | 'none';
  /** Distance in pixels (default: 14px) */
  distance?: number;
  /** Additional classes */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  index,
  delayOffset = 0,
  direction = 'up',
  distance = 14,
  className = '',
  style = {},
  children,
}) => {
  const context = useContext(StaggerContext);

  if (!context || context.isReduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const { isTriggered, baseDelay, staggerDelay, duration, easing } = context;
  const itemDelay = baseDelay + index * staggerDelay + delayOffset;

  const getTransform = (): string => {
    if (!isTriggered) {
      if (direction === 'up') return `translate3d(0, ${distance}px, 0)`;
      if (direction === 'down') return `translate3d(0, -${distance}px, 0)`;
      return 'translate3d(0, 0, 0)';
    }
    return 'translate3d(0, 0, 0)';
  };

  return (
    <div
      className={`transition-all will-change-transform ${className}`}
      style={{
        ...style,
        opacity: isTriggered ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`,
        transitionDelay: `${itemDelay}ms`,
        transitionTimingFunction: easing,
      }}
    >
      {children}
    </div>
  );
};
