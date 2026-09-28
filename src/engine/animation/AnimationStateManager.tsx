/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file AnimationStateManager.
 * Coordinates the full animation lifecycle:
 * idle -> opening -> opened -> revealed_sections -> completed.
 * Ensures animations do not collide and scroll reveals do not fire prematurely.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TemplateAnimationPreset, getAnimationPreset } from './presets';
import { useReducedMotion } from './ReducedMotionController';

export type AnimationState =
  | 'idle'
  | 'opening'
  | 'opened'
  | 'revealed_sections'
  | 'completed';

export interface AnimationStateContextValue {
  state: AnimationState;
  preset: TemplateAnimationPreset;
  isReducedMotion: boolean;
  canAnimateSections: boolean;
  canAnimateParallax: boolean;
  setAnimationState: (newState: AnimationState) => void;
  triggerOpenComplete: () => void;
  resetAnimation: () => void;
}

const AnimationStateContext = createContext<AnimationStateContextValue | null>(null);

export interface AnimationStateManagerProps {
  templateId?: string;
  isEnvelopeOpen?: boolean;
  manualReducedMotion?: boolean | null;
  children: React.ReactNode;
}

export const AnimationStateManager: React.FC<AnimationStateManagerProps> = ({
  templateId,
  isEnvelopeOpen = false,
  manualReducedMotion = null,
  children,
}) => {
  const isReduced = useReducedMotion(manualReducedMotion);
  const preset = useMemo(() => getAnimationPreset(templateId), [templateId]);

  // Initial state depends on whether the envelope is already considered open
  const [state, setState] = useState<AnimationState>(() => {
    return isEnvelopeOpen ? 'opened' : 'idle';
  });

  // Keep state synchronized with envelope open flag
  useEffect(() => {
    if (isEnvelopeOpen && (state === 'idle' || state === 'opening')) {
      setState('opened');
    } else if (!isEnvelopeOpen && state !== 'idle' && state !== 'opening') {
      setState('idle');
    }
  }, [isEnvelopeOpen]);

  // Automated progression from 'opened' -> 'revealed_sections' -> 'completed'
  useEffect(() => {
    if (state === 'opened') {
      // Allow initial hero / intro items to stagger in
      const timer1 = setTimeout(() => {
        setState('revealed_sections');
      }, isReduced ? 20 : 180);

      const timer2 = setTimeout(() => {
        setState('completed');
      }, isReduced ? 50 : 800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [state, isReduced]);

  const triggerOpenComplete = useCallback(() => {
    setState('opened');
  }, []);

  const resetAnimation = useCallback(() => {
    setState(isEnvelopeOpen ? 'opened' : 'idle');
  }, [isEnvelopeOpen]);

  // Section animations are only enabled once the envelope is opened or if reduced motion
  const canAnimateSections = isReduced || state === 'opened' || state === 'revealed_sections' || state === 'completed';
  const canAnimateParallax = !isReduced && (state === 'revealed_sections' || state === 'completed');

  const contextValue = useMemo<AnimationStateContextValue>(() => ({
    state,
    preset,
    isReducedMotion: isReduced,
    canAnimateSections,
    canAnimateParallax,
    setAnimationState: setState,
    triggerOpenComplete,
    resetAnimation,
  }), [state, preset, isReduced, canAnimateSections, canAnimateParallax, triggerOpenComplete, resetAnimation]);

  return (
    <AnimationStateContext.Provider value={contextValue}>
      {children}
    </AnimationStateContext.Provider>
  );
};

export const useAnimationState = (): AnimationStateContextValue => {
  const context = useContext(AnimationStateContext);
  if (!context) {
    // Graceful fallback outside provider
    const preset = getAnimationPreset('classic-elegance');
    return {
      state: 'completed',
      preset,
      isReducedMotion: false,
      canAnimateSections: true,
      canAnimateParallax: true,
      setAnimationState: () => {},
      triggerOpenComplete: () => {},
      resetAnimation: () => {},
    };
  }
  return context;
};
