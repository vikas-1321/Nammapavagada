import React, { useRef, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

export const FloatingFeedbackButton: React.FC = () => {
  const { isOpen, openFeedback } = useFeedback();
  const desktopButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef<boolean>(isOpen);

  // Restore focus to button when modal closes
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      if (window.innerWidth >= 768) {
        desktopButtonRef.current?.focus();
      } else {
        mobileButtonRef.current?.focus();
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <>
      {/* =========================================================================
          1. DESKTOP / TABLET TAB (Matching Reference Screenshot)
          - Hanging tab on the right edge (fixed right-0 top-1/2 -translate-y-1/2)
          - Only icon, narrow width matching icon size + snug padding
          - Top-left yellow accent pill indicator
          - Hidden on mobile (< md)
      ========================================================================== */}
      <aside
        aria-label="Website Feedback"
        className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none print:hidden pointer-events-auto"
      >
        <button
          ref={desktopButtonRef}
          id="floating-feedback-trigger-desktop"
          onClick={() => openFeedback()}
          aria-label="Share Feedback or Report Incorrect Information"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          title="Share Feedback / ಸಲಹೆ ಅಥವಾ ತಪ್ಪು ಮಾಹಿತಿ ವರದಿ ಮಾಡಿ"
          className="group relative flex items-center justify-center w-9 sm:w-10 py-4 bg-terracotta text-white rounded-l-2xl rounded-r-none shadow-md shadow-terracotta/25 border-t border-b border-l border-white/20 hover:bg-[#b04f2f] hover:shadow-lg hover:shadow-terracotta/40 hover:-translate-x-1 active:translate-x-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta cursor-pointer"
          style={{
            boxShadow: '-3px 3px 12px rgba(198, 93, 58, 0.32)',
          }}
        >
          {/* Accent indicator pill at the top-left curve (as in reference screenshot) */}
          <span
            className="absolute -left-1 top-2.5 w-3.5 h-1.5 rounded-full bg-amber-300 ring-1.5 ring-white shadow-2xs animate-pulse"
            aria-hidden="true"
          />

          {/* Centered Feedback Icon */}
          <div className="flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
            <MessageSquarePlus className="w-5 h-5 drop-shadow-xs" aria-hidden="true" />
          </div>
        </button>
      </aside>

      {/* =========================================================================
          2. MOBILE BUTTON (Floating at Right Bottom)
          - Positioned at the bottom-right (above mobile bottom navigation)
          - Circular FAB with icon + accent dot
          - Only visible on mobile (< md)
      ========================================================================== */}
      <aside
        aria-label="Mobile Website Feedback"
        className="md:hidden fixed right-4 bottom-20 z-40 select-none print:hidden pointer-events-auto"
      >
        <button
          ref={mobileButtonRef}
          id="floating-feedback-trigger-mobile"
          onClick={() => openFeedback()}
          aria-label="Share Feedback or Report Incorrect Information"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          title="Share Feedback / ಸಲಹೆ ಅಥವಾ ತಪ್ಪು ಮಾಹಿತಿ ವರದಿ ಮಾಡಿ"
          className="group relative flex items-center justify-center w-11 h-11 bg-terracotta text-white rounded-full shadow-lg shadow-terracotta/35 border border-white/30 hover:bg-[#b04f2f] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta cursor-pointer"
          style={{
            boxShadow: '0 4px 16px rgba(198, 93, 58, 0.4)',
          }}
        >
          {/* Subtle accent indicator dot */}
          <span
            className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-white animate-pulse"
            aria-hidden="true"
          />

          {/* Centered Feedback Icon */}
          <MessageSquarePlus className="w-5 h-5 text-white drop-shadow-xs" aria-hidden="true" />
        </button>
      </aside>
    </>
  );
};
