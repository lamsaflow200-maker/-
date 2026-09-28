/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/database';
import { db } from '../../db';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import {
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
  MOROCCAN_CITIES,
} from '../../utils/phone';
import { AlertTriangle, CheckCircle2, User, Phone, Mail, MapPin, FileText, AlertCircle } from 'lucide-react';

export interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedCustomer: Customer) => void;
  customerToEdit?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerToEdit,
}) => {
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Validation & Duplicate State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateCustomer, setDuplicateCustomer] = useState<Customer | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        setFullName(customerToEdit.full_name || '');
        setPhone(customerToEdit.phone || '');
        setEmail(customerToEdit.email || '');
        setCity(customerToEdit.city || '');
        setAddress(customerToEdit.address || '');
        setNotes(customerToEdit.notes || '');
      } else {
        setFullName('');
        setPhone('');
        setEmail('');
        setCity('');
        setAddress('');
        setNotes('');
      }
      setErrors({});
      setDuplicateCustomer(null);
      setIgnoreDuplicateWarning(false);
      setIsSubmitting(false);
    }
  }, [isOpen, customerToEdit]);

  // Check for duplicate phone when phone field changes/blurs
  const handlePhoneBlur = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setDuplicateCustomer(null);
      return;
    }

    if (!isValidMoroccanPhone(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        phone: 'يرجى إدخال رقم هاتف مغربي صحيح (مثال: 0661234567 أو +212 661-234567)',
      }));
      setDuplicateCustomer(null);
      return;
    }

    // Clear phone format error
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      return next;
    });

    try {
      setIsCheckingDuplicate(true);
      const found = await db.customers.findByPhone(trimmed, customerToEdit?.id);
      if (found) {
        setDuplicateCustomer(found);
      } else {
        setDuplicateCustomer(null);
      }
    } catch {
      // Non-blocking duplicate check error
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل للزبون مطلوب';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'يجب أن يتكون الاسم من 3 أحرف على الأقل';
    }

    // 2. Phone validation
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'رقم الهاتف مطلوب للتواصل والربط بالدعوات';
    } else if (!isValidMoroccanPhone(trimmedPhone)) {
      newErrors.phone = 'يرجى إدخال رقم هاتف مغربي صالح (مثال: 0661234567 أو +212 661-234567)';
    }

    // 3. Email validation (optional, but if provided must be valid)
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Duplicate check guard
    if (duplicateCustomer && !ignoreDuplicateWarning) {
      toastError('يرجى تأكيد الرغبة في المتابعة رغم وجود رقم هاتف مطابق');
      return;
    }

    setIsSubmitting(true);
    const normalizedPhone = normalizeMoroccanPhone(phone.trim());

    try {
      if (customerToEdit) {
        const updated = await db.customers.update(customerToEdit.id, {
          full_name: fullName.trim(),
          phone: normalizedPhone,
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        success('تم تحديث معلومات الزبون بنجاح.');
        onSuccess(updated);
      } else {
        const created = await db.customers.create({
          full_name: fullName.trim(),
          phone: normalizedPhone,
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        success('تمت إضافة الزبون بنجاح.');
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ بيانات الزبون، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? 'تعديل معلومات الزبون' : '+ إضافة زبون جديد'}
      description="سجل بيانات صاحب المناسبة وإدارة معلومات التواصل الخاصة به"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-[#171316] mb-1">
            الاسم الكامل للزبون <span className="text-[#B42318]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.fullName;
                    return next;
                  });
                }
              }}
              placeholder="مثال: أحمد المنصوري أو عائلة الإدريسي"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[#FFFFFF] transition outline-none ${
                errors.fullName
                  ? 'border-[#B42318] ring-1 ring-[#B42318]/20 focus:border-[#B42318]'
                  : 'border-[#E8DED8] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]/30'
              }`}
            />
            <User className="w-4 h-4 text-[#9A8F92] absolute left-3 top-3 pointer-events-none" />
          </div>
          {errors.fullName && (
            <p className="text-[11px] text-[#B42318] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 inline" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Phone Number with Moroccan Validation & Duplicate Detection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-[#171316]">
              رقم الهاتف (للتواصل وتأكيد الحجوزات) <span className="text-[#B42318]">*</span>
            </label>
            <span className="text-[10px] text-[#6F6668] font-mono">هاتف مغربي (06/07/05)</span>
          </div>

          <div className="relative">
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setDuplicateCustomer(null);
                setIgnoreDuplicateWarning(false);
                if (errors.phone) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  });
                }
              }}
              onBlur={handlePhoneBlur}
              placeholder="0661234567 أو +212 661-234567"
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[#FFFFFF] font-mono transition outline-none ${
                errors.phone
                  ? 'border-[#B42318] ring-1 ring-[#B42318]/20 focus:border-[#B42318]'
                  : duplicateCustomer
                  ? 'border-[#B7791F] ring-1 ring-[#B7791F]/20 focus:border-[#B7791F]'
                  : 'border-[#E8DED8] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]/30'
              }`}
            />
            <Phone className="w-4 h-4 text-[#9A8F92] absolute left-3 top-3 pointer-events-none" />
          </div>

          {errors.phone && (
            <p className="text-[11px] text-[#B42318] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 inline" />
              {errors.phone}
            </p>
          )}

          {/* Real-time normalized preview */}
          {phone.trim() && isValidMoroccanPhone(phone) && !errors.phone && (
            <p className="text-[10px] text-[#218739] mt-1 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3 text-[#218739]" />
              الصيغة المعيارية: {normalizeMoroccanPhone(phone)}
            </p>
          )}

          {/* DUPLICATE WARNING CARD */}
          {duplicateCustomer && (
            <div className="mt-2.5 p-3 rounded-lg bg-[#FFF9E6] border border-[#F7DBA7] text-right motion-fade-in shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-[#8B5B16]">
                    تنبيه: هذا الرقم مرتبط بزبون موجود مسبقاً!
                  </p>
                  <div className="text-[11px] text-[#6F6668] mt-1 space-y-0.5">
                    <p>
                      الزبون المسجل:{' '}
                      <strong className="text-[#171316]">{duplicateCustomer.full_name}</strong>
                    </p>
                    {duplicateCustomer.city && <p>المدينة: {duplicateCustomer.city}</p>}
                    <p className="font-mono text-[10px]" dir="ltr">
                      {duplicateCustomer.phone}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-[#F7DBA7]/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ignoreDuplicateWarning}
                      onChange={(e) => setIgnoreDuplicateWarning(e.target.checked)}
                      className="rounded text-[#5A1020] focus:ring-[#C9A45C]"
                    />
                    <span className="text-[11px] text-[#171316] font-medium">
                      أرغب في المتابعة وحفظ السجل بهذا الرقم رغم وجود تطابق
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email & City Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#171316] mb-1">
              البريد الإلكتروني <span className="text-[10px] text-[#6F6668] font-normal">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                }}
                placeholder="client@example.com"
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[#FFFFFF] font-mono transition outline-none ${
                  errors.email
                    ? 'border-[#B42318] ring-1 ring-[#B42318]/20 focus:border-[#B42318]'
                    : 'border-[#E8DED8] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]/30'
                }`}
              />
              <Mail className="w-4 h-4 text-[#9A8F92] absolute left-3 top-3 pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-[11px] text-[#B42318] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 inline" />
                {errors.email}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-[#171316] mb-1">
              المدينة <span className="text-[10px] text-[#6F6668] font-normal">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="moroccan-cities-list"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="اختر أو اكتب المدينة (الرباط، الدار البيضاء...)"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]/30 transition outline-none"
              />
              <datalist id="moroccan-cities-list">
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <MapPin className="w-4 h-4 text-[#9A8F92] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-[#171316] mb-1">
            العنوان أو الحي <span className="text-[10px] text-[#6F6668] font-normal">(اختياري)</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="مثال: حي الرياض، شارع النخيل، إقامة الزهور"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E8DED8] bg-[#FFFFFF] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]/30 transition outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#171316] mb-1">
            ملاحظات خاصة عن الزبون <span className="text-[10px] text-[#6F6668] font-normal">(اختياري)</span>
          </label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: يفضل التواصل عبر الواتساب مساءً، اختار باقة الأصالة..."
          />
          <p className="text-[10px] text-[#6F6668] mt-1">
            🔒 ملاحظات سرية خاصة بالإدارة، لا تظهر نهائياً في الدعوات العامة.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#E8DED8]">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isCheckingDuplicate || (duplicateCustomer !== null && !ignoreDuplicateWarning)}
            className="flex-1"
          >
            {customerToEdit ? 'حفظ التعديلات' : '+ إضافة الزبون'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
