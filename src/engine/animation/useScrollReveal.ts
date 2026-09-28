/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ScrollRevealController & useScrollReveal.
 * High-performance scroll observer using IntersectionObserver with
 * mobile-first viewport optimizations and reduced-motion safety.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAnimationState } from './AnimationStateManager';

export interface ScrollRevealOptions {
  /** Percentage of target visibility before trigger (0.0 – 1.0) */
  threshold?: number;
  /** Viewport margin offset to trigger before entering screen */
  rootMargin?: string;
  /** Whether to trigger only once (default: true) */
  triggerOnce?: boolean;
  /** Manual disable override */
  disabled?: boolean;
}

export interface ScrollRevealResult<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T | null>;
  isVisible: boolean;
  hasTriggered: boolean;
  reset: () => void;
}

export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): ScrollRevealResult<T> => {
  const {
    threshold = 0.12,
    rootMargin = '0px 0px -40px 0px',
    triggerOnce = true,
    disabled = false,
  } = options;

  const { isReducedMotion, canAnimateSections } = useAnimationState();
  const elementRef = useRef<T | null>(null);

  // If reduced motion is active, immediately reveal without animations
  const [isVisible, setIsVisible] = useState<boolean>(() => isReducedMotion);
  const [hasTriggered, setHasTriggered] = useState<boolean>(() => isReducedMotion);

  const reset = useCallback(() => {
    setIsVisible(isReducedMotion);
    setHasTriggered(isReducedMotion);
  }, [isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) {
      setIsVisible(true);
      setHasTriggered(true);
      return;
    }

    if (disabled || !canAnimateSections) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsVisible(true);
      setHasTriggered(true);
      return;
    }

    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasTriggered(true);

            if (triggerOnce && observer && element) {
              observer.unobserve(element);
              observer.disconnect();
              observer = null;
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
  }, [threshold, rootMargin, triggerOnce, disabled, canAnimateSections, isReducedMotion]);

  return {
    ref: elementRef,
    isVisible: isReducedMotion ? true : isVisible,
    hasTriggered: isReducedMotion ? true : hasTriggered,
    reset,
  };
};
