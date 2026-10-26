import React, { useRef, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';

export const FloatingFeedbackButton: React.FC = () => {
  const { isOpen, openFeedback } = useFeedback();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef<boolean>(isOpen);

  // Restore focus to button when modal closes
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      buttonRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <aside
      aria-label="Website Feedback"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none print:hidden pointer-events-auto"
    >
      <button
        ref={buttonRef}
        id="floating-feedback-trigger"
        onClick={() => openFeedback()}
        aria-label="Share Feedback or Report Incorrect Information"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Share Feedback / ಸಲಹೆ ಅಥವಾ ತಪ್ಪು ಮಾಹಿತಿ ವರದಿ ಮಾಡಿ"
        className="group relative flex items-center gap-1.5 py-2 px-2 bg-terracotta text-white rounded-l-lg rounded-r-none shadow-md shadow-terracotta/25 border-t border-b border-l border-white/20 hover:bg-[#b04f2f] hover:shadow-lg hover:shadow-terracotta/40 hover:-translate-x-0.5 active:translate-x-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta cursor-pointer"
        style={{
          boxShadow: '-2px 2px 10px rgba(198, 93, 58, 0.28)',
        }}
      >
        {/* Subtle accent indicator dot */}
        <span
          className="absolute -left-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-300 ring-1 ring-white/80 animate-pulse"
          aria-hidden="true"
        />

        {/* Message Icon with subtle micro-bounce on hover */}
        <div className="flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
          <MessageSquarePlus className="w-3.5 h-3.5 drop-shadow-xs" aria-hidden="true" />
        </div>

        {/* Vertical Text Label */}
        <span
          className="text-[10px] font-bold tracking-wider uppercase font-sans [writing-mode:vertical-rl] rotate-180 drop-shadow-2xs group-hover:text-amber-100 transition-colors"
          style={{ letterSpacing: '0.1em' }}
        >
          Feedback
        </span>
      </button>
    </aside>
  );
};
