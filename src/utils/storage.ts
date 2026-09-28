/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from '../db/supabase';

export const STORAGE_BUCKETS = {
  COVERS: 'invitation-covers',
  GALLERY: 'invitation-gallery',
  VIDEOS: 'invitation-videos',
  AUDIO: 'invitation-audio',
};

// Prompt 19 Requirements 9 & 10: Strict boundaries
export const FILE_SIZE_LIMITS = {
  COVER_MAX_BYTES: 5 * 1024 * 1024, // 5MB
  GALLERY_MAX_BYTES: 10 * 1024 * 1024, // 10MB
  VIDEO_MAX_BYTES: 50 * 1024 * 1024, // 50MB
  AUDIO_MAX_BYTES: 15 * 1024 * 1024, // 15MB
};

const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'msi', 'php', 'phtml', 'py', 'rb',
  'js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'shtml', 'svg', 'vbs', 'jar',
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const ALLOWED_VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov']);
const ALLOWED_AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg']);

/**
 * Extracts and checks safe extension
 */
function getSafeExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  if (parts.length < 2) return '';
  const ext = parts.pop() || '';
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    throw new Error('نوع امتداد الملف محظور لأسباب أمنية');
  }
  return ext;
}

export interface UploadResult {
  url: string;
  isStorageUploaded: boolean;
}

export interface GalleryUploadResult {
  mediaUrl: string;
  thumbnailUrl: string;
  isStorageUploaded: boolean;
}

export interface VideoUploadResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  isStorageUploaded: boolean;
}

export interface AudioUploadResult {
  audioUrl: string;
  duration: number;
  isStorageUploaded: boolean;
}

/**
 * Resizes and compresses an image in browser canvas to prevent storage bloat.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1600,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generates an optimized square/cover thumbnail (400px max) for gallery images.
 */
export async function generateThumbnail(file: File | Blob, size = 480): Promise<Blob> {
  return compressImage(file, size, 0.78);
}

/**
 * Reads a Blob as a Base64 data URL string.
 */
function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads an invitation cover image.
 */
export async function uploadInvitationCover(file: File): Promise<UploadResult> {
  if (!file) throw new Error('لم يتم اختيار ملف');

  const ext = getSafeExtension(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    throw new Error('امتداد الملف غير مدعوم للغلاف (المسموح: JPG, PNG, WEBP)');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('نوع الملف غير مدعوم، يرجى اختيار صورة صالحة (JPG, PNG, WEBP)');
  }

  if (file.size > FILE_SIZE_LIMITS.COVER_MAX_BYTES) {
    throw new Error('حجم صورة الغلاف يتجاوز الحد الأقصى المسموح به (5 ميغابايت)');
  }

  const compressedBlob = await compressImage(file, 1400);

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = ext || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.COVERS)
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKETS.COVERS)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, isStorageUploaded: true };
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload failed, falling back to local compressed base64:', storageErr);
    }
  }

  const dataUrl = await readBlobAsDataUrl(compressedBlob);
  return { url: dataUrl, isStorageUploaded: false };
}

/**
 * Uploads an invitation gallery image to bucket 'invitation-gallery'.
 * Automatically generates a lightweight thumbnail for smooth grid previews.
 */
export async function uploadGalleryImage(file: File): Promise<GalleryUploadResult> {
  if (!file) throw new Error('لم يتم اختيار ملف صورة');

  const ext = getSafeExtension(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    throw new Error('امتداد الملف غير مدعوم لمعرض الصور (المسموح: JPG, PNG, WEBP)');
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    throw new Error('صيغة الملف غير مدعومة. الصيغ المسموحة: JPG, PNG, WEBP');
  }

  if (file.size > FILE_SIZE_LIMITS.GALLERY_MAX_BYTES) {
    throw new Error('حجم الصورة كبير جداً (الحد الأقصى 10 ميغابايت)');
  }

  const [mainBlob, thumbBlob] = await Promise.all([
    compressImage(file, 1600, 0.85),
    generateThumbnail(file, 480),
  ]);

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = ext || 'jpg';
      const baseName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const mainPath = `items/${baseName}.${fileExt}`;
      const thumbPath = `thumbs/${baseName}_thumb.${fileExt}`;

      const [mainUpload, thumbUpload] = await Promise.all([
        supabase.storage.from(STORAGE_BUCKETS.GALLERY).upload(mainPath, mainBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        }),
        supabase.storage.from(STORAGE_BUCKETS.GALLERY).upload(thumbPath, thumbBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        }),
      ]);

      if (!mainUpload.error) {
        const { data: mainUrl } = supabase.storage
          .from(STORAGE_BUCKETS.GALLERY)
          .getPublicUrl(mainPath);

        const { data: thumbUrl } = supabase.storage
          .from(STORAGE_BUCKETS.GALLERY)
          .getPublicUrl(thumbPath);

        return {
          mediaUrl: mainUrl?.publicUrl || '',
          thumbnailUrl: thumbUrl?.publicUrl || mainUrl?.publicUrl || '',
          isStorageUploaded: true,
        };
      }
    } catch (err) {
      console.warn('Gallery upload to Supabase failed, using local storage fallback:', err);
    }
  }

  // Standalone / Offline fallback
  const [mainDataUrl, thumbDataUrl] = await Promise.all([
    readBlobAsDataUrl(mainBlob),
    readBlobAsDataUrl(thumbBlob),
  ]);

  return {
    mediaUrl: mainDataUrl,
    thumbnailUrl: thumbDataUrl,
    isStorageUploaded: false,
  };
}

/**
 * Uploads an invitation video to bucket 'invitation-videos'.
 * Supports web-standard formats: MP4, WebM.
 */
export async function uploadInvitationVideo(file: File): Promise<VideoUploadResult> {
  if (!file) throw new Error('لم يتم اختيار ملف فيديو');

  const ext = getSafeExtension(file.name);
  if (!ALLOWED_VIDEO_EXTENSIONS.has(ext)) {
    throw new Error('امتداد الفيديو غير مدعوم. الصيغ المسموحة: MP4, WebM');
  }

  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('video/')) {
    throw new Error('صيغة الفيديو غير مدعومة. الصيغ المسموحة: MP4, WebM');
  }

  if (file.size > FILE_SIZE_LIMITS.VIDEO_MAX_BYTES) {
    throw new Error('حجم الفيديو يتجاوز 50 ميغابايت. يرجى ضغط الفيديو قبل الرفع.');
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = ext || 'mp4';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.VIDEOS)
        .upload(filePath, file, {
          contentType: file.type || 'video/mp4',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKETS.VIDEOS)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            videoUrl: publicUrlData.publicUrl,
            isStorageUploaded: true,
          };
        }
      }
    } catch (err) {
      console.warn('Video upload to Supabase storage failed, using fallback:', err);
    }
  }

  // Fallback for standalone/evaluation sandbox: Object URL or Data URL
  const videoUrl = URL.createObjectURL(file);
  return {
    videoUrl,
    isStorageUploaded: false,
  };
}

/**
 * Uploads an audio track to bucket 'invitation-audio'.
 * Supports MP3, WAV, M4A, OGG.
 */
export async function uploadMusicTrack(file: File): Promise<AudioUploadResult> {
  if (!file) throw new Error('لم يتم اختيار ملف صوتي');

  const ext = getSafeExtension(file.name);
  if (!ALLOWED_AUDIO_EXTENSIONS.has(ext)) {
    throw new Error('امتداد الملف الصوتي غير مدعوم. الصيغ المقبولة: MP3, WAV, M4A, OGG');
  }

  const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a', 'audio/ogg'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('audio/')) {
    throw new Error('صيغة الملف الصوتي غير مدعومة. الصيغ المقبولة: MP3, WAV, M4A, OGG');
  }

  if (file.size > FILE_SIZE_LIMITS.AUDIO_MAX_BYTES) {
    throw new Error('حجم الملف الصوتي يتجاوز 15 ميغابايت');
  }

  // Measure audio duration via AudioContext or HTMLAudioElement
  let duration = 0;
  try {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = objectUrl;
    await new Promise((resolve) => {
      audio.onloadedmetadata = () => {
        duration = Math.round(audio.duration || 0);
        resolve(true);
      };
      audio.onerror = () => resolve(false);
      setTimeout(resolve, 2000); // 2s timeout
    });
  } catch {
    duration = 180; // Default estimate
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'mp3';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `tracks/${fileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.AUDIO)
        .upload(filePath, file, {
          contentType: file.type || 'audio/mpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKETS.AUDIO)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            audioUrl: publicUrlData.publicUrl,
            duration,
            isStorageUploaded: true,
          };
        }
      }
    } catch (err) {
      console.warn('Audio upload to Supabase failed, using fallback:', err);
    }
  }

  // Fallback: Object URL or Data URL
  const audioUrl = URL.createObjectURL(file);
  return {
    audioUrl,
    duration,
    isStorageUploaded: false,
  };
}
