import React from 'react';
import { SearchX, RotateCcw, FolderOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'search' | 'folder';
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No places have been added to this category yet.',
  message = 'There are currently no published records matching this selection in the Namma Pavagada database.',
  icon = 'folder',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-white border border-soft-sand rounded-2xl p-10 md:p-14 text-center my-6 shadow-sm max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-warm-cream/80 text-forest-green border border-soft-sand flex items-center justify-center mx-auto mb-5 shadow-2xs">
        {icon === 'search' ? (
          <SearchX className="w-8 h-8 stroke-[1.8] text-forest-green" />
        ) : (
          <FolderOpen className="w-8 h-8 stroke-[1.8] text-forest-green" />
        )}
      </div>

      <h3 className="text-xl md:text-2xl font-serif font-bold text-dark-text mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6 font-sans">
        {message}
      </p>

      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="md"
          onClick={onAction}
          className="inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
};
