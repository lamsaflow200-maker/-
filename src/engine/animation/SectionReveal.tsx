/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file SectionReveal component.
 * Executes smooth, luxury entrance transitions for invitation sections.
 * Hidden -> Prepare -> Reveal -> Visible
 */

import React, { useState, useEffect } from 'react';
import { SectionRevealStyle } from './presets';
import { useAnimationState } from './AnimationStateManager';
import { useScrollReveal } from './useScrollReveal';

export interface SectionRevealProps {
  /** Reveal style override (defaults to template preset) */
  type?: SectionRevealStyle;
  /** Transition duration in milliseconds (defaults to template preset) */
  duration?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Custom easing curve (defaults to template preset) */
  easing?: string;
  /** Scroll trigger threshold (0.0 to 1.0) */
  threshold?: number;
  /** Root margin offset */
  rootMargin?: string;
  /** Trigger only once (default: true) */
  triggerOnce?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Immediate reveal without waiting for scroll (useful for Hero) */
  immediate?: boolean;
  /** Section content */
  children: React.ReactNode;
}

type RevealPhase = 'hidden' | 'prepare' | 'reveal' | 'visible';

export const SectionReveal: React.FC<SectionRevealProps> = ({
  type,
  duration,
  delay = 0,
  easing,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
  className = '',
  style = {},
  immediate = false,
  children,
}) => {
  const { preset, isReducedMotion, canAnimateSections } = useAnimationState();
  const effectiveType = type || preset.sectionReveal;
  const effectiveDuration = duration !== undefined ? duration : preset.sectionDuration;
  const effectiveEasing = easing || preset.easing;

  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
    disabled: immediate,
  });

  const [phase, setPhase] = useState<RevealPhase>(() => {
    if (isReducedMotion) return 'visible';
    return 'hidden';
  });

  const shouldTrigger = isReducedMotion || (immediate ? canAnimateSections : isVisible && canAnimateSections);

  useEffect(() => {
    if (isReducedMotion) {
      setPhase('visible');
      return;
    }

    if (shouldTrigger && (phase === 'hidden' || phase === 'prepare')) {
      // 1. Prepare phase
      setPhase('prepare');

      // 2. Reveal phase after delay
      const delayTimer = setTimeout(() => {
        setPhase('reveal');

        // 3. Settled visible phase after duration
        const settleTimer = setTimeout(() => {
          setPhase('visible');
        }, effectiveDuration + 50);

        return () => clearTimeout(settleTimer);
      }, delay);

      return () => clearTimeout(delayTimer);
    }
  }, [shouldTrigger, isReducedMotion, delay, effectiveDuration]);

  // If reduced motion is requested, render instantly without animation styles
  if (isReducedMotion) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  // Derive inline styles based on phase and reveal type
  const isHidden = phase === 'hidden' || phase === 'prepare';

  const getTransformStyle = (): string => {
    if (!isHidden) return 'translate3d(0, 0, 0) scale(1)';
    switch (effectiveType) {
      case 'slide-up':
        return 'translate3d(0, 24px, 0)';
      case 'slide-down':
        return 'translate3d(0, -24px, 0)';
      case 'slide-left':
        return 'translate3d(24px, 0, 0)';
      case 'slide-right':
        return 'translate3d(-24px, 0, 0)';
      case 'scale':
        return 'translate3d(0, 10px, 0) scale(0.96)';
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const getFilterStyle = (): string | undefined => {
    if (effectiveType === 'blur-to-clear') {
      return isHidden ? 'blur(8px)' : 'blur(0px)';
    }
    return undefined;
  };

  const getClipPathStyle = (): string | undefined => {
    if (effectiveType === 'clip-reveal') {
      // Architectural arch or elegant inset reveal
      return isHidden
        ? 'inset(10% 4% 10% 4% round 20px)'
        : 'inset(0% 0% 0% 0% round 0px)';
    }
    if (effectiveType === 'mask-reveal') {
      return isHidden
        ? 'inset(0 0 100% 0)'
        : 'inset(0 0 0 0)';
    }
    return undefined;
  };

  const dynamicStyles: React.CSSProperties = {
    ...style,
    opacity: isHidden ? 0 : 1,
    transform: getTransformStyle(),
    filter: getFilterStyle(),
    clipPath: getClipPathStyle(),
    transitionProperty: 'opacity, transform, filter, clip-path',
    transitionDuration: `${effectiveDuration}ms`,
    transitionTimingFunction: effectiveEasing,
    willChange: phase === 'reveal' ? 'opacity, transform' : 'auto',
  };

  return (
    <div ref={ref} className={className} style={dynamicStyles}>
      {children}
    </div>
  );
};
