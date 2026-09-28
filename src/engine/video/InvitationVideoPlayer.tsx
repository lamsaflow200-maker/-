/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file InvitationVideoPlayer component.
 * Luxury custom video player matching Mnasbati template identity.
 * Features: Play/Pause, Progress scrub, Volume, Fullscreen, Poster,
 * lazy-loaded performance (never preloads large videos), error state.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export type VideoDisplayStyle = 'cinematic' | 'framed' | 'editorial' | 'contained' | 'rounded';

export interface InvitationVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  description?: string;
  accentColor?: string;
  displayStyle?: VideoDisplayStyle;
  className?: string;
  onTrackAction?: (actionName: string) => void;
}

export const InvitationVideoPlayer: React.FC<InvitationVideoPlayerProps> = ({
  src,
  poster,
  title,
  description,
  accentColor = '#C9A45C',
  displayStyle = 'contained',
  className = '',
  onTrackAction,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted for web compliance
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasUserStarted, setHasUserStarted] = useState(false);

  const controlsTimeoutRef = useRef<number | null>(null);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasUserStarted(true);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        onTrackAction?.('video_play');
      }).catch((err) => {
        console.warn('Playback error or prevented:', err);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setProgress(dur > 0 ? (cur / dur) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekPercentage = Number(e.target.value);
    const targetTime = (seekPercentage / 100) * duration;
    videoRef.current.currentTime = targetTime;
    setProgress(seekPercentage);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Auto-hide controls when playing and inactive
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Derive container style according to template display style
  const getContainerClasses = () => {
    switch (displayStyle) {
      case 'cinematic':
        return 'rounded-3xl shadow-2xl border-2 border-black/80';
      case 'framed':
        return 'rounded-2xl p-1.5 shadow-xl border-2';
      case 'editorial':
        return 'rounded-xl shadow-lg border';
      case 'rounded':
        return 'rounded-full overflow-hidden aspect-square border-4';
      case 'contained':
      default:
        return 'rounded-2xl shadow-md border';
    }
  };

  if (hasError) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center p-6 text-center text-neutral-300">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-xs font-serif">تعذر تشغيل هذا الفيديو حالياً</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full aspect-video overflow-hidden bg-black select-none group ${getContainerClasses()} ${className}`}
      style={{
        borderColor: displayStyle === 'framed' ? accentColor : `${accentColor}40`,
      }}
      dir="ltr"
    >
      {/* HTML5 Video Element (preload none to ensure zero lag on invitation open) */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="none"
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Big Central Luxury Play Button (Shown when not playing) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/35 cursor-pointer transition-opacity duration-300 backdrop-blur-[2px]"
        >
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: accentColor,
              color: '#0E0E11',
              boxShadow: `0 0 35px ${accentColor}60`,
            }}
          >
            <Play className="w-7 h-7 sm:w-9 sm:h-9 translate-x-0.5 fill-current" />
          </div>

          {title && (
            <p className="mt-4 text-xs sm:text-sm font-serif text-white font-bold tracking-wide drop-shadow-md px-4 text-center">
              {title}
            </p>
          )}
        </div>
      )}

      {/* Control Bar Overlay (Bottom) */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar */}
        <div className="relative w-full flex items-center mb-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            aria-label="شريط تقدم الفيديو"
            className="w-full h-1 sm:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C9A45C]"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left: Play/Pause, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              className="p-1 hover:text-[#C9A45C] transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
            </button>

            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              className="p-1 hover:text-[#C9A45C] transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <span className="font-mono text-[11px] text-neutral-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Fullscreen */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
              className="p-1 hover:text-[#C9A45C] transition cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
