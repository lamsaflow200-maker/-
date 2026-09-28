/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file GalleryRenderer component.
 * Displays invitation gallery with template-specific layouts:
 * Grid, Masonry, Editorial, Carousel, Horizontal Scroll.
 * Integrated with InvitationAnimationEngine and GalleryLightbox.
 */

import React, { useState, useMemo } from 'react';
import { GalleryItem } from '../../types/database';
import { TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { GalleryLightbox } from './GalleryLightbox';
import { ImageReveal } from '../animation/ImageReveal';
import { StaggerContainer, StaggerItem } from '../animation/StaggerAnimation';
import { ChevronRight, ChevronLeft, Images, Maximize2 } from 'lucide-react';

export type GalleryLayoutType =
  | 'grid'
  | 'masonry'
  | 'editorial'
  | 'carousel'
  | 'horizontal-scroll';

export interface GalleryRendererProps {
  items: GalleryItem[];
  style: TemplateStylePreset;
  config?: TemplateConfig;
  templateId?: string;
  onTrackAction?: (actionName: string) => void;
}

export const GalleryRenderer: React.FC<GalleryRendererProps> = ({
  items,
  style,
  config,
  templateId = 'classic-elegance',
  onTrackAction,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Filter only visible items & sort by sort_order
  const visibleItems = useMemo(() => {
    return items
      .filter((item) => item.is_visible !== false)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [items]);

  // Zero Fake Media rule: If no visible gallery items, omit section cleanly
  if (visibleItems.length === 0) {
    return null;
  }

  // Determine layout according to template aesthetic
  const layoutType: GalleryLayoutType = useMemo(() => {
    switch (templateId) {
      case 'royal-gold':
      case 'rose-romance':
        return 'editorial';
      case 'elegant-pearl':
      case 'floral-romance':
        return 'masonry';
      case 'black-luxury':
      case 'golden-sunset':
        return 'carousel';
      case 'minimal-white':
        return 'horizontal-scroll';
      case 'moroccan-palace':
      case 'emerald-royal':
      case 'sapphire-night':
      default:
        return 'grid';
    }
  }, [templateId]);

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
    onTrackAction?.('gallery_open');
  };

  return (
    <div className="w-full space-y-4">
      {/* ======================= 1. EDITORIAL LAYOUT ======================= */}
      {layoutType === 'editorial' && (
        <div className="space-y-3">
          {/* Featured Hero Image */}
          {visibleItems[0] && (
            <div
              onClick={() => handleOpenLightbox(0)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg border"
              style={{ borderColor: `${style.accentColor}40` }}
            >
              <ImageReveal
                src={visibleItems[0].media_url}
                alt={visibleItems[0].caption || 'صورة رئيسية من المعرض'}
                variant="scale"
                aspectRatio="aspect-16/10"
                imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs text-white font-serif flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>انقر للتكبير بالحجم الكامل</span>
                </span>
              </div>
            </div>
          )}

          {/* Sub Grid for remaining images */}
          {visibleItems.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {visibleItems.slice(1).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenLightbox(idx + 1)}
                  className="relative rounded-xl overflow-hidden cursor-pointer group shadow-sm border aspect-square"
                  style={{ borderColor: `${style.accentColor}30` }}
                >
                  <img
                    src={item.thumbnail_url || item.media_url}
                    alt={item.caption || `صورة ${idx + 2}`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= 2. MASONRY LAYOUT ======================= */}
      {layoutType === 'masonry' && (
        <div className="columns-2 sm:columns-3 gap-2.5 sm:gap-3 space-y-2.5 sm:space-y-3">
          {visibleItems.map((item, idx) => {
            const isTall = idx % 3 === 0;
            return (
              <div
                key={item.id}
                onClick={() => handleOpenLightbox(idx)}
                className={`break-inside-avoid relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group shadow-sm border ${
                  isTall ? 'aspect-3/4' : 'aspect-square'
                }`}
                style={{ borderColor: `${style.accentColor}30` }}
              >
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.caption || `صورة ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================= 3. CAROUSEL LAYOUT ======================= */}
      {layoutType === 'carousel' && (
        <div className="relative w-full overflow-hidden rounded-2xl border shadow-xl" style={{ borderColor: `${style.accentColor}40` }}>
          <div className="relative aspect-16/10 w-full overflow-hidden bg-black/40">
            <img
              src={visibleItems[carouselIndex]?.media_url || visibleItems[carouselIndex]?.thumbnail_url}
              alt={visibleItems[carouselIndex]?.caption || `صورة ${carouselIndex + 1}`}
              onClick={() => handleOpenLightbox(carouselIndex)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover cursor-pointer select-none transition-all duration-500"
            />

            {/* Carousel Controls */}
            {visibleItems.length > 1 && (
              <>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % visibleItems.length)}
                  aria-label="التالي"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:text-white border border-white/10 transition cursor-pointer backdrop-blur-xs"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length)}
                  aria-label="السابق"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:text-white border border-white/10 transition cursor-pointer backdrop-blur-xs"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            {/* Bottom Caption Overlay */}
            {visibleItems[carouselIndex]?.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-center">
                <p className="text-xs text-white/90 font-serif">
                  {visibleItems[carouselIndex].caption}
                </p>
              </div>
            )}
          </div>

          {/* Dots Indicator */}
          {visibleItems.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 py-3 bg-black/20">
              {visibleItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === carouselIndex ? 'w-6 bg-[#C9A45C]' : 'w-1.5 bg-neutral-400/40 hover:bg-neutral-300'
                  }`}
                  aria-label={`انتقل إلى شريحة ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= 4. HORIZONTAL SCROLL LAYOUT ======================= */}
      {layoutType === 'horizontal-scroll' && (
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory">
          {visibleItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleOpenLightbox(idx)}
              className="flex-shrink-0 w-44 sm:w-56 aspect-4/3 rounded-xl overflow-hidden cursor-pointer group shadow-sm border snap-start"
              style={{ borderColor: `${style.accentColor}30` }}
            >
              <img
                src={item.thumbnail_url || item.media_url}
                alt={item.caption || `صورة ${idx + 1}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* ======================= 5. GRID LAYOUT (DEFAULT) ======================= */}
      {layoutType === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          {visibleItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleOpenLightbox(idx)}
              className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group shadow-sm border transition-all duration-300 hover:shadow-md"
              style={{ borderColor: `${style.accentColor}30` }}
            >
              <img
                src={item.thumbnail_url || item.media_url}
                alt={item.caption || `صورة ${idx + 1}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <GalleryLightbox
        items={visibleItems}
        currentIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActiveImageIndex}
        accentColor={style.accentColor}
      />
    </div>
  );
};
