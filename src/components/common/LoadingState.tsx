import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  type?: 'card' | 'grid' | 'inline' | 'fullscreen';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading verified records from backend...',
  submessage = 'Connecting to Namma Pavagada central registry',
  type = 'grid',
  count = 6,
}) => {
  if (type === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2.5 py-6 text-sm text-forest-green font-medium animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" aria-busy="true" aria-live="polite">
      {/* Informative Header with Spinner */}
      <div className="flex items-center gap-3 p-4 bg-white/80 rounded-2xl border border-soft-sand/70 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center shrink-0">
          <Loader2 className="w-5 h-5 animate-spin text-forest-green" />
        </div>
        <div>
          <div className="text-sm font-semibold text-dark-text">{message}</div>
          <div className="text-xs text-muted-text">{submessage}</div>
        </div>
      </div>

      {/* Responsive Skeleton Grid */}
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-soft-sand rounded-2xl p-6 shadow-sm animate-pulse space-y-4"
          >
            {/* Top Category Tag + Verified Badge Skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-soft-sand/80 rounded-full" />
              <div className="h-4 w-16 bg-soft-sand/60 rounded-md" />
            </div>

            {/* Title & Subtitle Skeleton */}
            <div className="space-y-2 pt-2">
              <div className="h-6 w-4/5 bg-soft-sand/90 rounded-lg" />
              <div className="h-4 w-3/5 bg-soft-sand/60 rounded-md" />
            </div>

            {/* Description Lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full bg-soft-sand/50 rounded" />
              <div className="h-3.5 w-11/12 bg-soft-sand/50 rounded" />
              <div className="h-3.5 w-3/4 bg-soft-sand/40 rounded" />
            </div>

            {/* Metadata Footer Box */}
            <div className="pt-4 border-t border-soft-sand/60 flex items-center justify-between">
              <div className="h-4 w-28 bg-soft-sand/60 rounded" />
              <div className="h-8 w-20 bg-soft-sand/80 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
