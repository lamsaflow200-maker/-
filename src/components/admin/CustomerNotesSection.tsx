/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CustomerNote } from '../../types/database';
import { db } from '../../db';
import { useAdminAuth } from '../../auth/AuthContext';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import {
  Lock,
  Plus,
  Edit2,
  Trash2,
  User,
  Clock,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export interface CustomerNotesSectionProps {
  customerId: string;
  customerName: string;
}

export const CustomerNotesSection: React.FC<CustomerNotesSectionProps> = ({
  customerId,
  customerName,
}) => {
  const { admin } = useAdminAuth();
  const { success, error: toastError } = useToast();

  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Note
  const [newNoteText, setNewNoteText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Note
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Note
  const [noteToDelete, setNoteToDelete] = useState<CustomerNote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const list = await db.customers.getNotes(customerId);
      setNotes(list);
    } catch {
      toastError('فشل تحميل ملاحظات الزبون');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadNotes();
    }
  }, [customerId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsAdding(true);
    try {
      const currentAdminName = admin?.full_name || admin?.name || 'مدير المنصة';
      const created = await db.customers.addNote(
        customerId,
        newNoteText.trim(),
        admin?.id,
        currentAdminName
      );
      setNotes((prev) => [created, ...prev]);
      setNewNoteText('');
      success('تمت إضافة الملاحظة الخاصة بنجاح');
    } catch {
      toastError('فشل حفظ الملاحظة');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (item: CustomerNote) => {
    setEditingNoteId(item.id);
    setEditingText(item.note);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editingText.trim()) return;

    setIsSavingEdit(true);
    try {
      const updated = await db.customers.updateNote(noteId, editingText.trim());
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, note: updated.note, updated_at: updated.updated_at } : n))
      );
      setEditingNoteId(null);
      setEditingText('');
      success('تم تحديث الملاحظة بنجاح');
    } catch {
      toastError('فشل تحديث الملاحظة');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await db.customers.deleteNote(noteToDelete.id);
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
      success('تم حذف الملاحظة بنجاح');
      setNoteToDelete(null);
    } catch {
      toastError('فشل حذف الملاحظة');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 text-right">
      {/* Privacy Notice Banner */}
      <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DED8] flex items-center justify-between text-xs text-[#6F6668]">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#C9A45C]" />
          <span>
            سجل الملاحظات الإدارية مشفر وخاص، <strong className="text-[#171316]">ولا يظهر أبداً</strong> لأصحاب الدعوات أو ضيوفهم.
          </span>
        </div>
        <span className="text-[10px] text-[#9A8F92] font-mono hidden sm:inline-flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#218739]" />
          RLS مشدد
        </span>
      </div>

      {/* Add New Note Box */}
      <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs space-y-3">
        <label className="block text-xs font-bold text-[#171316]">
          + إضافة ملاحظة خاصة لـ {customerName}
        </label>
        <Textarea
          rows={2}
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="سجل ملاحظة داخلية (مثال: تم الاتفاق هاتفياً على استلام تصميم البطاقة يوم الخميس...)"
          className="text-xs"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isAdding}
            disabled={!newNoteText.trim()}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            حفظ الملاحظة
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-[#6F6668] flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#C9A45C]" />
          الملاحظات المسجلة ({notes.length})
        </h4>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-[#6F6668]">جاري تحميل الملاحظات...</div>
        ) : notes.length === 0 ? (
          <div className="p-6 text-center rounded-lg border border-dashed border-[#E8DED8] bg-[#FAF7F2]/60">
            <p className="text-xs text-[#6F6668]">لا توجد ملاحظات إدارية مسجلة لهذا الزبون بعد.</p>
          </div>
        ) : (
          notes.map((item) => {
            const isEditing = editingNoteId === item.id;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] shadow-2xs transition-colors hover:border-[#C9A45C]/40"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="text-xs"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={isSavingEdit}
                        onClick={() => handleSaveEdit(item.id)}
                        icon={<Check className="w-3 h-3" />}
                      >
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCancelEdit}
                        icon={<X className="w-3 h-3" />}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[#171316] leading-relaxed whitespace-pre-wrap">
                      {item.note}
                    </p>

                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#F2ECE8] text-[10px] text-[#6F6668]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[#5A1020] font-medium">
                          <User className="w-3 h-3 text-[#C9A45C]" />
                          {item.admin_name || 'مدير المنصة'}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[#9A8F92]">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString('ar-MA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 rounded text-[#6F6668] hover:text-[#5A1020] hover:bg-[#FAF7F2] transition cursor-pointer"
                          title="تعديل الملاحظة"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setNoteToDelete(item)}
                          className="p-1 rounded text-[#6F6668] hover:text-[#B42318] hover:bg-[#FEECEB] transition cursor-pointer"
                          title="حذف الملاحظة"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      {noteToDelete && (
        <ConfirmDialog
          isOpen={!!noteToDelete}
          onClose={() => setNoteToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف الملاحظة"
          message="هل أنت متأكد من حذف هذه الملاحظة الإدارية؟ لا يمكن التراجع عن هذا الإجراء."
          confirmText="حذف الملاحظة"
          cancelText="إلغاء"
          isDangerous={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
