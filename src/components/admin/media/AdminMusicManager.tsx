/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file AdminMusicManager component.
 * Complete audio library manager for Mnasbati platform:
 * - List all audio tracks with duration, artist, and activation status
 * - Upload audio files (MP3, WAV, M4A, OGG) to 'invitation-audio'
 * - Add, Edit, Activate/Deactivate, Delete with safety confirmation
 * - Integrated luxury audio player preview
 */

import React, { useState, useEffect, useRef } from 'react';
import { MusicTrack } from '../../../types/database';
import { db } from '../../../db';
import { uploadMusicTrack, uploadInvitationCover } from '../../../utils/storage';
import { useToast } from '../../ui/Toast';
import {
  Music,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Check,
  X,
  Volume2,
  Clock,
  Disc,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../ui/Button';

export const AdminMusicManager: React.FC = () => {
  const { success, error } = useToast();

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Preview State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);

  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      const list = await db.media.getAllMusicTracks();
      setTracks(list);
    } catch (err) {
      console.error(err);
      error('فشل تحميل المقاطع الموسيقية');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingTrack(null);
    setName('');
    setArtist('');
    setAudioUrl('');
    setCoverImageUrl('');
    setDuration(0);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (track: MusicTrack) => {
    setEditingTrack(track);
    setName(track.name);
    setArtist(track.artist || '');
    setAudioUrl(track.audio_url);
    setCoverImageUrl(track.cover_image_url || '');
    setDuration(track.duration || 0);
    setIsActive(track.is_active);
    setIsModalOpen(true);
  };

  // Toggle Preview Playback
  const handleTogglePreview = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
      setPreviewProgress(0);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.audio_url);
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setPreviewProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onended = () => {
        setPlayingTrackId(null);
        setPreviewProgress(0);
      };
      audio.play().then(() => {
        setPlayingTrackId(track.id);
      }).catch((err) => {
        console.warn(err);
        error('تعذر تشغيل المقطع الصوتي للمعاينة');
      });
    }
  };

  // Audio File Upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      const result = await uploadMusicTrack(file);
      setAudioUrl(result.audioUrl);
      if (result.duration) setDuration(Math.round(result.duration));
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, ''));
      }
      success('تم رفع الملف الصوتي بنجاح');
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل رفع الملف الصوتي');
    } finally {
      setIsUploadingAudio(false);
      if (audioFileInputRef.current) audioFileInputRef.current.value = '';
    }
  };

  // Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const result = await uploadInvitationCover(file);
      setCoverImageUrl(result.url);
      success('تم رفع صورة الغلاف للمقطع');
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل رفع صورة الغلاف');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (track: MusicTrack) => {
    try {
      const nextActive = !track.is_active;
      await db.media.updateMusicTrack(track.id, { is_active: nextActive });
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, is_active: nextActive } : t))
      );
      success(nextActive ? 'تم تفعيل المقطع الموسيقي' : 'تم تعطيل المقطع الموسيقي');
    } catch (err) {
      console.error(err);
      error('فشل تغيير حالة المقطع');
    }
  };

  // Delete Track with Confirmation Safety
  const handleDeleteConfirm = async (trackId: string) => {
    setIsDeleting(true);
    try {
      if (playingTrackId === trackId && audioRef.current) {
        audioRef.current.pause();
        setPlayingTrackId(null);
      }
      await db.media.deleteMusicTrack(trackId);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      setDeleteConfirmId(null);
      success('تم حذف المقطع الموسيقي بنجاح');
    } catch (err) {
      console.error(err);
      error('فشل حذف المقطع');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Track (Create or Update)
  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !audioUrl.trim()) {
      error('يرجى تحديد عنوان المقطع ورابط/ملف الصوت');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTrack) {
        const updated = await db.media.updateMusicTrack(editingTrack.id, {
          name: name.trim(),
          artist: artist.trim() || undefined,
          audio_url: audioUrl.trim(),
          cover_image_url: coverImageUrl.trim() || undefined,
          duration: duration || undefined,
          is_active: isActive,
        });
        setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        success('تم تحديث بيانات المقطع بنجاح');
      } else {
        const created = await db.media.createMusicTrack({
          name: name.trim(),
          artist: artist.trim() || undefined,
          audio_url: audioUrl.trim(),
          cover_image_url: coverImageUrl.trim() || undefined,
          duration: duration || undefined,
          is_active: isActive,
        });
        setTracks((prev) => [created, ...prev]);
        success('تمت إضافة المقطع الموسيقي بنجاح');
      }
      setIsModalOpen(false);
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

  const filteredTracks = tracks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 text-right select-none motion-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED8]">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#171316] flex items-center gap-2">
            <Music className="w-5 h-5 text-[#C9A45C]" />
            <span>مكتبة الموسيقى والمؤثرات الصوتية المرخصة</span>
          </h2>
          <p className="text-xs text-[#6F6668] mt-1">
            إدارة المقاطع الصوتية المتاحة للقوالب ولأصحاب الدعوات، رفع تسجيلات جديدة، وضبط الحالات
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          إضافة مقطع صوتي جديد
        </Button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المقطع أو الفنان..."
            className="w-full pr-9 pl-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8DED8] rounded-xl text-[#171316] focus:outline-none focus:border-[#5A1020]"
          />
          <Search className="w-4 h-4 text-[#9A8F92] absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6F6668]">
          <span className="bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#E8DED8]">
            إجمالي المقاطع: <strong className="text-[#171316]">{tracks.length}</strong>
          </span>
          <span className="bg-[#EDF7EE] text-[#175E27] px-3 py-1.5 rounded-lg border border-[#BFE4C6]">
            النشطة: <strong>{tracks.filter((t) => t.is_active).length}</strong>
          </span>
        </div>
      </div>

      {/* Tracks Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#6F6668]">جاري تحميل المكتبة الصوتية...</div>
      ) : filteredTracks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#E8DED8] bg-[#FAF7F2] space-y-3">
          <Disc className="w-10 h-10 text-[#9A8F92] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#171316]">لا توجد مقاطع صوتية تطابق البحث</h3>
          <p className="text-xs text-[#6F6668]">
            يمكنك إضافة مقطع صوتي جديد وتعيين اسمه وملفه ليكون متاحاً في قوالب الدعوات
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            إضافة مقطع الآن
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.map((track) => {
            const isPlaying = playingTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`p-4 rounded-2xl border bg-[#FFFFFF] transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
                  track.is_active ? 'border-[#E8DED8] hover:border-[#C9A45C]/60' : 'border-[#E8DED8] opacity-75'
                }`}
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Vinyl / Cover Art */}
                    <div className="relative w-12 h-12 rounded-xl bg-[#5A1020] border border-[#C9A45C]/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {track.cover_image_url ? (
                        <img
                          src={track.cover_image_url}
                          alt={track.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Disc
                          className={`w-6 h-6 text-[#C9A45C] ${isPlaying ? 'animate-spin' : ''}`}
                          style={{ animationDuration: '4s' }}
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#171316] truncate font-serif">
                        {track.name}
                      </h4>
                      <p className="text-xs text-[#6F6668] truncate mt-0.5">
                        {track.artist || 'تراث موسيقي مغربي'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#9A8F92] font-mono mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(track.duration)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(track)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition cursor-pointer shrink-0 ${
                      track.is_active
                        ? 'bg-[#EDF7EE] text-[#175E27] border-[#BFE4C6] hover:bg-[#E0F2E2]'
                        : 'bg-[#F2ECE8] text-[#6F6668] border-[#E8DED8] hover:bg-[#E8DED8]'
                    }`}
                    title={track.is_active ? 'المقطع نشط ومتاح بالدعوات' : 'المقطع معطل'}
                  >
                    {track.is_active ? 'نشط' : 'معطل'}
                  </button>
                </div>

                {/* Progress Bar (Visible when playing) */}
                {isPlaying && (
                  <div className="w-full bg-[#FAF7F2] rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-[#C9A45C] h-full transition-all duration-100"
                      style={{ width: `${previewProgress}%` }}
                    />
                  </div>
                )}

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-[#F2ECE8] flex items-center justify-between text-xs">
                  {/* Play / Preview Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(track)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      isPlaying
                        ? 'bg-[#5A1020] text-[#C9A45C] border-[#5A1020] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#171316] border-[#E8DED8] hover:border-[#5A1020]'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>إيقاف المعاينة</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                        <span>استماع</span>
                      </>
                    )}
                  </button>

                  {/* Edit & Delete Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(track)}
                      className="p-1.5 rounded-lg text-[#6F6668] hover:text-[#5A1020] hover:bg-[#FAF7F2] transition cursor-pointer"
                      title="تعديل بيانات المقطع"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(track.id)}
                      className="p-1.5 rounded-lg text-[#6F6668] hover:text-[#B42318] hover:bg-[#FEECEB] transition cursor-pointer"
                      title="حذف المقطع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          dir="rtl"
        >
          <div className="bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8DED8] pb-3">
              <h3 className="text-base font-serif font-bold text-[#171316] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#C9A45C]" />
                <span>{editingTrack ? 'تعديل المقطع الصوتي' : 'إضافة مقطع صوتي جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#9A8F92] hover:text-[#171316]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrack} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#171316] mb-1">
                  عنوان المقطع الموسيقي *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: موشح أندلسي ملكي"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171316] mb-1">
                  الفنان أو الفرقة الموسيقية
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="مثال: أوركسترا الرباط الفيلهارمونية"
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
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg"
                    onChange={handleAudioUpload}
                    className="hidden"
                    id="audio-file-upload-admin"
                  />
                  <label
                    htmlFor="audio-file-upload-admin"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5A1020] text-[#FAF7F2] text-xs font-medium hover:bg-[#460C18] transition cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingAudio ? 'جاري الرفع...' : 'رفع ملف صوتي من الجهاز'}</span>
                  </label>

                  {audioUrl && (
                    <div className="pt-2 text-right">
                      <p className="text-[11px] text-[#218739] font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>الملف الصوتي جاهز ({formatDuration(duration)})</span>
                      </p>
                      <input
                        type="text"
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        dir="ltr"
                        className="w-full mt-1 px-2.5 py-1 text-[11px] font-mono bg-white border border-[#E8DED8] rounded text-[#6F6668]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Art (Optional) */}
              <div>
                <label className="block text-xs font-medium text-[#171316] mb-1">
                  صورة غلاف المقطع (اختياري)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-file-upload-music"
                  />
                  <label
                    htmlFor="cover-file-upload-music"
                    className="px-3 py-1.5 rounded-lg border border-[#E8DED8] bg-[#FAF7F2] text-xs font-medium text-[#171316] hover:bg-[#FFFFFF] transition cursor-pointer shrink-0"
                  >
                    {isUploadingCover ? 'جاري الرفع...' : 'اختيار صورة'}
                  </label>

                  {coverImageUrl && (
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="w-8 h-8 rounded-lg object-cover border border-[#E8DED8]"
                    />
                  )}
                </div>
              </div>

              {/* Status Switch */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-[#E8DED8] text-[#5A1020]"
                  />
                  <span className="font-semibold text-[#171316]">
                    تفعيل هذا المقطع ليكون متاحاً في قوائم الاختيار للدعوات
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8DED8]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  disabled={!audioUrl}
                >
                  {editingTrack ? 'حفظ التعديلات' : 'إضافة المقطع'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Safety Dialog */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          dir="rtl"
        >
          <div className="bg-[#FFFFFF] border border-[#E8DED8] rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-[#B42318]">
              <div className="p-2 rounded-xl bg-[#FEECEB]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#171316]">
                تأكيد حذف المقطع الصوتي
              </h3>
            </div>

            <p className="text-xs text-[#6F6668] leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا المقطع الموسيقي نهائياً؟ لن يؤثر هذا الإجراء على بطاقات الدعوة القديمة المحفوظة محلياً.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DED8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                تراجع
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
              >
                تأكيد الحذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
