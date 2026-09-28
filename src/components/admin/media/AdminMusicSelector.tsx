/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file AdminMusicSelector component.
 * Allows selecting an audio track for an invitation from the music library,
 * listening to an inline preview, clearing selection, or uploading a new track.
 */

import React, { useState, useEffect, useRef } from 'react';
import { MusicTrack } from '../../../types/database';
import { db } from '../../../db';
import { uploadMusicTrack } from '../../../utils/storage';
import { useToast } from '../../ui/Toast';
import {
  Music,
  Play,
  Pause,
  Plus,
  Check,
  Volume2,
  X,
  Upload,
  Disc,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../ui/Button';

export interface AdminMusicSelectorProps {
  value?: string | null; // music_id
  onChange: (musicId: string | null) => void;
  invitationId?: string;
}

export const AdminMusicSelector: React.FC<AdminMusicSelectorProps> = ({
  value,
  onChange,
  invitationId,
}) => {
  const { success, error } = useToast();

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Audio Preview State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Quick Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newArtistName, setNewArtistName] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newDuration, setNewDuration] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      const list = await db.media.getAllMusicTracks();
      setTracks(list);
    } catch (err) {
      console.error(err);
      error('فشل تحميل قائمة المقاطع الموسيقية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // Cleanup audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const handleTogglePreview = (e: React.MouseEvent, track: MusicTrack) => {
    e.stopPropagation();

    if (playingTrackId === track.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(track.audio_url);
      audioPreviewRef.current = audio;
      audio.play().then(() => {
        setPlayingTrackId(track.id);
      }).catch((err) => {
        console.warn('Playback error:', err);
        error('تعذر تشغيل هذا المقطع الصوتي للمعاينة');
      });
      audio.onended = () => setPlayingTrackId(null);
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadMusicTrack(file);
      setNewAudioUrl(result.audioUrl);
      if (result.duration) setNewDuration(Math.round(result.duration));
      if (!newTrackName) {
        setNewTrackName(file.name.replace(/\.[^/.]+$/, ''));
      }
      success('تم رفع الملف الصوتي بنجاح');
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل رفع الملف الصوتي');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackName.trim() || !newAudioUrl.trim()) {
      error('يرجى تحديد اسم المقطع وملف الصوت');
      return;
    }

    setIsSaving(true);
    try {
      const created = await db.media.createMusicTrack({
        name: newTrackName.trim(),
        artist: newArtistName.trim() || 'منسباتي للموسيقى الفاخرة',
        audio_url: newAudioUrl.trim(),
        duration: newDuration || 120,
        is_active: true,
      });

      success('تمت إضافة المقطع الصوتي بنجاح');
      await loadTracks();
      onChange(created.id);
      setShowUploadModal(false);
      setNewTrackName('');
      setNewArtistName('');
      setNewAudioUrl('');
      setNewDuration(0);
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل حفظ المقطع الموسيقي');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return 'غير محدد';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectedTrack = tracks.find((t) => t.id === value) || null;

  return (
    <div className="space-y-4 text-right select-none">
      {/* Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DED8]">
        <div>
          <h3 className="text-sm font-serif font-bold text-[#171316] flex items-center gap-2">
            <Music className="w-4 h-4 text-[#C9A45C]" />
            <span>موسيقى الخلفية الصوتية للدعوة</span>
          </h3>
          <p className="text-xs text-[#6F6668] mt-0.5">
            اختر مقطعاً صوتياً فاخراً يرافق الزائر عند فتح بطاقة الدعوة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-[11px] text-[#6F6668] hover:text-[#B42318] hover:border-[#F8B6B2] transition cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>إلغاء الموسيقى (بدون صوت)</span>
            </button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            icon={<Plus className="w-3.5 h-3.5 text-[#C9A45C]" />}
          >
            إضافة مقطع جديد
          </Button>
        </div>
      </div>

      {/* Selected Track Banner */}
      {selectedTrack ? (
        <div className="p-4 rounded-xl border border-[#C9A45C] bg-[#FDF9F2] shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => handleTogglePreview(e, selectedTrack)}
              className="w-10 h-10 rounded-full border border-[#C9A45C] bg-[#5A1020] text-[#C9A45C] flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xs cursor-pointer shrink-0"
              title={playingTrackId === selectedTrack.id ? 'إيقاف المعاينة' : 'تشغيل للمعاينة'}
            >
              {playingTrackId === selectedTrack.id ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-[#171316]">
                  {selectedTrack.name}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#5A1020] text-[#FAF7F2] font-semibold">
                  المقطع المعتمد
                </span>
              </div>
              <p className="text-[11px] text-[#6F6668] flex items-center gap-2 mt-0.5">
                <span>{selectedTrack.artist || 'تراث موسيقي مغربي'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[#9A8F92]" />
                  {formatDuration(selectedTrack.duration)}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-[#9A8F92] hover:text-[#B42318] p-1.5 rounded-lg hover:bg-white transition cursor-pointer"
            title="إزالة هذا المقطع"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-[#E8DED8] bg-[#FAF7F2] text-center text-xs text-[#6F6668]">
          <Disc className="w-6 h-6 text-[#9A8F92] mx-auto mb-1.5 opacity-60" />
          <p className="font-semibold text-[#171316]">لم يتم اختيار أي مقطع موسيقي لهذه الدعوة</p>
          <p className="text-[11px] text-[#9A8F92] mt-0.5">
            ستفتح الدعوة بصمت بدون صوت خلفية. يمكنك اختيار مقطع من القائمة أدناه.
          </p>
        </div>
      )}

      {/* Track Grid Selection */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[#171316]">المقاطع المتوفرة في المكتبة:</h4>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-[#6F6668]">جاري تحميل المقاطع...</div>
        ) : tracks.length === 0 ? (
          <p className="text-xs text-[#9A8F92] py-4 text-center">لا توجد مقاطع حالياً بالمكتبة.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {tracks.map((track) => {
              const isSelected = value === track.id;
              const isPlaying = playingTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => onChange(track.id)}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-[#5A1020] bg-[#F6ECF0] shadow-xs'
                      : 'border-[#E8DED8] bg-[#FFFFFF] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => handleTogglePreview(e, track)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isPlaying
                          ? 'bg-[#5A1020] text-[#C9A45C] border-[#C9A45C]'
                          : 'bg-[#FAF7F2] text-[#6F6668] border-[#E8DED8] hover:text-[#5A1020]'
                      }`}
                      title={isPlaying ? 'إيقاف' : 'استماع للمعاينة'}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 text-right">
                      <p className="text-xs font-semibold text-[#171316] truncate">
                        {track.name}
                      </p>
                      <p className="text-[10px] text-[#6F6668] truncate">
                        {track.artist || 'منسباتي'} • {formatDuration(track.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-[#5A1020] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#5A1020] hover:underline font-medium">
                        اختيار
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          dir="rtl"
        >
          <div className="bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8DED8] pb-3">
              <h3 className="text-base font-serif font-bold text-[#171316] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#C9A45C]" />
                <span>إضافة ورفع مقطع موسيقي جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-[#9A8F92] hover:text-[#171316]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrack} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#171316] mb-1">
                  عنوان المقطع *
                </label>
                <input
                  type="text"
                  required
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="مثال: موشح أندلسي ملكي"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171316] mb-1">
                  الفنان أو الفرقة
                </label>
                <input
                  type="text"
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  placeholder="مثال: فرقة التراث المغربي"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020]"
                />
              </div>

              {/* Audio Upload */}
              <div>
                <label className="block text-xs font-medium text-[#171316] mb-1">
                  ملف الصوت (MP3, WAV, M4A, OGG) *
                </label>
                <div className="border border-dashed border-[#E8DED8] rounded-xl p-4 text-center bg-[#FAF7F2] space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                    id="audio-file-upload-selector"
                  />
                  <label
                    htmlFor="audio-file-upload-selector"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5A1020] text-[#FAF7F2] text-xs font-medium hover:bg-[#460C18] transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'جاري الرفع...' : 'اختيار ملف صوتي من الجهاز'}</span>
                  </label>

                  {newAudioUrl ? (
                    <div className="pt-2 text-right">
                      <p className="text-[11px] text-[#218739] font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>تم تجهيز الملف الصوتي</span>
                      </p>
                      <input
                        type="text"
                        readOnly
                        value={newAudioUrl}
                        dir="ltr"
                        className="w-full mt-1 px-2.5 py-1 text-[11px] font-mono bg-white border border-[#E8DED8] rounded text-[#6F6668]"
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#9A8F92]">
                      الحد الأقصى المسموح به 30 ميغابايت بصيغ الويب الشائعة
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DED8]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  disabled={!newAudioUrl}
                >
                  حفظ واعتماد المقطع
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
