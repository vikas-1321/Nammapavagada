import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  categoryBadge?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  categoryBadge,
  children,
  maxWidthClass = 'max-w-4xl',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-forest-green-dark/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Surface */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthClass} max-h-[90vh] bg-white border border-soft-sand rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-soft-sand p-5 md:p-6 bg-warm-cream/50 shrink-0">
          <div className="pr-4">
            {categoryBadge && (
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-terracotta text-white px-2.5 py-0.5 rounded-full mb-1.5 shadow-sm">
                {categoryBadge}
              </span>
            )}
            <h3 id="modal-title" className="text-xl md:text-2xl font-serif font-bold text-forest-green tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-earth-brown font-kannada mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1.5 bg-white hover:bg-terracotta text-forest-green hover:text-white text-xs font-bold px-3 py-2 rounded-lg border border-soft-sand hover:border-terracotta transition-colors duration-150 shadow-sm cursor-pointer"
            aria-label="Close modal"
          >
            <span>Close</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto leading-relaxed text-sm md:text-base text-dark-text">
          {children}
        </div>
      </div>
    </div>
  );
};
