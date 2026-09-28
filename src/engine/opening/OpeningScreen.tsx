/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OpeningPreset, OpeningPhase } from './types';
import { Envelope } from './Envelope';
import { Sparkles, MailOpen, ArrowDown } from 'lucide-react';

interface OpeningScreenProps {
  preset: OpeningPreset;
  title: string;
  eventType?: string;
  hostNames?: string;
  celebrantNames?: string;
  eventDate?: string;
  venueName?: string;
  onOpenComplete: () => void;
  onUserInteraction?: () => void;
  isPreview?: boolean;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  preset,
  title,
  eventType,
  hostNames,
  celebrantNames,
  eventDate,
  venueName,
  onOpenComplete,
  onUserInteraction,
  isPreview = false,
}) => {
  const [phase, setPhase] = useState<OpeningPhase>('closed');
  const isTriggeredRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Prevent Scroll During Opening (Prompt requirement 13)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  // 2. Reduced Motion Detection (Prompt requirement 15 & 16)
  const isReducedMotion = useCallback(() => {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  // 3. Opening Interaction Sequence (Prompt requirements 5, 6, 7 & 14)
  const handleOpen = useCallback(() => {
    // Prevent double trigger
    if (isTriggeredRef.current) return;
    isTriggeredRef.current = true;

    // Notify user interaction for Audio Autoplay preparation (Prompt requirement 22)
    onUserInteraction?.();

    // Fast-path for reduced motion
    if (isReducedMotion()) {
      setPhase('transitioning');
      setTimeout(() => {
        setPhase('completed');
        onOpenComplete();
      }, 300);
      return;
    }

    // Step 1: Seal breaks (300ms)
    setPhase('opening-seal');

    setTimeout(() => {
      // Step 2: Envelope flap opens (600ms)
      setPhase('opening-flap');

      setTimeout(() => {
        // Step 3: Card reveals and elevates (650ms)
        setPhase('revealing-card');

        setTimeout(() => {
          // Step 4: Cinematic transition into main invitation (650ms)
          setPhase('transitioning');

          setTimeout(() => {
            // Step 5: Sequence finished, remove overlay & restore scroll
            setPhase('completed');
            onOpenComplete();
          }, 650);
        }, 800);
      }, 600);
    }, 300);
  }, [isReducedMotion, onOpenComplete, onUserInteraction]);

  // Keyboard accessibility (Enter or Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'closed' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleOpen]);

  if (phase === 'completed') {
    return null;
  }

  const isTransitioning = phase === 'transitioning';

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="افتتاحية بطاقة الدعوة"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 select-none transition-opacity duration-700 ease-in-out"
      style={{
        background: preset.screenBg,
        opacity: isTransitioning ? 0 : 1,
        pointerEvents: isTransitioning ? 'none' : 'auto',
      }}
      dir="rtl"
    >
      {/* Ambient Lighting & Backdrop Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${preset.glowColor}25 0%, transparent 70%)`,
        }}
      />

      {/* Top Header Section */}
      <header className="relative z-10 w-full max-w-md mx-auto text-center pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-serif mb-2 border border-white/10 bg-white/5 backdrop-blur-xs">
          <Sparkles
            className="w-3.5 h-3.5 animate-pulse"
            style={{ color: preset.glowColor }}
          />
          <span
            className="text-xs tracking-wider"
            style={{ color: preset.glowColor }}
          >
            دعوة خاصة لحضور
          </span>
        </div>

        <h1
          className="text-xl sm:text-2xl font-bold font-serif leading-tight drop-shadow-md px-4"
          style={{
            color: preset.templateId === 'minimal-white' ? '#171717' : '#FAF7F2',
            fontFamily: preset.fontHeading,
          }}
        >
          {celebrantNames || title}
        </h1>
      </header>

      {/* Center 3D Envelope Section */}
      <main className="relative z-10 w-full my-auto flex flex-col items-center justify-center py-4">
        <Envelope
          preset={preset}
          phase={phase}
          title={title}
          eventType={eventType}
          hostNames={hostNames}
          celebrantNames={celebrantNames}
          eventDate={eventDate}
          venueName={venueName}
          onOpen={handleOpen}
        />
      </main>

      {/* Bottom CTA & Prompt Section */}
      <footer className="relative z-10 w-full max-w-md mx-auto text-center pb-4 sm:pb-8 flex flex-col items-center gap-3">
        {phase === 'closed' ? (
          <>
            <button
              onClick={handleOpen}
              className="group relative px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm font-semibold font-serif shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
              style={{
                backgroundColor: preset.buttonStyle.bg,
                color: preset.buttonStyle.text,
                border: preset.buttonStyle.border,
                boxShadow: `0 8px 24px -4px ${preset.glowColor}40`,
              }}
              aria-label="اضغط لفتح الدعوة"
            >
              <MailOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>اضغط لفتح الدعوة</span>
            </button>
            <p
              className="text-[11px] sm:text-xs opacity-60 font-serif flex items-center gap-1.5"
              style={{
                color: preset.templateId === 'minimal-white' ? '#525252' : '#FFFFFF',
              }}
            >
              <span>أو انقر مباشرة على الختم في منتصف الظرف</span>
            </p>
          </>
        ) : (
          <div
            className="flex items-center gap-2 text-xs font-serif animate-pulse"
            style={{
              color: preset.templateId === 'minimal-white' ? '#525252' : '#FAF7F2',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: preset.glowColor }} />
            <span>جاري فتح بطاقة الدعوة...</span>
          </div>
        )}
      </footer>
    </div>
  );
};
