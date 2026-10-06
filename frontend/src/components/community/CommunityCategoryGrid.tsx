import React, { useState } from 'react';
import { CommunityCategoryMeta } from '../../types/community';
import { CommunityCategoryCard } from './CommunityCategoryCard';
import { Search, Sparkles } from 'lucide-react';

interface CommunityCategoryGridProps {
  categories: CommunityCategoryMeta[];
  totalServicesCount: number;
  onSelectCategory: (categoryId: string) => void;
  activeCategoryId?: string | null;
}

export const CommunityCategoryGrid: React.FC<CommunityCategoryGridProps> = ({
  categories,
  totalServicesCount,
  onSelectCategory,
  activeCategoryId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.kannadaName.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.cardDescription.toLowerCase().includes(q)
    );
  });

  return (
    <section className="space-y-8 animate-fadeIn" aria-labelledby="community-directory-heading">
      {/* Editorial Header Section matching reference design */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-slate-500 uppercase">
            <span className="text-slate-400">—</span>
            <span>BROWSE BY CATEGORY</span>
          </div>

          {/* Main Title */}
          <h1
            id="community-directory-heading"
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-dark-text tracking-tight"
          >
            Community Services
          </h1>

          {/* Subtitle / Counts */}
          <p className="text-sm md:text-base text-slate-600 font-sans">
            <span className="font-medium text-slate-800">{categories.length} categories</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>{totalServicesCount} total services</span>
            <span className="hidden sm:inline text-slate-500 ml-2">across Pavagada taluk</span>
          </p>
        </div>

        {/* Quick Directory Filter */}
        <div className="w-full md:w-72 relative">
          <label htmlFor="directory-search" className="sr-only">
            Search categories
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="directory-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find category or service..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-dark-text placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {filteredCategories.map((category) => (
          <CommunityCategoryCard
            key={category.id}
            category={category}
            onClick={onSelectCategory}
            isActive={category.id === activeCategoryId}
          />
        ))}
      </div>

      {/* Empty Search State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-600 font-medium">No matching category found for "{searchQuery}".</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 text-sm font-semibold text-forest-green hover:underline"
          >
            Reset search filter
          </button>
        </div>
      )}

      {/* Verification Footnote banner */}
      <div className="rounded-xl bg-warm-cream/70 border border-soft-sand/70 p-4 flex items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-terracotta shrink-0" />
          <span>All directory listings are verified official institutions and registered services in Pavagada taluk.</span>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-slate-500">Tumakuru Dist · PIN 561202</span>
      </div>
    </section>
  );
};
