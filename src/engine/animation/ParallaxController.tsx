/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ParallaxController & ParallaxLayer.
 * Gentle, battery-friendly parallax translation using requestAnimationFrame.
 * Automatically disabled on mobile screens and reduced-motion environments.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAnimationState } from './AnimationStateManager';

export interface ParallaxLayerProps {
  /** Speed multiplier (-0.15 to +0.15). Positive moves slower than scroll, negative faster. */
  speed?: number;
  /** Direction of parallax movement */
  direction?: 'vertical' | 'horizontal';
  /** Max offset displacement limit in pixels */
  clampPx?: number;
  /** Additional classes */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  speed,
  direction = 'vertical',
  clampPx = 35,
  className = '',
  style = {},
  children,
}) => {
  const { preset, isReducedMotion, canAnimateParallax } = useAnimationState();
  const effectiveSpeed = speed !== undefined ? speed : preset.parallaxFactor;

  const targetRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const rafIdRef = useRef<number | null>(null);

  const calculateOffset = useCallback(() => {
    if (!targetRef.current || typeof window === 'undefined') return;

    // Disabled on small mobile devices for battery and viewport performance
    if (window.innerWidth < 640 || isReducedMotion || !canAnimateParallax) {
      if (offset !== 0) setOffset(0);
      return;
    }

    const rect = targetRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Only compute if within viewport bounds
    if (rect.bottom >= -100 && rect.top <= windowHeight + 100) {
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const rawDisplacement = (elementCenter - viewportCenter) * effectiveSpeed;
      const clampedDisplacement = Math.max(-clampPx, Math.min(clampPx, rawDisplacement));
      setOffset(clampedDisplacement);
    }
  }, [effectiveSpeed, clampPx, isReducedMotion, canAnimateParallax, offset]);

  useEffect(() => {
    if (isReducedMotion || !canAnimateParallax) {
      setOffset(0);
      return;
    }

    const handleScroll = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        calculateOffset();
        rafIdRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    calculateOffset();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafIdRef.current) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [calculateOffset, isReducedMotion, canAnimateParallax]);

  if (isReducedMotion || !canAnimateParallax) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const transformStyle = direction === 'vertical'
    ? `translate3d(0, ${offset.toFixed(1)}px, 0)`
    : `translate3d(${offset.toFixed(1)}px, 0, 0)`;

  return (
    <div
      ref={targetRef}
      className={`will-change-transform ${className}`}
      style={{
        ...style,
        transform: transformStyle,
        transition: 'transform 0.1s linear',
      }}
    >
      {children}
    </div>
  );
};
