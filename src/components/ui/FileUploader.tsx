/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';

export interface FileUploaderProps {
  label?: string;
  accept?: string;
  maxSizeMb?: number;
  onFileSelect?: (file: File) => void;
  className?: string;
  helperText?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label = 'رفع ملف',
  accept,
  maxSizeMb = 10,
  onFileSelect,
  className = '',
  helperText = 'الملفات المدعومة: صور، صوتيات، مستندات حتى 10 ميغابايت',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`حجم الملف يتجاوز الحد المسموح به (${maxSizeMb} ميغابايت)`);
      return;
    }
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`w-full text-right ${className}`}>
      {label && <label className="block text-xs font-medium text-[#171316] mb-1.5">{label}</label>}

      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#C9A45C] bg-[#F9F5EC]'
              : 'border-[#E8DED8] bg-[#FAF7F2] hover:bg-[#F4ECE4]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E8DED8] flex items-center justify-center text-[#5A1020] mx-auto mb-2 shadow-xs">
            <UploadCloud className="w-5 h-5 text-[#C9A45C]" />
          </div>
          <p className="text-xs font-medium text-[#171316]">
            اضغط لاختيار ملف أو اسحبه إلى هنا
          </p>
          <p className="text-[11px] text-[#6F6668] mt-1">{helperText}</p>
        </div>
      ) : (
        <div className="p-3 bg-[#FFFFFF] border border-[#E8DED8] rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#5A1020] border border-[#E8DED8]">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate text-right">
              <p className="text-xs font-medium text-[#171316] truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-[#6F6668] font-mono tabular-nums">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="p-1 rounded-md text-[#6F6668] hover:text-[#B42318] hover:bg-[#FEECEB] transition"
            aria-label="إزالة الملف"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="mt-1.5 text-xs text-[#B42318] flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </p>
      )}
    </div>
  );
};
