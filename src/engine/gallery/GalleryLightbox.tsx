/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file GalleryLightbox component.
 * Luxury full-screen image viewer with keyboard navigation, touch gestures,
 * zoom, image counter, and accessible focus management.
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { GalleryItem } from '../../types/database';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';

export interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
  accentColor?: string;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  accentColor = '#C9A45C',
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setIsZoomed(false);
    setImageLoaded(false);
    onIndexChange((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onIndexChange]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setIsZoomed(false);
    setImageLoaded(false);
    onIndexChange((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onIndexChange]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        // In RTL, right arrow moves to previous item
        handlePrev();
      } else if (e.key === 'ArrowLeft') {
        // In RTL, left arrow moves to next item
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Mobile Touch Gestures (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || isZoomed) return;
    const delta = e.touches[0].clientX - touchStartX;
    setTouchDeltaX(delta);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || isZoomed) return;
    const threshold = 55; // swipe distance in px

    if (touchDeltaX > threshold) {
      // Swiped Right -> in RTL this goes to previous/next depending on natural feel
      handleNext();
    } else if (touchDeltaX < -threshold) {
      // Swiped Left
      handlePrev();
    }

    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="عرض صورة المعرض بالحجم الكامل"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 text-white select-none backdrop-blur-md animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      dir="rtl"
    >
      {/* Top Bar Header */}
      <header className="w-full flex items-center justify-between px-4 sm:px-6 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        {/* Counter */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs sm:text-sm tracking-wider text-neutral-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label={isZoomed ? 'تصغير' : 'تكبير'}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 transition cursor-pointer"
            title={isZoomed ? 'تصغير' : 'تكبير'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" /> : <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <button
            onClick={onClose}
            aria-label="إغلاق العرض"
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* Main Image Stage */}
      <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Navigation Arrow Left */}
        {items.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="الصورة التالية"
            className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 transition cursor-pointer backdrop-blur-xs"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Loading Spinner */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }}
            />
          </div>
        )}

        {/* Current Lightbox Image */}
        <div
          className={`relative max-w-5xl max-h-[80vh] flex items-center justify-center transition-transform duration-300 ease-out will-change-transform ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          style={{
            transform: !isZoomed && touchDeltaX !== 0 ? `translateX(${touchDeltaX}px)` : undefined,
          }}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentItem.media_url || currentItem.thumbnail_url}
            alt={currentItem.caption || `صورة ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className="max-w-full max-h-[78vh] object-contain rounded-lg sm:rounded-xl shadow-2xl select-none"
          />
        </div>

        {/* Navigation Arrow Right */}
        {items.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="الصورة السابقة"
            className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 transition cursor-pointer backdrop-blur-xs"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Caption */}
      <footer className="w-full px-4 sm:px-8 py-4 z-20 bg-gradient-to-t from-black/80 to-transparent text-center">
        {currentItem.caption ? (
          <p className="text-sm sm:text-base text-neutral-200 font-serif max-w-xl mx-auto drop-shadow-md">
            {currentItem.caption}
          </p>
        ) : (
          <div className="h-5" />
        )}
      </footer>
    </div>
  );
};
