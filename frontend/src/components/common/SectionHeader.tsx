import React from 'react';

export interface SectionHeaderProps {
  number?: string;
  categoryLabel?: string;
  title: string;
  kannadaTitle?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  categoryLabel,
  title,
  kannadaTitle,
  description,
  className = '',
  action,
}) => {
  return (
    <div className={`border-b border-soft-sand pb-6 mb-8 md:mb-12 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* Category kicker */}
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-terracotta mb-2">
            {number && (
              <span className="font-mono bg-soft-sand text-forest-green px-2 py-0.5 rounded text-[11px]">
                {number}
              </span>
            )}
            {categoryLabel && <span>{categoryLabel}</span>}
          </div>

          {/* Main Title & Kannada Subtitle */}
          <div className="flex items-baseline flex-wrap gap-x-4 gap-y-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-forest-green tracking-tight">
              {title}
            </h2>
            {kannadaTitle && (
              <span className="text-lg md:text-2xl text-earth-brown font-kannada font-normal">
                {kannadaTitle}
              </span>
            )}
          </div>

          {/* Descriptive text */}
          {description && (
            <p className="mt-3 text-base text-muted-text max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {action && <div className="shrink-0 mt-2 md:mt-0">{action}</div>}
      </div>
    </div>
  );
};
