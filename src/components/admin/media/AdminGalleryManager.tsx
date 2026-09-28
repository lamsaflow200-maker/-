/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file AdminGalleryManager component.
 * Comprehensive admin gallery manager:
 * - Image Upload (JPG, PNG, WEBP) to 'invitation-gallery' with auto-thumbnailing
 * - Drag & drop and touch-friendly reordering with sort_order persistence
 * - Visibility toggle (show/hide without deleting)
 * - Caption editing
 * - Lightbox full-size preview
 * - Delete safety confirmation
 */

import React, { useState, useEffect, useRef } from 'react';
import { GalleryItem } from '../../../types/database';
import { db } from '../../../db';
import { uploadGalleryImage } from '../../../utils/storage';
import { useToast } from '../../ui/Toast';
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Edit2,
  Check,
  X,
  Maximize2,
  Images,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { GalleryLightbox } from '../../../engine/gallery/GalleryLightbox';

export interface AdminGalleryManagerProps {
  invitationId: string;
}

export const AdminGalleryManager: React.FC<AdminGalleryManagerProps> = ({ invitationId }) => {
  const { success, error } = useToast();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Editing caption
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState('');

  // Delete Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview Lightbox
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      const list = await db.media.getGallery(invitationId);
      setItems(list);
    } catch (err) {
      console.error(err);
      error('فشل تحميل معرض الصور');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      loadGallery();
    }
  }, [invitationId]);

  // Handle Multi-file Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    try {
      const fileList = Array.from(files);
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`جاري رفع الصورة (${i + 1} من ${fileList.length})...`);

        try {
          const { mediaUrl, thumbnailUrl } = await uploadGalleryImage(file);
          const nextSortOrder = items.length + successCount;

          await db.media.addGalleryItem({
            invitation_id: invitationId,
            media_url: mediaUrl,
            thumbnail_url: thumbnailUrl,
            media_type: 'image',
            caption: '',
            sort_order: nextSortOrder,
            is_visible: true,
          });

          successCount++;
        } catch (itemErr: any) {
          console.error(itemErr);
          error(`تعذر رفع الملف "${file.name}": ${itemErr.message || 'خطأ غير معروف'}`);
        }
      }

      if (successCount > 0) {
        success(`تمت إضافة ${successCount} صورة بنجاح إلى المعرض`);
        await loadGallery();
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item: GalleryItem) => {
    try {
      const nextVisible = !item.is_visible;
      await db.media.updateGalleryItem(item.id, { is_visible: nextVisible });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_visible: nextVisible } : i))
      );
      success(nextVisible ? 'أصبحت الصورة مرئية في الدعوة' : 'تم إخفاء الصورة من الدعوة');
    } catch (err) {
      console.error(err);
      error('فشل تغيير حالة الظهور');
    }
  };

  // Start Caption Edit
  const startEditCaption = (item: GalleryItem) => {
    setEditingId(item.id);
    setCaptionInput(item.caption || '');
  };

  // Save Caption
  const saveCaption = async (id: string) => {
    try {
      await db.media.updateGalleryItem(id, { caption: captionInput.trim() });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, caption: captionInput.trim() } : i))
      );
      setEditingId(null);
      success('تم تحديث الوصف بنجاح');
    } catch (err) {
      console.error(err);
      error('فشل حفظ الوصف');
    }
  };

  // Move Item Up or Down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setItems(newItems);

    try {
      const orderedIds = newItems.map((i) => i.id);
      await db.media.reorderGallery(invitationId, orderedIds);
    } catch (err) {
      console.error(err);
      error('فشل حفظ ترتيب الصور');
      loadGallery(); // rollback
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setItems(newItems);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const orderedIds = items.map((i) => i.id);
      await db.media.reorderGallery(invitationId, orderedIds);
      success('تم تحديث ترتيب الصور');
    } catch (err) {
      console.error(err);
      error('فشل حفظ الترتيب');
      loadGallery();
    }
  };

  // Delete item with confirmation
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await db.media.removeGalleryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
      success('تم حذف الصورة من المعرض');
    } catch (err) {
      console.error(err);
      error('فشل حذف الصورة');
    } finally {
      setIsDeleting(false);
    }
  };

  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Upload Zone & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED8]">
        <div>
          <h3 className="text-sm font-serif font-bold text-[#171316] flex items-center gap-2">
            <Images className="w-4 h-4 text-[#C9A45C]" />
            <span>معرض الصور الرقمي ({items.length} صورة)</span>
          </h3>
          <p className="text-xs text-[#6F6668] mt-1">
            صيغ مقبولة: JPG, PNG, WEBP (يتم إنشاء نسخ مصغرة سريعة تلقائياً للحفاظ على سرعة الهاتف).
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            {isUploading ? uploadProgress || 'جاري الرفع...' : 'رفع صور جديدة'}
          </Button>
        </div>
      </div>

      {/* Gallery Items Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#6F6668]">جاري تحميل معرض الصور...</div>
      ) : items.length === 0 ? (
        <div className="py-12 px-4 rounded-2xl border-2 border-dashed border-[#E8DED8] text-center space-y-3 bg-[#FFFFFF]">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-center mx-auto text-[#6F6668]">
            <Images className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-serif font-bold text-[#171316]">لا توجد صور في المعرض بعد</h4>
          <p className="text-xs text-[#6F6668] max-w-sm mx-auto">
            ارفع صور المناسبة أو ذكريات الخطوبة والزفاف لتظهر بأسلوب سينمائي داخل الدعوة.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            اختر صوراً من جهازك
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const isEditingThis = editingId === item.id;
            const isDeletingThis = deleteConfirmId === item.id;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative rounded-xl border bg-white overflow-hidden shadow-xs transition-all duration-200 ${
                  !item.is_visible ? 'opacity-60 border-neutral-300' : 'border-[#E8DED8] hover:shadow-md'
                }`}
              >
                {/* Image Preview & Drag Handle */}
                <div className="relative aspect-4/3 bg-neutral-100 group overflow-hidden">
                  <img
                    src={item.thumbnail_url || item.media_url}
                    alt={item.caption || `صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Drag Handle & Order Badge */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3 h-3 text-neutral-300" />
                    <span>#{index + 1}</span>
                  </div>

                  {/* Visibility Badge */}
                  {!item.is_visible && (
                    <div className="absolute top-2 left-2 bg-neutral-800/90 text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <EyeOff className="w-3 h-3 text-amber-400" />
                      <span>مخفية</span>
                    </div>
                  )}

                  {/* Hover Overlay with Preview */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openPreview(index)}
                      className="p-2 rounded-full bg-white/90 text-black hover:bg-white transition cursor-pointer"
                      title="معاينة بالحجم الكامل"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Content & Caption */}
                <div className="p-3 space-y-2.5">
                  {isEditingThis ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={captionInput}
                        onChange={(e) => setCaptionInput(e.target.value)}
                        placeholder="أدخل وصفاً للصورة (اختياري)..."
                        className="w-full text-xs p-1.5 border rounded border-[#C9A45C] outline-none font-serif"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-[11px] rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCaption(item.id)}
                          className="px-2.5 py-1 text-[11px] rounded bg-[#5A1020] text-white hover:bg-[#460C18] flex items-center gap-1 font-serif"
                        >
                          <Check className="w-3 h-3" />
                          <span>حفظ</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 min-h-[22px]">
                      <p className="text-xs text-neutral-700 font-serif line-clamp-1">
                        {item.caption || <span className="text-neutral-400 italic text-[11px]">بدون وصف</span>}
                      </p>
                      <button
                        type="button"
                        onClick={() => startEditCaption(item)}
                        className="text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                        title="تعديل الوصف"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                    {/* Reorder Buttons for Mobile / Quick clicks */}
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
                        disabled={index === items.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                        title="تحريك للخلف"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Visibility & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item)}
                        className={`p-1 rounded cursor-pointer transition ${
                          item.is_visible ? 'hover:bg-neutral-100 text-neutral-600' : 'bg-amber-50 text-amber-600'
                        }`}
                        title={item.is_visible ? 'إخفاء الصورة' : 'إظهار الصورة'}
                      >
                        {item.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete with Confirmation */}
                      {isDeletingThis ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded border border-red-200">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(item.id)}
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
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 cursor-pointer transition"
                          title="حذف الصورة"
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

      {/* Lightbox Preview */}
      <GalleryLightbox
        items={items}
        currentIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onIndexChange={setPreviewIndex}
      />
    </div>
  );
};
