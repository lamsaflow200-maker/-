/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ScrollRevealController component.
 * Declarative scroll-triggered reveal wrapper.
 */

import React from 'react';
import { useScrollReveal, ScrollRevealOptions } from './useScrollReveal';

export interface ScrollRevealControllerProps extends ScrollRevealOptions {
  children: (props: { isVisible: boolean; hasTriggered: boolean }) => React.ReactNode;
  className?: string;
}

export const ScrollRevealController: React.FC<ScrollRevealControllerProps> = ({
  children,
  className = '',
  ...options
}) => {
  const { ref, isVisible, hasTriggered } = useScrollReveal<HTMLDivElement>(options);

  return (
    <div ref={ref} className={className}>
      {children({ isVisible, hasTriggered })}
    </div>
  );
};
