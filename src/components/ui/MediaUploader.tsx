/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Music, Video } from 'lucide-react';
import { Button } from './Button';

export interface MediaUploaderProps {
  type: 'music' | 'video';
  value?: string;
  title?: string;
  onChange: (url: string, title?: string) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  type,
  value,
  title,
  onChange,
}) => {
  const [url, setUrl] = useState(value || '');
  const [mediaTitle, setMediaTitle] = useState(title || '');

  const handleSave = () => {
    if (url.trim()) {
      onChange(url.trim(), mediaTitle.trim());
    }
  };

  return (
    <div className="w-full text-right p-4 rounded-xl border border-[#E8DED8] bg-[#FFFFFF] space-y-3 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#171316]">
        {type === 'music' ? (
          <>
            <Music className="w-4 h-4 text-[#C9A45C]" />
            <span>ملف الموسيقى الخلفية (MP3 / Audio URL)</span>
          </>
        ) : (
          <>
            <Video className="w-4 h-4 text-[#C9A45C]" />
            <span>رابط مقطع الفيديو (YouTube / MP4)</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={mediaTitle}
          onChange={(e) => setMediaTitle(e.target.value)}
          placeholder={type === 'music' ? 'عنوان المقطوعة (مثلاً: موسيقى أندلسية)' : 'عنوان الفيديو'}
          className="bg-[#FAF7F2] border border-[#E8DED8] rounded-lg px-3 py-2 text-xs text-[#171316] placeholder:text-[#9A8F92] focus:outline-none focus:border-[#5A1020] focus:ring-1 focus:ring-[#C9A45C]/30"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          dir="ltr"
          className="bg-[#FAF7F2] border border-[#E8DED8] rounded-lg px-3 py-2 text-xs text-[#171316] placeholder:text-[#9A8F92] focus:outline-none focus:border-[#5A1020] focus:ring-1 focus:ring-[#C9A45C]/30"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleSave}>
          حفظ إعدادات الوسائط
        </Button>
      </div>
    </div>
  );
};
