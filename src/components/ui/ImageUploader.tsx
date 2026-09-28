/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';
import { Button } from './Button';

export interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  helperText = 'الصيغ المدعومة: JPG, PNG, WEBP (الحجم الأقصى: 5MB)',
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('حجم الملف يتجاوز الحد المسموح به (5MB)');
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setErrorMsg(null);
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setErrorMsg(null);
  };

  return (
    <div className="w-full text-right">
      {label && <label className="block text-xs font-medium text-[#171316] mb-1.5">{label}</label>}

      {value ? (
        <div className="relative rounded-xl border border-[#E8DED8] bg-[#FFFFFF] p-2.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-14 h-14 object-cover rounded-lg border border-[#E8DED8] bg-[#FAF7F2]"
            />
            <div className="text-right">
              <p className="text-xs font-medium text-[#171316]">تم اختيار الصورة</p>
              <p className="text-[10px] text-[#6F6668] truncate max-w-[200px] font-mono">{value}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-[#B42318] hover:bg-[#FEECEB]">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E8DED8] bg-[#FFFFFF] p-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`text-xs px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                mode === 'url' ? 'bg-[#5A1020] text-[#FAF7F2]' : 'text-[#6F6668] hover:bg-[#FAF7F2]'
              }`}
            >
              رابط مباشر (URL)
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`text-xs px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                mode === 'upload' ? 'bg-[#5A1020] text-[#FAF7F2]' : 'text-[#6F6668] hover:bg-[#FAF7F2]'
              }`}
            >
              رفع ملف محلي
            </button>
          </div>

          {mode === 'url' ? (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                dir="ltr"
                className="w-full bg-[#FAF7F2] border border-[#E8DED8] rounded-lg px-3 py-2 text-xs text-[#171316] focus:outline-none focus:border-[#5A1020] focus:ring-1 focus:ring-[#C9A45C]/30"
              />
              <Button variant="secondary" size="sm" onClick={handleApplyUrl}>
                تطبيق
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer py-3 text-[#6F6668] hover:text-[#5A1020] transition">
              <UploadCloud className="w-7 h-7 mb-1 text-[#C9A45C]" />
              <span className="text-xs font-medium">اضغط لاختيار صورة من جهازك</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          {errorMsg && <p className="mt-2 text-xs text-[#B42318] text-center">{errorMsg}</p>}
          <p className="mt-2 text-[10px] text-[#6F6668] text-center">{helperText}</p>
        </div>
      )}
    </div>
  );
};
