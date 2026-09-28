/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file AdminVideoManager component.
 * Allows admins to manage invitation videos:
 * - Upload video (MP4, WebM) to 'invitation-videos' bucket or direct URL
 * - Set video poster/thumbnail, title, and description
 * - Reorder, hide/show, delete with confirmation, and live preview
 */

import React, { useState, useEffect, useRef } from 'react';
import { InvitationVideo } from '../../../types/database';
import { db } from '../../../db';
import { uploadInvitationVideo, uploadInvitationCover } from '../../../utils/storage';
import { useToast } from '../../ui/Toast';
import {
  Video as VideoIcon,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Edit2,
  Check,
  X,
  Play,
  Film,
  PlusCircle,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { InvitationVideoPlayer } from '../../../engine/video/InvitationVideoPlayer';

export interface AdminVideoManagerProps {
  invitationId: string;
}

export const AdminVideoManager: React.FC<AdminVideoManagerProps> = ({ invitationId }) => {
  const { success, error } = useToast();

  const [videos, setVideos] = useState<InvitationVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<InvitationVideo | null>(null);

  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Preview Modal
  const [previewVideo, setPreviewVideo] = useState<InvitationVideo | null>(null);

  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const list = await db.media.getVideos(invitationId);
      setVideos(list);
    } catch (err) {
      console.error(err);
      error('فشل تحميل فيديوهات الدعوة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      loadVideos();
    }
  }, [invitationId]);

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setTitleInput('');
    setDescriptionInput('');
    setVideoUrlInput('');
    setThumbnailUrlInput('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (v: InvitationVideo) => {
    setEditingVideo(v);
    setTitleInput(v.title || '');
    setDescriptionInput(v.description || '');
    setVideoUrlInput(v.video_url);
    setThumbnailUrlInput(v.thumbnail_url || '');
    setShowAddModal(true);
  };

  // Video File Upload
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const { videoUrl } = await uploadInvitationVideo(file);
      setVideoUrlInput(videoUrl);
      if (!titleInput) {
        setTitleInput(file.name.replace(/\.[^/.]+$/, ''));
      }
      success('تم رفع الفيديو بنجاح');
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل رفع ملف الفيديو');
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // Thumbnail File Upload
  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    try {
      const { url } = await uploadInvitationCover(file);
      setThumbnailUrlInput(url);
      success('تم رفع صورة الغلاف للفيديو');
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل رفع صورة الغلاف');
    } finally {
      setIsUploadingThumb(false);
      if (thumbFileInputRef.current) thumbFileInputRef.current.value = '';
    }
  };

  // Save Video (Create or Update)
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) {
      error('يرجى رفع ملف فيديو أو إدخال رابط الفيديو');
      return;
    }

    setIsSaving(true);
    try {
      if (editingVideo) {
        await db.media.updateVideo(editingVideo.id, {
          title: titleInput.trim(),
          description: descriptionInput.trim(),
          video_url: videoUrlInput.trim(),
          thumbnail_url: thumbnailUrlInput.trim() || undefined,
        });
        success('تم تحديث الفيديو بنجاح');
      } else {
        const nextSortOrder = videos.length;
        await db.media.addVideo({
          invitation_id: invitationId,
          video_url: videoUrlInput.trim(),
          thumbnail_url: thumbnailUrlInput.trim() || undefined,
          title: titleInput.trim() || 'فيديو المناسبة',
          description: descriptionInput.trim(),
          sort_order: nextSortOrder,
          is_visible: true,
        });
        success('تمت إضافة الفيديو بنجاح');
      }

      setShowAddModal(false);
      await loadVideos();
    } catch (err: any) {
      console.error(err);
      error(err.message || 'فشل حفظ الفيديو');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (video: InvitationVideo) => {
    try {
      const nextVisible = !video.is_visible;
      await db.media.updateVideo(video.id, { is_visible: nextVisible });
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, is_visible: nextVisible } : v))
      );
      success(nextVisible ? 'الفيديو مرئي الآن بالدعوة' : 'تم إخفاء الفيديو من الدعوة');
    } catch (err) {
      console.error(err);
      error('فشل تعديل حالة ظهور الفيديو');
    }
  };

  // Reorder Videos
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[targetIndex];
    newVideos[targetIndex] = temp;

    setVideos(newVideos);

    try {
      const orderedIds = newVideos.map((v) => v.id);
      await db.media.reorderVideos(invitationId, orderedIds);
      success('تم تحديث ترتيب الفيديوهات');
    } catch (err) {
      console.error(err);
      error('فشل حفظ الترتيب');
      loadVideos();
    }
  };

  // Delete Video
  const handleDelete = async (id: string) => {
    try {
      await db.media.removeVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setDeleteConfirmId(null);
      success('تم حذف الفيديو');
    } catch (err) {
      console.error(err);
      error('فشل حذف الفيديو');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED8]">
        <div>
          <h3 className="text-sm font-serif font-bold text-[#171316] flex items-center gap-2">
            <VideoIcon className="w-4 h-4 text-[#C9A45C]" />
            <span>فيديوهات الدعوة ({videos.length} فيديو)</span>
          </h3>
          <p className="text-xs text-[#6F6668] mt-1">
            ارفع مقاطع ترويجية أو توثيقية بصيغة MP4/WebM مع صور غلاف مصغرة.
          </p>
        </div>

        <div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            إضافة فيديو جديد
          </Button>
        </div>
      </div>

      {/* Video List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#6F6668]">جاري تحميل الفيديوهات...</div>
      ) : videos.length === 0 ? (
        <div className="py-12 px-4 rounded-2xl border-2 border-dashed border-[#E8DED8] text-center space-y-3 bg-[#FFFFFF]">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-center mx-auto text-[#6F6668]">
            <Film className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-serif font-bold text-[#171316]">لا توجد مقاطع فيديو مضافة بعد</h4>
          <p className="text-xs text-[#6F6668] max-w-sm mx-auto">
            أضف فيديو دعوة تشويقي أو تذكاري ليتمكن الضيوف من مشاهدته بضغطة زر.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            إضافة أول فيديو
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((video, index) => {
            const isDeletingThis = deleteConfirmId === video.id;

            return (
              <div
                key={video.id}
                className={`rounded-2xl border bg-white overflow-hidden shadow-xs transition-all ${
                  !video.is_visible ? 'opacity-60 border-neutral-300' : 'border-[#E8DED8] hover:shadow-md'
                }`}
              >
                {/* Poster / Video Thumbnail Container */}
                <div className="relative aspect-video bg-neutral-900 group overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title || 'فيديو'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                      <Film className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[10px]">بدون صورة غلاف</span>
                    </div>
                  )}

                  {/* Play Overlay Preview */}
                  <div
                    onClick={() => setPreviewVideo(video)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group-hover:bg-black/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C9A45C] text-[#0E0E11] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  {/* Order & Status Badges */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                    #{index + 1}
                  </div>

                  {!video.is_visible && (
                    <div className="absolute top-2 left-2 bg-neutral-800 text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <EyeOff className="w-3 h-3 text-amber-400" />
                      <span>مخفي</span>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-neutral-900 line-clamp-1">
                      {video.title || 'فيديو بدون عنوان'}
                    </h4>
                    {video.description && (
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                        title="تحريك للأمام"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === videos.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                        title="تحريك للخلف"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(video)}
                        className={`p-1 rounded cursor-pointer ${
                          video.is_visible ? 'hover:bg-neutral-100 text-neutral-600' : 'bg-amber-50 text-amber-600'
                        }`}
                        title={video.is_visible ? 'إخفاء' : 'إظهار'}
                      >
                        {video.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(video)}
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-600 cursor-pointer"
                        title="تعديل البيانات"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isDeletingThis ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                          <button
                            type="button"
                            onClick={() => handleDelete(video.id)}
                            className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            تأكيد الحذف
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-0.5 text-neutral-500 hover:text-neutral-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(video.id)}
                          className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 cursor-pointer"
                          title="حذف الفيديو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-neutral-200 space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-serif font-bold text-neutral-900">
                {editingVideo ? 'تعديل بيانات الفيديو' : 'إضافة فيديو جديد للدعوة'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              {/* Video File / URL */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  ملف الفيديو (MP4 / WebM) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      required
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="https://... أو ارفع ملف من جهازك"
                      className="flex-1 text-xs p-2.5 rounded-xl border border-neutral-200 font-mono outline-none focus:border-[#C9A45C]"
                    />
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      isLoading={isUploadingVideo}
                      onClick={() => videoFileInputRef.current?.click()}
                      icon={<Upload className="w-3.5 h-3.5" />}
                    >
                      رفع ملف
                    </Button>
                  </div>
                </div>
              </div>

              {/* Poster / Thumbnail URL */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  صورة غلاف الفيديو (Poster) <span className="text-neutral-400 font-normal">(اختياري)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={thumbnailUrlInput}
                    onChange={(e) => setThumbnailUrlInput(e.target.value)}
                    placeholder="رابط صورة الغلاف أو ارفع من جهازك"
                    className="flex-1 text-xs p-2.5 rounded-xl border border-neutral-200 outline-none focus:border-[#C9A45C]"
                  />
                  <input
                    ref={thumbFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    isLoading={isUploadingThumb}
                    onClick={() => thumbFileInputRef.current?.click()}
                    icon={<ImageIcon className="w-3.5 h-3.5" />}
                  >
                    رفع غلاف
                  </Button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  عنوان الفيديو
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="مثال: فيديو عقد القران المبارك"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 outline-none focus:border-[#C9A45C] font-serif"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  وصف توضيحي أو رسالة ترحيبية
                </label>
                <textarea
                  rows={2}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="كلمات تعبيرية تظهر أسفل الفيديو داخل الدعوة..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 outline-none focus:border-[#C9A45C] font-serif"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  icon={<Check className="w-4 h-4" />}
                >
                  {editingVideo ? 'تحديث الفيديو' : 'إضافة الفيديو'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Live Preview Modal */}
      {previewVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <InvitationVideoPlayer
              src={previewVideo.video_url}
              poster={previewVideo.thumbnail_url}
              title={previewVideo.title}
              description={previewVideo.description}
            />
          </div>
        </div>
      )}
    </div>
  );
};
