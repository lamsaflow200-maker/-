/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file InvitationAnimationEngine.
 * Central master animation engine for all Mnasbati invitation templates.
 * Unifies MotionTokens, AnimationPresets, SectionReveal, TextReveal,
 * ImageReveal, StaggerAnimation, ParallaxController, MicroInteractions,
 * PageTransitions, ScrollRevealController, ReducedMotionController,
 * and AnimationStateManager.
 */

import React from 'react';
import { AnimationStateManager, useAnimationState } from './AnimationStateManager';
import { SectionReveal } from './SectionReveal';
import { TextReveal } from './TextReveal';
import { ImageReveal } from './ImageReveal';
import { StaggerContainer, StaggerItem } from './StaggerAnimation';
import { ParallaxLayer } from './ParallaxController';
import {
  InteractiveButton,
  InteractiveCard,
  InteractiveLink,
  InteractiveIcon,
} from './MicroInteractions';
import { PageTransition } from './PageTransitions';
import { ScrollRevealController } from './ScrollRevealController';
import { MOTION_TOKENS } from './tokens';
import { TEMPLATE_ANIMATION_PRESETS, getAnimationPreset } from './presets';
import { ReducedMotionController, useReducedMotion } from './ReducedMotionController';

export interface InvitationAnimationEngineProps {
  templateId?: string;
  isEnvelopeOpen?: boolean;
  manualReducedMotion?: boolean | null;
  children: React.ReactNode;
}

export const InvitationAnimationEngine: React.FC<InvitationAnimationEngineProps> & {
  Section: typeof SectionReveal;
  Text: typeof TextReveal;
  Image: typeof ImageReveal;
  Stagger: typeof StaggerContainer;
  StaggerItem: typeof StaggerItem;
  Parallax: typeof ParallaxLayer;
  Button: typeof InteractiveButton;
  Card: typeof InteractiveCard;
  Link: typeof InteractiveLink;
  Icon: typeof InteractiveIcon;
  PageTransition: typeof PageTransition;
  ScrollReveal: typeof ScrollRevealController;
  tokens: typeof MOTION_TOKENS;
  presets: typeof TEMPLATE_ANIMATION_PRESETS;
  getPreset: typeof getAnimationPreset;
} = ({ templateId, isEnvelopeOpen = false, manualReducedMotion = null, children }) => {
  return (
    <AnimationStateManager
      templateId={templateId}
      isEnvelopeOpen={isEnvelopeOpen}
      manualReducedMotion={manualReducedMotion}
    >
      {children}
    </AnimationStateManager>
  );
};

// Static subcomponent attachments for ergonomic component tree authoring
InvitationAnimationEngine.Section = SectionReveal;
InvitationAnimationEngine.Text = TextReveal;
InvitationAnimationEngine.Image = ImageReveal;
InvitationAnimationEngine.Stagger = StaggerContainer;
InvitationAnimationEngine.StaggerItem = StaggerItem;
InvitationAnimationEngine.Parallax = ParallaxLayer;
InvitationAnimationEngine.Button = InteractiveButton;
InvitationAnimationEngine.Card = InteractiveCard;
InvitationAnimationEngine.Link = InteractiveLink;
InvitationAnimationEngine.Icon = InteractiveIcon;
InvitationAnimationEngine.PageTransition = PageTransition;
InvitationAnimationEngine.ScrollReveal = ScrollRevealController;
InvitationAnimationEngine.tokens = MOTION_TOKENS;
InvitationAnimationEngine.presets = TEMPLATE_ANIMATION_PRESETS;
InvitationAnimationEngine.getPreset = getAnimationPreset;
