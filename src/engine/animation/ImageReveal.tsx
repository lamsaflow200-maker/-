/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ImageReveal component.
 * Luxury image presentation with smooth entrance transitions:
 * fade, scale (1.04 -> 1.0), clip, mask, blur-to-clear.
 * Includes shimmer placeholder and zero-broken-image fallback.
 */

import React, { useState } from 'react';
import { ImageRevealStyle } from './presets';
import { useAnimationState } from './AnimationStateManager';
import { useScrollReveal } from './useScrollReveal';
import { ImageIcon } from 'lucide-react';

export interface ImageRevealProps {
  /** Image source URL */
  src?: string;
  /** Accessible alternative text */
  alt: string;
  /** Image reveal transition style (defaults to template preset) */
  variant?: ImageRevealStyle;
  /** Transition duration (ms: 600–1000ms) */
  duration?: number;
  /** Delay before reveal (ms) */
  delay?: number;
  /** Aspect ratio container class (e.g. 'aspect-4/3', 'aspect-video', 'aspect-square') */
  aspectRatio?: string;
  /** Outer container class */
  className?: string;
  /** Image element class */
  imageClassName?: string;
  /** Optional custom fallback component when image fails */
  fallback?: React.ReactNode;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  src,
  alt,
  variant,
  duration = 800,
  delay = 0,
  aspectRatio = 'aspect-4/3',
  className = '',
  imageClassName = '',
  fallback,
}) => {
  const { preset, isReducedMotion, canAnimateSections } = useAnimationState();
  const effectiveVariant = variant || preset.imageReveal;
  const easing = preset.easing;

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(!src);

  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.15,
    triggerOnce: true,
  });

  const shouldReveal = isReducedMotion || (isVisible && canAnimateSections && isLoaded);

  // If no source or error occurred, render zero-broken-image fallback
  if (hasError || !src) {
    if (fallback) return <div className={className}>{fallback}</div>;

    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-neutral-900/40 border border-neutral-700/30 flex flex-col items-center justify-center p-6 text-center select-none ${aspectRatio} ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-2">
          <ImageIcon className="w-5 h-5 opacity-60" />
        </div>
        <p className="text-xs text-neutral-400 font-serif line-clamp-1">{alt}</p>
      </div>
    );
  }

  // Derive transform and filter based on reveal variant
  const getTransform = (): string => {
    if (isReducedMotion) return 'scale(1)';
    if (!shouldReveal) {
      if (effectiveVariant === 'scale') return 'scale(1.05)';
      return 'scale(1)';
    }
    return 'scale(1)';
  };

  const getFilter = (): string => {
    if (isReducedMotion) return 'none';
    if (!shouldReveal) {
      if (effectiveVariant === 'blur-to-clear') return 'blur(10px)';
      return 'none';
    }
    return 'blur(0px)';
  };

  const getClipPath = (): string | undefined => {
    if (isReducedMotion) return undefined;
    if (effectiveVariant === 'clip') {
      return shouldReveal
        ? 'inset(0% 0% 0% 0% round 16px)'
        : 'inset(12% 12% 12% 12% round 24px)';
    }
    if (effectiveVariant === 'mask') {
      return shouldReveal
        ? 'inset(0 0 0 0)'
        : 'inset(0 0 100% 0)';
    }
    return undefined;
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl select-none ${aspectRatio} ${className}`}
    >
      {/* Loading Shimmer Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-900/30 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        </div>
      )}

      {/* Target Image */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all will-change-transform ${imageClassName}`}
        style={{
          opacity: shouldReveal ? 1 : 0,
          transform: getTransform(),
          filter: getFilter(),
          clipPath: getClipPath(),
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: easing,
        }}
      />
    </div>
  );
};
