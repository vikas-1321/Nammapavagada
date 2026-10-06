import React from 'react';
import {
  HeartPulse,
  Bus,
  BookOpen,
  GraduationCap,
  Film,
  Building2,
  Landmark,
  Utensils,
  ShieldAlert,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { CommunityCategoryMeta } from '../../types/community';

interface CommunityCategoryCardProps {
  category: CommunityCategoryMeta;
  onClick: (categoryId: string) => void;
  isActive?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  HeartPulse,
  Bus,
  BookOpen,
  GraduationCap,
  Film,
  Building2,
  Landmark,
  Utensils,
  ShieldAlert,
};

export const CommunityCategoryCard: React.FC<CommunityCategoryCardProps> = ({
  category,
  onClick,
  isActive = false,
}) => {
  const IconComponent = ICON_MAP[category.iconName] || HeartPulse;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(category.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(category.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Explore ${category.name}, ${category.initialCount} available records`}
      className={`group relative flex flex-col justify-between text-left p-6 md:p-7 rounded-2xl bg-white border transition-all duration-200 cursor-pointer select-none ${
        isActive
          ? 'border-2 border-forest-green shadow-md ring-1 ring-forest-green/20'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green focus-visible:ring-offset-2`}
    >
      <div>
        {/* Top Header Row: Category Icon (Left) & Record Count Badge (Right) */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${category.accentBg} ${category.accentText}`}
            aria-hidden="true"
          >
            <IconComponent className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div
            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-colors ${category.badgeBg} ${category.badgeText} ${category.badgeBorder}`}
          >
            {category.initialCount}
          </div>
        </div>

        {/* Category Title & Description */}
        <div className="space-y-2">
          <h3 className="font-serif text-lg md:text-xl font-bold text-dark-text tracking-tight group-hover:text-forest-green transition-colors">
            {category.name}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans line-clamp-2">
            {category.cardDescription || category.description}
          </p>
        </div>
      </div>

      {/* Footer Explore Action */}
      <div className="mt-6 pt-2 flex items-center text-xs md:text-sm font-medium text-slate-700 group-hover:text-forest-green transition-colors">
        <span>Explore</span>
        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1 text-slate-500 group-hover:text-forest-green" />
      </div>
    </div>
  );
};
