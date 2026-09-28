/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file InvitationMusicPlayer component.
 * Elegant floating background audio player for Mnasbati invitations.
 * Handles browser autoplay policies, visual acoustic waves, mute/pause memory,
 * and seamless cross-section playback.
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { MusicTrack } from '../../types/database';
import { TemplateStylePreset } from '../../types/engine';
import { Music, Volume2, VolumeX, Play, Pause, Disc } from 'lucide-react';
import { useAnimationState } from '../animation/AnimationStateManager';

export interface InvitationMusicPlayerProps {
  track?: MusicTrack | null;
  style: TemplateStylePreset;
  templateId?: string;
  autoPlayEnabled?: boolean;
  userInteracted?: boolean;
  onTrackAction?: (actionName: string) => void;
}

export type MusicPlayerState = 'off' | 'loading' | 'playing' | 'paused' | 'muted';

export const InvitationMusicPlayer: React.FC<InvitationMusicPlayerProps> = ({
  track,
  style,
  templateId = 'classic-elegance',
  autoPlayEnabled = true,
  userInteracted = false,
  onTrackAction,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { state: animationState } = useAnimationState();

  const [playerState, setPlayerState] = useState<MusicPlayerState>('off');
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserManuallyPaused, setHasUserManuallyPaused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const hasTrack = Boolean(track && track.audio_url && track.is_active !== false);

  // Autoplay attempt once envelope opens and user interacted
  useEffect(() => {
    if (!hasTrack || hasUserManuallyPaused || !autoPlayEnabled) return;
    if (playerState === 'playing') return;

    // When animationState is 'opened' or user has interacted, attempt smooth playback
    if (animationState === 'opened' || animationState === 'revealed_sections' || userInteracted) {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setPlayerState('playing');
          onTrackAction?.('music_play');
        }).catch((err) => {
          // Browser prevented autoplay with sound, fall back gracefully
          console.log('Autoplay was prevented by browser policy, ready for user interaction:', err);
          setPlayerState('paused');
        });
      }
    }
  }, [hasTrack, animationState, userInteracted, hasUserManuallyPaused, autoPlayEnabled, playerState, onTrackAction]);

  const togglePlayback = () => {
    if (!audioRef.current || !hasTrack) return;

    if (playerState === 'playing') {
      audioRef.current.pause();
      setPlayerState('paused');
      setHasUserManuallyPaused(true);
    } else {
      audioRef.current.play().then(() => {
        setPlayerState('playing');
        setHasUserManuallyPaused(false);
        onTrackAction?.('music_play');
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!hasTrack) {
    return null;
  }

  const isPlaying = playerState === 'playing';

  // Derive position according to template identity (Prompt 14 requirement 21)
  const { positionClasses, isTopPosition } = useMemo(() => {
    switch (templateId) {
      case 'royal-gold':
      case 'minimal-white':
        return { positionClasses: 'fixed top-5 left-5 z-40', isTopPosition: true };
      case 'moroccan-palace':
      case 'floral-romance':
        return { positionClasses: 'fixed top-1/2 -translate-y-1/2 left-4 z-40', isTopPosition: false };
      case 'emerald-royal':
      case 'sapphire-night':
        return { positionClasses: 'fixed bottom-5 right-5 z-40', isTopPosition: false };
      case 'black-luxury':
      case 'golden-sunset':
      case 'rose-romance':
      case 'elegant-pearl':
      default:
        return { positionClasses: 'fixed bottom-5 left-5 z-40', isTopPosition: false };
    }
  }, [templateId]);

  return (
    <div
      role="region"
      aria-label="مشغل الموسيقى الخلفية للدعوة"
      className={`${positionClasses} select-none flex items-center gap-2`}
      dir="rtl"
    >
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={track?.audio_url}
        loop={track?.loop !== false}
        preload="metadata"
        onEnded={() => setPlayerState('paused')}
        onError={() => setPlayerState('off')}
      />

      {/* Floating Interactive Music Button */}
      <div className="relative group">
        <button
          onClick={togglePlayback}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={isPlaying ? 'إيقاف الموسيقى مؤقتاً' : 'تشغيل الموسيقى الخلفية'}
          className={`relative w-12 h-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isPlaying ? 'hover:scale-105 active:scale-95' : 'hover:scale-105 active:scale-95 opacity-90'
          }`}
          style={{
            backgroundColor: style.cardBg,
            borderColor: `${style.accentColor}60`,
            boxShadow: isPlaying
              ? `0 8px 24px -4px ${style.accentColor}40, 0 0 14px ${style.accentColor}30`
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Subtle Vinyl Disc / Note Graphic */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-700 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{
              animationDuration: '6s',
              color: style.accentColor,
            }}
          >
            <Disc className="w-6 h-6 stroke-[1.5]" />
          </div>

          {/* Playing Acoustic Waves Indicator */}
          {isPlaying && !isMuted && (
            <div className="absolute -top-1 -right-1 flex items-end gap-0.5 h-3.5 px-1 bg-black/70 rounded-full border border-white/20">
              <span className="w-0.5 h-2 bg-[#C9A45C] rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-[#C9A45C] rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-[#C9A45C] rounded-full animate-pulse delay-150" />
            </div>
          )}

          {/* Play/Pause Overlay Micro Badge */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-black/80 border border-white/30 flex items-center justify-center text-white"
            style={{ fontSize: '8px' }}
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2 h-2 translate-x-px fill-current" />}
          </div>
        </button>

        {/* Hover / Active Track Tooltip */}
        {showTooltip && track?.name && (
          <div
            className={`absolute ${
              isTopPosition ? 'top-14 slide-in-from-top-2' : 'bottom-14 slide-in-from-bottom-2'
            } left-0 min-w-[160px] max-w-xs bg-black/90 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs shadow-2xl border border-white/15 animate-in fade-in duration-150 pointer-events-none`}
          >
            <p className="font-serif font-bold text-[#C9A45C] truncate">{track.name}</p>
            {track.artist && (
              <p className="text-[10px] text-neutral-300 truncate">{track.artist}</p>
            )}
            <p className="text-[9px] text-neutral-400 mt-1">
              {isPlaying ? 'اضغط للإيقاف المؤقت' : 'اضغط للاستماع'}
            </p>
          </div>
        )}
      </div>

      {/* Mute/Unmute Quick Toggle */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          className="w-8 h-8 rounded-full border border-black/10 bg-white/80 hover:bg-white text-neutral-700 shadow-sm flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
          title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-600" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
};
