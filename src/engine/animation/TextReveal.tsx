/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file TextReveal component.
 * Luxury typography animations for headings, quotes, and names.
 * Supports: fade, slide-up, words, blur, mask.
 */

import React, { useMemo } from 'react';
import { TextRevealStyle } from './presets';
import { useAnimationState } from './AnimationStateManager';
import { useScrollReveal } from './useScrollReveal';

export interface TextRevealProps {
  /** Reveal style (defaults to template preset) */
  variant?: TextRevealStyle;
  /** Direct text string to animate */
  text?: string;
  /** HTML Tag to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  /** Delay before reveal begins (ms) */
  delay?: number;
  /** Duration of the text reveal (ms) */
  duration?: number;
  /** Word-by-word stagger offset (ms: 30–60ms) */
  stagger?: number;
  /** Additional classes */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
  /** Trigger immediately without scroll */
  immediate?: boolean;
  /** Optional custom children when not providing pure text */
  children?: React.ReactNode;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  variant,
  text,
  as: Component = 'div',
  delay = 0,
  duration,
  stagger = 40,
  className = '',
  style = {},
  immediate = false,
  children,
}) => {
  const { preset, isReducedMotion, canAnimateSections } = useAnimationState();
  const effectiveVariant = variant || preset.textReveal;
  const effectiveDuration = duration !== undefined ? duration : 500;
  const easing = preset.easing;

  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
    disabled: immediate,
  });

  const shouldAnimate = isReducedMotion || (immediate ? canAnimateSections : isVisible && canAnimateSections);

  // If reduced motion is requested or server-side, render plain text
  if (isReducedMotion) {
    return (
      <Component className={className} style={style}>
        {text || children}
      </Component>
    );
  }

  // Word-by-Word Luxury Reveal
  if (effectiveVariant === 'words' && text) {
    const words = text.split(' ');
    return (
      <Component
        ref={ref as any}
        className={`inline-block ${className}`}
        style={style}
      >
        {words.map((word, idx) => {
          const wordDelay = delay + idx * stagger;
          return (
            <span
              key={`${word}-${idx}`}
              className="inline-block transition-all will-change-transform"
              style={{
                opacity: shouldAnimate ? 1 : 0,
                transform: shouldAnimate ? 'translateY(0)' : 'translateY(12px)',
                filter: shouldAnimate ? 'blur(0px)' : 'blur(4px)',
                transitionDuration: `${effectiveDuration}ms`,
                transitionDelay: `${wordDelay}ms`,
                transitionTimingFunction: easing,
                marginRight: '0.28em',
              }}
            >
              {word}
            </span>
          );
        })}
      </Component>
    );
  }

  // Mask Reveal (Text emerges from behind an overflow-hidden boundary)
  if (effectiveVariant === 'mask') {
    return (
      <div ref={ref} className="overflow-hidden inline-block w-full">
        <Component
          className={`transition-transform duration-700 ease-out will-change-transform ${className}`}
          style={{
            ...style,
            transform: shouldAnimate ? 'translateY(0)' : 'translateY(105%)',
            transitionDelay: `${delay}ms`,
            transitionTimingFunction: easing,
          }}
        >
          {text || children}
        </Component>
      </div>
    );
  }

  // Blur, Slide-Up, or Fade
  const getTransform = (): string => {
    if (effectiveVariant === 'slide-up') {
      return shouldAnimate ? 'translateY(0)' : 'translateY(18px)';
    }
    return 'translateY(0)';
  };

  const getFilter = (): string => {
    if (effectiveVariant === 'blur') {
      return shouldAnimate ? 'blur(0px)' : 'blur(6px)';
    }
    return 'blur(0px)';
  };

  return (
    <Component
      ref={ref as any}
      className={`transition-all will-change-transform ${className}`}
      style={{
        ...style,
        opacity: shouldAnimate ? 1 : 0,
        transform: getTransform(),
        filter: getFilter(),
        transitionDuration: `${effectiveDuration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: easing,
      }}
    >
      {text || children}
    </Component>
  );
};
