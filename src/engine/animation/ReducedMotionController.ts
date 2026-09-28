/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ReducedMotionController.
 * Respects WCAG accessibility and user preference for reduced motion.
 */

import { useState, useEffect, useCallback } from 'react';

export class ReducedMotionController {
  private static instance: ReducedMotionController;
  private isSystemReduced: boolean = false;
  private manualOverride: boolean | null = null;
  private listeners: Set<(reduced: boolean) => void> = new Set();
  private mediaQueryList: MediaQueryList | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      this.mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isSystemReduced = this.mediaQueryList.matches;

      const handleChange = (e: MediaQueryListEvent) => {
        this.isSystemReduced = e.matches;
        this.notify();
      };

      if ('addEventListener' in this.mediaQueryList) {
        this.mediaQueryList.addEventListener('change', handleChange);
      } else if ('addListener' in this.mediaQueryList) {
        // Legacy safari support
        (this.mediaQueryList as any).addListener(handleChange);
      }
    }
  }

  public static getInstance(): ReducedMotionController {
    if (!ReducedMotionController.instance) {
      ReducedMotionController.instance = new ReducedMotionController();
    }
    return ReducedMotionController.instance;
  }

  public isReduced(): boolean {
    if (this.manualOverride !== null) {
      return this.manualOverride;
    }
    return this.isSystemReduced;
  }

  public setManualOverride(override: boolean | null): void {
    this.manualOverride = override;
    this.notify();
  }

  public subscribe(listener: (reduced: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const reduced = this.isReduced();
    this.listeners.forEach((listener) => {
      try {
        listener(reduced);
      } catch (err) {
        console.error('Error notifying reduced motion listener:', err);
      }
    });
  }
}

/**
 * Hook to reactively observe reduced motion state.
 */
export const useReducedMotion = (override?: boolean | null): boolean => {
  const [isReduced, setIsReduced] = useState<boolean>(() => {
    if (override !== undefined && override !== null) return override;
    return ReducedMotionController.getInstance().isReduced();
  });

  useEffect(() => {
    if (override !== undefined && override !== null) {
      setIsReduced(override);
      return;
    }

    const controller = ReducedMotionController.getInstance();
    setIsReduced(controller.isReduced());

    const unsubscribe = controller.subscribe((reduced) => {
      setIsReduced(reduced);
    });

    return unsubscribe;
  }, [override]);

  return isReduced;
};
