/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { db } from '../../db';
import {
  CheckCircle2,
  Heart,
  XCircle,
  User,
  Users,
  Phone,
  MessageSquare,
  Lock,
  Sparkles,
  AlertCircle,
  Send,
  CalendarClock,
} from 'lucide-react';
import { TemplateCornerAccents } from '../decorations/TemplateDecorations';

export interface InvitationRSVPProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  config?: TemplateConfig;
  locale?: 'ar' | 'en' | 'fr';
  onRsvpSubmit?: (data: {
    guestName: string;
    phone?: string;
    attendanceStatus: 'attending' | 'declined';
    partySize: number;
    notesOrWishes?: string;
  }) => Promise<boolean>;
  onTrackAction?: (actionName: string) => void;
}

// Multi-language strings dictionary (Prompt 16 Requirement 29)
const TRANSLATIONS = {
  ar: {
    title: 'هل ستتمكن من الحضور؟',
    subtitle: 'يسعدنا ويشرفنا حضوركم ومشاركتنا فرحة هذا اليوم المبارك',
    yesBtn: 'نعم، سأحضر',
    noBtn: 'للأسف لن أتمكن',
    nameLabel: 'الاسم الكريم',
    namePlaceholder: 'اكتب اسمك الكريم هنا',
    nameRequired: 'يرجى كتابة الاسم الكريم',
    countLabel: 'عدد الأشخاص',
    countHelp: 'بما في ذلك شخصكم الكريم والمرافقين',
    countInvalid: 'عدد الأشخاص يجب أن يكون 1 على الأقل',
    phoneLabel: 'رقم الهاتف أو الواتساب (اختياري)',
    phonePlaceholder: '06XXXXXXXX',
    messageLabel: 'هل ترغب في ترك رسالة تهنئة؟ (اختياري)',
    messagePlaceholder: 'اكتب كلمتك الطيبة أو تهنئتك للعروسين...',
    declineMessageLabel: 'هل ترغب في ترك رسالة؟ (اختياري)',
    declineMessagePlaceholder: 'اكتب كلمتك الطيبة أو أمنياتك بالخير...',
    submitYes: 'تأكيد الحضور',
    submitNo: 'إرسال الرد',
    sending: 'جاري تسجيل الرد...',
    backBtn: 'تغيير الاختيار',
    confirmedTitle: 'تم تأكيد حضورك، نتمنى رؤيتك ❤️',
    confirmedSubtitle: 'شكراً جزيلاً لك، نسعد جداً بتشريفكم ونتطلع بشوق لرؤيتكم في المناسبة!',
    declinedTitle: 'شكراً لإخبارنا، نتمنى أن نلتقي بك في مناسبة قادمة ❤️',
    declinedSubtitle: 'نأسف لعدم تمكنكم من الحضور، ودامت دياركم عامرة بالأفراح والمسرات.',
    closedTitle: 'انتهت فترة تأكيد الحضور',
    closedSubtitle: 'نشكركم على اهتمامكم، لقد أُغلقت نافذة تأكيد الحضور لهذه المناسبة.',
    errorSubmit: 'حدث خطأ أثناء حفظ الرد، يرجى المحاولة مرة أخرى.',
    attendeeCountSuffix: 'أشخاص',
  },
  en: {
    title: 'Will you be attending?',
    subtitle: 'We would be honored by your presence to celebrate this special day with us',
    yesBtn: 'Yes, I will attend',
    noBtn: 'Unfortunately, I cannot',
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter your full name',
    nameRequired: 'Please enter your name',
    countLabel: 'Number of Guests',
    countHelp: 'Including yourself and companions',
    countInvalid: 'Guest count must be at least 1',
    phoneLabel: 'Phone / WhatsApp (Optional)',
    phonePlaceholder: '+1234567890',
    messageLabel: 'Would you like to leave a warm message? (Optional)',
    messagePlaceholder: 'Share your congratulations or wishes...',
    declineMessageLabel: 'Would you like to leave a message? (Optional)',
    declineMessagePlaceholder: 'Share your warm thoughts...',
    submitYes: 'Confirm Attendance',
    submitNo: 'Send Response',
    sending: 'Sending response...',
    backBtn: 'Change choice',
    confirmedTitle: 'Your attendance is confirmed, we look forward to seeing you ❤️',
    confirmedSubtitle: 'Thank you so much! We are thrilled to celebrate this memorable occasion together.',
    declinedTitle: 'Thank you for letting us know, we hope to see you at future occasions ❤️',
    declinedSubtitle: 'We will miss your presence and wish you all the best and joy.',
    closedTitle: 'RSVP deadline has passed',
    closedSubtitle: 'Thank you for your interest. The response window for this event is now closed.',
    errorSubmit: 'An error occurred while submitting. Please try again.',
    attendeeCountSuffix: 'guests',
  },
  fr: {
    title: 'Serez-vous présent(e) ?',
    subtitle: 'Nous serions très honorés de votre présence pour partager notre joie',
    yesBtn: 'Oui, je serai présent',
    noBtn: 'Malheureusement non',
    nameLabel: 'Nom et Prénom',
    namePlaceholder: 'Votre nom complet',
    nameRequired: 'Veuillez saisir votre nom',
    countLabel: 'Nombre de personnes',
    countHelp: 'Vous-même ainsi que vos accompagnateurs',
    countInvalid: 'Le nombre de personnes doit être au moins 1',
    phoneLabel: 'Téléphone / WhatsApp (Optionnel)',
    phonePlaceholder: '+33XXXXXXXXX',
    messageLabel: 'Souhaitez-vous laisser un message de félicitations ? (Optionnel)',
    messagePlaceholder: 'Écrivez vos vœux ou félicitations...',
    declineMessageLabel: 'Souhaitez-vous laisser un message ? (Optionnel)',
    declineMessagePlaceholder: 'Écrivez vos pensées bienveillantes...',
    submitYes: 'Confirmer ma présence',
    submitNo: 'Envoyer ma réponse',
    sending: 'Envoi en cours...',
    backBtn: 'Changer mon choix',
    confirmedTitle: 'Présence confirmée, au plaisir de vous voir ❤️',
    confirmedSubtitle: 'Merci infiniment ! Nous avons hâte de partager ce moment inoubliable avec vous.',
    declinedTitle: 'Merci de nous avoir prévenus, au plaisir de vous revoir bientôt ❤️',
    declinedSubtitle: 'Nous regrettons votre absence et vous souhaitons beaucoup de bonheur.',
    closedTitle: 'La date limite de confirmation est dépassée',
    closedSubtitle: 'Merci de votre intérêt. Les confirmations pour cet événement sont désormais closes.',
    errorSubmit: 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.',
    attendeeCountSuffix: 'personnes',
  },
};

export const InvitationRSVP: React.FC<InvitationRSVPProps> = ({
  invitation,
  style,
  config,
  locale = 'ar',
  onRsvpSubmit,
  onTrackAction,
}) => {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.ar;
  const nameInputId = useId();
  const countInputId = useId();
  const phoneInputId = useId();
  const messageInputId = useId();

  // 1. Prompt 16 Requirement 3: Check rsvp_enabled / settings.allowRsvp
  const isRsvpEnabled =
    invitation.settings?.allowRsvp ??
    (invitation as any).rsvp_enabled ??
    true;

  if (!isRsvpEnabled) {
    return null;
  }

  // 2. Prompt 16 Requirement 23: Check RSVP Deadline
  const deadlineStr = invitation.settings?.rsvpDeadline;
  const isDeadlinePassed = React.useMemo(() => {
    if (!deadlineStr) return false;
    try {
      const deadlineDate = new Date(deadlineStr);
      // Set to end of day if date-only format
      if (deadlineStr.length <= 10) {
        deadlineDate.setHours(23, 59, 59, 999);
      }
      return deadlineDate.getTime() < Date.now();
    } catch {
      return false;
    }
  }, [deadlineStr]);

  // Flow state: 'choice' (showing Yes / No buttons) | 'form_yes' | 'form_no' | 'success_yes' | 'success_no'
  const [activeStep, setActiveStep] = useState<'choice' | 'form_yes' | 'form_no' | 'success_yes' | 'success_no'>('choice');

  // Form inputs
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Template design properties
  const isDark =
    style.backgroundColor === '#0E0E11' ||
    style.backgroundColor === '#08080A' ||
    style.backgroundColor === '#0A1128' ||
    style.backgroundColor === '#121218';

  const cornerStyle =
    config?.borders?.framePattern === 'royal-corners'
      ? 'royal'
      : config?.borders?.framePattern === 'moroccan-arch'
      ? 'moroccan'
      : config?.borders?.framePattern === 'floral-flourish'
      ? 'floral'
      : 'clean';

  const cardBg = isDark ? '#141419' : style.cardBg || '#FFFFFF';
  const cardBorder = isDark ? '#2E2B38' : style.borderColor || '#E8DED8';
  const cardRadius = style.cardRadius || '1rem';
  const inputBg = isDark ? '#1B1A22' : '#FFFFFF';
  const inputBorder = isDark ? '#363342' : '#E8DED8';
  const textColor = isDark ? '#F5F5F7' : style.textColor || '#171316';
  const mutedTextColor = isDark ? '#9B99A6' : '#6F6668';

  // Handle Choice Selection
  const handleSelectAttendance = (choice: 'yes' | 'no') => {
    setFormError(null);
    if (choice === 'yes') {
      setActiveStep('form_yes');
      onTrackAction?.('rsvp_select_yes');
    } else {
      setActiveStep('form_no');
      onTrackAction?.('rsvp_select_no');
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!guestName.trim()) {
      setFormError(t.nameRequired);
      return;
    }

    const isYes = activeStep === 'form_yes';
    if (isYes && (isNaN(guestCount) || guestCount < 1)) {
      setFormError(t.countInvalid);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const responseData = {
        guestName: guestName.trim(),
        phone: phone.trim() || undefined,
        attendanceStatus: (isYes ? 'attending' : 'declined') as 'attending' | 'declined',
        partySize: isYes ? Math.max(1, Math.floor(guestCount)) : 0,
        notesOrWishes: message.trim() || undefined,
      };

      let success = false;
      if (onRsvpSubmit) {
        success = await onRsvpSubmit(responseData);
      } else {
        // Fallback directly to db service
        await db.rsvp.submit({
          invitation_id: invitation.id,
          guest_name: responseData.guestName,
          phone: responseData.phone,
          attendance: isYes ? 'confirmed' : 'declined',
          attendance_status: isYes ? 'confirmed' : 'declined',
          guests_count: responseData.partySize,
          party_size: responseData.partySize,
          message: responseData.notesOrWishes,
          notes_or_wishes: responseData.notesOrWishes,
        });
        success = true;
      }

      if (success) {
        onTrackAction?.(isYes ? 'rsvp_confirmed' : 'rsvp_declined');
        setActiveStep(isYes ? 'success_yes' : 'success_no');
      } else {
        setFormError(t.errorSubmit);
      }
    } catch (err: any) {
      console.error('RSVP submission error:', err);
      setFormError(err?.message || t.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp-section"
      role="region"
      aria-label="تأكيد الحضور RSVP"
      className="w-full max-w-xl mx-auto px-4 py-8 select-none transition-all duration-500 ease-out"
      dir="rtl"
    >
      <div
        className="relative p-6 sm:p-8 rounded-2xl border shadow-xl transition-all duration-300"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderRadius: cardRadius,
          boxShadow: config?.shadows?.cardShadow || '0 12px 36px rgba(0,0,0,0.08)',
        }}
      >
        <TemplateCornerAccents color={style.accentColor} size={18} style={cornerStyle} />

        {/* 1. Header (Titled with prompt specification) */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase"
            style={{
              backgroundColor: `${style.accentColor}18`,
              color: style.accentColor,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RSVP</span>
          </div>

          <h3
            className="text-lg sm:text-2xl font-serif font-bold tracking-tight"
            style={{ color: style.primaryColor }}
          >
            {t.title}
          </h3>

          <p className="text-xs sm:text-sm leading-relaxed max-w-md mx-auto" style={{ color: mutedTextColor }}>
            {t.subtitle}
          </p>
        </div>

        {/* 2. Deadline Expired Notice */}
        {isDeadlinePassed ? (
          <div
            className="p-6 rounded-xl border text-center space-y-3"
            style={{
              backgroundColor: isDark ? 'rgba(180, 35, 24, 0.12)' : '#FEF3F2',
              borderColor: isDark ? '#5B1A1E' : '#FECDCA',
            }}
          >
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-red-100 text-red-700">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-serif font-bold text-red-800">
              {t.closedTitle}
            </h4>
            <p className="text-xs text-red-700 leading-relaxed max-w-sm mx-auto">
              {t.closedSubtitle}
            </p>
          </div>
        ) : activeStep === 'choice' ? (
          /* 3. Primary Choice: Two prominent buttons (Prompt 16 Requirement 2) */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Green Yes Button */}
              <button
                type="button"
                onClick={() => handleSelectAttendance('yes')}
                className="group relative flex items-center justify-center gap-3 py-4 px-5 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] border border-green-600 bg-emerald-600 hover:bg-emerald-700"
                style={{
                  borderRadius: style.buttonRadius || '0.75rem',
                }}
              >
                <CheckCircle2 className="w-5 h-5 text-white/95 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base">{t.yesBtn}</span>
              </button>

              {/* Red No Button */}
              <button
                type="button"
                onClick={() => handleSelectAttendance('no')}
                className="group relative flex items-center justify-center gap-3 py-4 px-5 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] border border-red-600 bg-rose-600 hover:bg-rose-700"
                style={{
                  borderRadius: style.buttonRadius || '0.75rem',
                }}
              >
                <XCircle className="w-5 h-5 text-white/95 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base">{t.noBtn}</span>
              </button>
            </div>
          </div>
        ) : activeStep === 'form_yes' || activeStep === 'form_no' ? (
          /* 4. Interactive Forms: Yes / No flows (Prompt 16 Requirements 4, 5, 7, 25) */
          <form onSubmit={handleSubmit} className="space-y-4 text-right pt-2 motion-fade-in">
            {/* Banner of active choice */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                activeStep === 'form_yes'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeStep === 'form_yes' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>لقد اخترت: {t.yesBtn}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>لقد اخترت: {t.noBtn}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveStep('choice')}
                className="text-[11px] underline cursor-pointer hover:opacity-80"
              >
                {t.backBtn}
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Name Input (Required) */}
            <div>
              <label
                htmlFor={nameInputId}
                className="block text-xs font-bold mb-1.5"
                style={{ color: textColor }}
              >
                {t.nameLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id={nameInputId}
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  }}
                  autoFocus
                />
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Guests Count Input (Only on Yes Flow - Required, min 1) */}
            {activeStep === 'form_yes' && (
              <div>
                <label
                  htmlFor={countInputId}
                  className="block text-xs font-bold mb-1.5"
                  style={{ color: textColor }}
                >
                  {t.countLabel} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id={countInputId}
                      type="number"
                      min={1}
                      max={invitation.settings?.maxPartySize || 10}
                      step={1}
                      required
                      value={guestCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setGuestCount(Math.max(1, val));
                        }
                      }}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border outline-none transition focus:ring-2 font-mono text-center font-bold"
                      style={{
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        color: textColor,
                      }}
                    />
                    <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Quick Plus / Minus Steppers */}
                  <button
                    type="button"
                    onClick={() => setGuestCount((prev) => Math.max(1, prev - 1))}
                    className="w-11 h-11 rounded-xl border flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-gray-100 transition active:scale-95"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    title="تقليل عدد الأفراد"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGuestCount((prev) =>
                        Math.min(invitation.settings?.maxPartySize || 10, prev + 1)
                      )
                    }
                    className="w-11 h-11 rounded-xl border flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-gray-100 transition active:scale-95"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    title="زيادة عدد الأفراد"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] mt-1" style={{ color: mutedTextColor }}>
                  {t.countHelp} (الحد الأقصى المسموح به: {invitation.settings?.maxPartySize || 10} {t.attendeeCountSuffix})
                </p>
              </div>
            )}

            {/* Optional Phone Input (Prompt 16 Requirement 5) */}
            <div>
              <label
                htmlFor={phoneInputId}
                className="block text-xs font-bold mb-1.5"
                style={{ color: textColor }}
              >
                {t.phoneLabel}
              </label>
              <div className="relative">
                <input
                  id={phoneInputId}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border outline-none transition focus:ring-2 font-mono"
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  }}
                  dir="ltr"
                />
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Optional Message / Wishes */}
            <div>
              <label
                htmlFor={messageInputId}
                className="block text-xs font-bold mb-1.5"
                style={{ color: textColor }}
              >
                {activeStep === 'form_yes' ? t.messageLabel : t.declineMessageLabel}
              </label>
              <div className="relative">
                <textarea
                  id={messageInputId}
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    activeStep === 'form_yes'
                      ? t.messagePlaceholder
                      : t.declineMessagePlaceholder
                  }
                  className="w-full text-xs sm:text-sm p-3.5 rounded-xl border outline-none transition focus:ring-2 resize-none"
                  style={{
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                    color: textColor,
                  }}
                />
                <MessageSquare className="w-4 h-4 absolute left-3.5 bottom-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  activeStep === 'form_yes'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
                style={{
                  borderRadius: style.buttonRadius || '0.75rem',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.sending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{activeStep === 'form_yes' ? t.submitYes : t.submitNo}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveStep('choice')}
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold border hover:bg-gray-50 transition cursor-pointer"
                style={{
                  borderColor: inputBorder,
                  color: textColor,
                }}
              >
                {t.backBtn}
              </button>
            </div>
          </form>
        ) : (
          /* 5. Success Confirmation Screens (Prompt 16 Requirements 6 & 7) */
          <div className="space-y-4 pt-2 motion-fade-in text-center">
            {activeStep === 'success_yes' ? (
              <div
                className="p-6 sm:p-8 rounded-2xl border text-center space-y-3"
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#F0FDF4',
                  borderColor: isDark ? '#166534' : '#BBF7D0',
                }}
              >
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-emerald-100 text-emerald-700 shadow-sm animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h4
                  className="text-base sm:text-lg font-serif font-bold text-emerald-800"
                >
                  {t.confirmedTitle}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed max-w-sm mx-auto">
                  {t.confirmedSubtitle}
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-200/60 text-emerald-900 font-mono">
                    <Users className="w-3.5 h-3.5" />
                    <span>المقاعد المؤكدة: {guestCount}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="p-6 sm:p-8 rounded-2xl border text-center space-y-3"
                style={{
                  backgroundColor: isDark ? 'rgba(244, 63, 94, 0.12)' : '#FFF1F2',
                  borderColor: isDark ? '#9F1239' : '#FECDD3',
                }}
              >
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-rose-100 text-rose-700 shadow-sm">
                  <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                </div>
                <h4
                  className="text-base sm:text-lg font-serif font-bold text-rose-800"
                >
                  {t.declinedTitle}
                </h4>
                <p className="text-xs sm:text-sm text-rose-700 leading-relaxed max-w-sm mx-auto">
                  {t.declinedSubtitle}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
