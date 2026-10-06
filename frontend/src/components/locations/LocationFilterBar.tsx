import React, { useState, useRef, useEffect } from 'react';
import { LocationCategory } from '../../types/location';
import { CategoryDefinition } from '../../data/categoriesData';
import { SearchInput } from '../common/SearchInput';
import {
  Map,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Landmark,
  HeartPulse,
  Bus,
  GraduationCap,
  Building2,
  MapPin,
  X,
  ChevronDown,
} from 'lucide-react';

export interface LocationFilterBarProps {
  categories: CategoryDefinition[];
  selectedCategory: LocationCategory | 'ALL';
  onSelectCategory: (category: LocationCategory | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

const renderCategoryIcon = (categoryId: string, className = 'w-4 h-4 shrink-0') => {
  switch (categoryId) {
    case 'FORT_HERITAGE':
      return <Shield className={className} />;
    case 'MEGALITHIC_SITE':
      return <Layers className={className} />;
    case 'RELIGIOUS':
      return <Sparkles className={className} />;
    case 'SOLAR_INFRASTRUCTURE':
      return <Zap className={className} />;
    case 'CIVIC_GOVERNMENT':
      return <Landmark className={className} />;
    case 'HEALTHCARE':
      return <HeartPulse className={className} />;
    case 'TRANSPORTATION':
      return <Bus className={className} />;
    case 'EDUCATION':
      return <GraduationCap className={className} />;
    case 'PUBLIC_UTILITY':
      return <Building2 className={className} />;
    default:
      return <MapPin className={className} />;
  }
};

export const LocationFilterBar: React.FC<LocationFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categoryCounts,
  totalCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategoryDef = categories.find((c) => c.id === selectedCategory);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-white border border-soft-sand rounded-2xl p-4 md:p-5 mb-8 shadow-xs transition-all">
      {/* 3-Column Responsive Row: Search | Category Dropdown | Registered Count */}
      <div className="grid grid-cols-12 gap-3 items-end">
        {/* 1. Search Input */}
        <div className="col-span-12 md:col-span-5 lg:col-span-6">
          <SearchInput
            compact
            label="Search Places in Pavagada"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder="Type place name, category (e.g. Fort, Solar, Hospital, Gate)..."
          />
        </div>

        {/* 2. Category Dropdown Button */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 relative" ref={dropdownRef}>
          <label className="block text-[11px] uppercase tracking-wider font-bold text-forest-green mb-1">
            Filter by Category
          </label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white text-dark-text border border-soft-sand hover:border-terracotta focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl px-3 py-2 md:py-2.5 text-xs md:text-sm font-sans flex items-center justify-between gap-2 shadow-xs transition-all cursor-pointer"
            aria-expanded={isOpen}
            aria-label="Filter places by category"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedCategory === 'ALL' ? (
                <Map className="w-4 h-4 text-forest-green shrink-0" />
              ) : (
                renderCategoryIcon(selectedCategory, 'w-4 h-4 text-forest-green shrink-0')
              )}
              <span className="truncate font-medium text-forest-green">
                {selectedCategory === 'ALL' ? 'All Categories' : selectedCategoryDef?.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] bg-forest-green text-white font-bold px-1.5 py-0.5 rounded-full">
                {categoryCounts[selectedCategory] || 0}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-text transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Floating Category Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-white border border-soft-sand rounded-xl shadow-xl z-50 py-1 divide-y divide-soft-sand/40">
              {/* ALL Option */}
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('ALL');
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-forest-green text-white shadow-xs'
                      : 'text-dark-text hover:bg-warm-cream'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 shrink-0" />
                    <span>All Categories</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === 'ALL'
                        ? 'bg-terracotta text-white'
                        : 'bg-soft-sand text-muted-text'
                    }`}
                  >
                    {categoryCounts['ALL'] || 0}
                  </span>
                </button>
              </div>

              {/* Individual Categories List */}
              <div className="p-1 space-y-0.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-forest-green text-white font-semibold shadow-xs'
                          : 'text-dark-text hover:bg-warm-cream'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {renderCategoryIcon(cat.id, `w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-forest-green'}`)}
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-terracotta text-white'
                            : 'bg-soft-sand text-muted-text'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Catalog Matches Counter */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2">
          <span className="block text-[11px] uppercase tracking-wider font-bold text-muted-text mb-1 text-left md:text-right">
            Catalog Matches
          </span>
          <div className="text-xs font-semibold text-forest-green border border-soft-sand px-3 py-2 md:py-2.5 rounded-xl bg-warm-cream flex items-center justify-between gap-2 shadow-2xs">
            <span className="text-muted-text font-normal truncate">Places</span>
            <span className="font-mono bg-forest-green text-white px-2 py-0.2 rounded-full text-xs font-bold shrink-0">
              {totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Active Filter Pills (Shows current active filters with 1-click reset) */}
      {(selectedCategory !== 'ALL' || searchQuery) && (
        <div className="pt-2.5 mt-2.5 border-t border-soft-sand/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-text text-[11px]">Active Filter:</span>
            {selectedCategory !== 'ALL' && (
              <span className="bg-terracotta/10 text-terracotta border border-terracotta/30 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{selectedCategoryDef?.name}</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory('ALL')}
                  className="hover:text-dark-text font-bold ml-0.5 cursor-pointer inline-flex items-center"
                  title="Clear category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-forest-green/10 text-forest-green border border-forest-green/30 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="hover:text-dark-text font-bold ml-0.5 cursor-pointer inline-flex items-center"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('ALL');
              onSearchChange('');
            }}
            className="text-[11px] text-terracotta hover:underline font-semibold cursor-pointer shrink-0 ml-2"
          >
            Reset All
          </button>
        </div>
      )}
    </div>
  );
};
