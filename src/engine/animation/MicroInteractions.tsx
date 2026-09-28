/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file MicroInteractions components and utilities.
 * Fine-tuned, luxury-calibrated responsive micro-interactions:
 * Buttons (subtle scale, shadow expansion, icon slide)
 * Cards (translateY -2px to -4px with shadow softening)
 * Links (animated underline reveal)
 * Icons (subtle rotation & pulse)
 */

import React, { useState } from 'react';
import { useAnimationState } from './AnimationStateManager';
import { MOTION_EASINGS } from './tokens';

// ==========================================
// 1. Interactive Button
// ==========================================
export interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'luxury';
  accentColor?: string;
  glow?: boolean;
  children: React.ReactNode;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  variant = 'primary',
  accentColor,
  glow = false,
  className = '',
  style = {},
  disabled,
  children,
  ...props
}) => {
  const { isReducedMotion } = useAnimationState();
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getTransform = (): string => {
    if (isReducedMotion || disabled) return 'scale(1)';
    if (isActive) return 'scale(0.97)';
    if (isHovered) return 'scale(1.02)';
    return 'scale(1)';
  };

  const getBoxShadow = (): string | undefined => {
    if (isReducedMotion || disabled || !glow) return undefined;
    if (isHovered && accentColor) {
      return `0 8px 24px -4px ${accentColor}40, 0 0 12px ${accentColor}20`;
    }
    return undefined;
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={(e) => {
        setIsHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        setIsActive(false);
        props.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        setIsActive(true);
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setIsActive(false);
        props.onMouseUp?.(e);
      }}
      className={`cursor-pointer select-none transition-all duration-200 active:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      style={{
        ...style,
        transform: getTransform(),
        boxShadow: getBoxShadow() || style.boxShadow,
        transitionTimingFunction: MOTION_EASINGS.easeLuxury,
      }}
    >
      {children}
    </button>
  );
};

// ==========================================
// 2. Interactive Card
// ==========================================
export interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: number; // 2 to 4px
  children: React.ReactNode;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  elevation = 3,
  className = '',
  style = {},
  children,
  ...props
}) => {
  const { isReducedMotion } = useAnimationState();
  const [isHovered, setIsHovered] = useState(false);

  const transform = !isReducedMotion && isHovered
    ? `translate3d(0, -${elevation}px, 0)`
    : 'translate3d(0, 0, 0)';

  return (
    <div
      {...props}
      onMouseEnter={(e) => {
        setIsHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        props.onMouseLeave?.(e);
      }}
      className={`transition-all duration-300 will-change-transform ${className}`}
      style={{
        ...style,
        transform,
        transitionTimingFunction: MOTION_EASINGS.easeLuxury,
      }}
    >
      {children}
    </div>
  );
};

// ==========================================
// 3. Interactive Link (Underline Reveal)
// ==========================================
export interface InteractiveLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  underlineColor?: string;
  children: React.ReactNode;
}

export const InteractiveLink: React.FC<InteractiveLinkProps> = ({
  underlineColor = 'currentColor',
  className = '',
  style = {},
  children,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      {...props}
      onMouseEnter={(e) => {
        setIsHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        props.onMouseLeave?.(e);
      }}
      className={`relative inline-block cursor-pointer transition-colors duration-200 ${className}`}
      style={style}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[1.5px] w-full transition-transform duration-300 origin-right"
        style={{
          backgroundColor: underlineColor,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: isHovered ? 'left' : 'right',
          transitionTimingFunction: MOTION_EASINGS.easeLuxury,
        }}
      />
    </a>
  );
};

// ==========================================
// 4. Interactive Icon
// ==========================================
export interface InteractiveIconProps {
  icon: React.ReactNode;
  rotateDeg?: number;
  className?: string;
}

export const InteractiveIcon: React.FC<InteractiveIconProps> = ({
  icon,
  rotateDeg = 6,
  className = '',
}) => {
  const { isReducedMotion } = useAnimationState();
  const [isHovered, setIsHovered] = useState(false);

  const transform = !isReducedMotion && isHovered
    ? `rotate(${rotateDeg}deg) scale(1.08)`
    : 'rotate(0deg) scale(1)';

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center justify-center transition-transform duration-250 ${className}`}
      style={{
        transform,
        transitionTimingFunction: MOTION_EASINGS.easeLuxury,
      }}
    >
      {icon}
    </span>
  );
};
