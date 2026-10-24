import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Building2,
  Bus,
  Sparkles,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { feedbackService } from '../../services/feedbackService';
import {
  FeedbackCategory,
  FEEDBACK_CATEGORIES,
} from '../../types/feedback';
import { ApiError } from '../../services/apiClient';

export const FeedbackModal: React.FC = () => {
  const { isOpen, contextData, closeFeedback } = useFeedback();

  // Form states
  const [category, setCategory] = useState<FeedbackCategory>('GENERAL');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>(''); // Spam defense

  // Contextual association state
  const [relatedType, setRelatedType] = useState<string | undefined>(undefined);
  const [relatedId, setRelatedId] = useState<string | undefined>(undefined);
  const [relatedName, setRelatedName] = useState<string | undefined>(undefined);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Refs for accessibility & focus trapping
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement | HTMLTextAreaElement | null>(null);

  // Initialize or reset form state whenever contextData or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setValidationErrors({});
      setHoneypot('');

      if (contextData) {
        setCategory(contextData.category || 'INCORRECT_INFO');
        setRelatedType(contextData.relatedEntityType);
        setRelatedId(contextData.relatedEntityId);
        setRelatedName(contextData.relatedEntityName);
        if (contextData.defaultMessage) {
          setMessage(contextData.defaultMessage);
        }
      } else {
        setCategory('GENERAL');
        setRelatedType(undefined);
        setRelatedId(undefined);
        setRelatedName(undefined);
      }

      // Automatically focus first control after modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, contextData]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleAttemptClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, message, isSubmitting, isSuccess]);

  // Protect against accidental closure when user typed significant feedback
  const handleAttemptClose = () => {
    if (isSubmitting) return;

    if (!isSuccess && message.trim().length >= 15) {
      const confirmDiscard = window.confirm(
        'You have written feedback that has not been submitted yet. Are you sure you want to close and discard it?'
      );
      if (!confirmDiscard) return;
    }

    closeFeedback();
  };

  const handleClearContextListing = () => {
    setRelatedType(undefined);
    setRelatedId(undefined);
    setRelatedName(undefined);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedMsg = message.trim();

    if (!trimmedMsg) {
      errors.message = 'Please enter your feedback message.';
    } else if (trimmedMsg.length < 10) {
      errors.message = 'Please provide at least 10 characters so we can understand the issue or idea.';
    } else if (trimmedMsg.length > 3000) {
      errors.message = 'Feedback message cannot exceed 3,000 characters.';
    }

    if (email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        errors.email = 'Please provide a valid email address (e.g. name@example.com).';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const currentPagePath = typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.hash || ''}`
      : '/';

    try {
      await feedbackService.submitFeedback({
        category,
        message,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        pagePath: currentPagePath,
        relatedEntityType: relatedType,
        relatedEntityId: relatedId,
        relatedEntityName: relatedName,
        hp: honeypot,
      });

      setIsSuccess(true);
      setMessage('');
      setName('');
      setEmail('');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('We could not submit your feedback. Please check your internet connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentPath = typeof window !== 'undefined'
    ? `${window.location.pathname}${window.location.hash || ''}`
    : '/';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-text/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
      aria-describedby="feedback-dialog-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleAttemptClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-soft-sand/80 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-scaleUp"
      >
        {/* Warm Header */}
        <div className="bg-forest-green text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-forest-green/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-terracotta/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="feedback-dialog-title" className="text-base sm:text-lg font-bold font-serif leading-tight">
                Share Your Feedback
              </h2>
              <p className="text-[11px] text-soft-sand/80 font-sans">
                Namma Pavagada Community Desk
              </p>
            </div>
          </div>

          <button
            onClick={handleAttemptClose}
            aria-label="Close feedback modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-soft-sand hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-dark-text space-y-4">
          {/* Success View */}
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif text-forest-green">
                  Feedback Received!
                </h3>
                <p className="text-sm text-dark-text/80 max-w-sm mx-auto leading-relaxed">
                  Thank you for helping us improve Namma Pavagada! Your feedback has been submitted successfully to our team.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-4 py-2.5 rounded-xl border border-soft-sand text-xs font-semibold text-dark-text hover:bg-warm-cream transition-colors"
                >
                  Submit Another Note
                </button>
                <button
                  type="button"
                  onClick={closeFeedback}
                  className="px-5 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-[#b04f2f] shadow-md shadow-terracotta/20 transition-all"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <p id="feedback-dialog-description" className="text-xs sm:text-sm text-dark-text/75 leading-relaxed">
                Help us improve Namma Pavagada. Report incorrect information, suggest improvements, or tell us about a problem.
              </p>

              {/* Error banner if submission failed */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Submission Failed</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Contextual Listing Association Badge */}
              {relatedName && (
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2 text-dark-text">
                    {relatedType === 'BUS_ROUTE' ? (
                      <Bus className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                    ) : (
                      <Building2 className="w-4 h-4 text-forest-green shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-forest-green">Regarding Listing:</span>{' '}
                      <span className="font-medium text-dark-text">{relatedName}</span>
                      {relatedType && (
                        <span className="ml-1 text-[10px] text-muted-text uppercase tracking-wider">
                          ({relatedType.replace('_', ' ')})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearContextListing}
                    className="text-[11px] text-terracotta hover:underline font-medium shrink-0"
                    title="Remove entity link and give general taluk feedback"
                  >
                    Clear link
                  </button>
                </div>
              )}

              {/* Category Dropdown */}
              <div>
                <label
                  htmlFor="feedback-category"
                  className="block text-xs font-bold uppercase tracking-wider text-forest-green mb-1.5"
                >
                  Feedback Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="feedback-category"
                  ref={firstInputRef as React.RefObject<HTMLSelectElement>}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full bg-warm-cream/50 border border-soft-sand rounded-xl px-3.5 py-2.5 text-sm font-medium text-dark-text focus:bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all cursor-pointer"
                >
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} — {cat.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="feedback-message"
                    className="block text-xs font-bold uppercase tracking-wider text-forest-green"
                  >
                    Feedback Message <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      message.length > 2800 ? 'text-amber-600 font-bold' : 'text-muted-text'
                    }`}
                  >
                    {message.length} / 3,000
                  </span>
                </div>

                <textarea
                  id="feedback-message"
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (validationErrors.message) {
                      setValidationErrors((prev) => ({ ...prev, message: '' }));
                    }
                  }}
                  placeholder="Tell us what happened or how we can improve..."
                  maxLength={3000}
                  className={`w-full bg-warm-cream/50 border rounded-xl p-3 text-sm text-dark-text placeholder:text-muted-text focus:bg-white focus:ring-1 outline-none transition-all resize-y ${
                    validationErrors.message
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : 'border-soft-sand focus:border-terracotta focus:ring-terracotta'
                  }`}
                  aria-invalid={!!validationErrors.message}
                  aria-describedby={validationErrors.message ? 'feedback-msg-error' : undefined}
                />
                {validationErrors.message && (
                  <p id="feedback-msg-error" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.message}</span>
                  </p>
                )}
              </div>

              {/* Optional Name & Email grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label
                    htmlFor="feedback-name"
                    className="block text-xs font-semibold text-dark-text/90 mb-1"
                  >
                    Your Name <span className="text-muted-text font-normal">(Optional)</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={120}
                    className="w-full bg-warm-cream/50 border border-soft-sand rounded-xl px-3 py-2 text-sm text-dark-text placeholder:text-muted-text focus:bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-email"
                    className="block text-xs font-semibold text-dark-text/90 mb-1"
                  >
                    Your Email <span className="text-muted-text font-normal">(Optional)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="Enter your email address"
                    maxLength={150}
                    className={`w-full bg-warm-cream/50 border rounded-xl px-3 py-2 text-sm text-dark-text placeholder:text-muted-text focus:bg-white focus:ring-1 outline-none transition-all ${
                      validationErrors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                        : 'border-soft-sand focus:border-terracotta focus:ring-terracotta'
                    }`}
                    aria-invalid={!!validationErrors.email}
                    aria-describedby={validationErrors.email ? 'feedback-email-error' : 'feedback-email-help'}
                  />
                  {validationErrors.email && (
                    <p id="feedback-email-error" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{validationErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <p id="feedback-email-help" className="text-[11px] text-muted-text flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Your email is only needed if you wish to receive an update on your feedback.</span>
              </p>

              {/* Honeypot field (hidden from sighted users and screen readers) */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="feedback-hp">Leave this empty</label>
                <input
                  id="feedback-hp"
                  type="text"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Current Page Auto-Capture Indication */}
              <div className="pt-2 text-[11px] text-muted-text flex items-center gap-1.5 border-t border-soft-sand/60">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Captured page: <code className="bg-warm-cream px-1.5 py-0.5 rounded text-dark-text font-mono">{currentPath}</code>
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-soft-sand text-xs font-semibold text-dark-text hover:bg-warm-cream transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-[#b04f2f] shadow-md shadow-terracotta/25 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting feedback...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
