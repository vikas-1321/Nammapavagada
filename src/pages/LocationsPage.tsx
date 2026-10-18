import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LocationGrid } from '../components/locations/LocationGrid';
import { LocationDetailModal } from '../components/locations/LocationDetailModal';
import { locationService, LocationsApiResponse } from '../services/locationService';
import { LocationCategory, LocationDetail } from '../types/location';
import { CategoryDefinition } from '../data/categoriesData';
import { PageRoute } from '../types/navigation';
import {
  Search,
  X,
  ChevronDown,
  RotateCw,
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
} from 'lucide-react';

export interface LocationsPageProps {
  onRouteChange: (route: PageRoute) => void;
}

const renderCategoryIcon = (categoryId: string, className = 'w-3.5 h-3.5 shrink-0') => {
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

export const LocationsPage: React.FC<LocationsPageProps> = ({ onRouteChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);

  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => locationService.getCategories());
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(() =>
    locationService.getCategoryCounts()
  );

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // Load locations from backend API
  const fetchLocations = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res: LocationsApiResponse = await locationService.getLocationsAsync(
        {
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          searchQuery: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
          limit: 100,
        },
        { forceRefresh }
      );

      setLocations(res.items);
      setTotalCount(res.total);
      setCategories(locationService.getCategories());
      setCategoryCounts(locationService.getCategoryCounts());
    } catch (err: unknown) {
      console.error('[LocationsPage] Failed to fetch locations:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLocations([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, debouncedQuery]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Subscribe to reactive service notifications
  useEffect(() => {
    const unsubscribe = locationService.subscribe(() => {
      setCategories(locationService.getCategories());
      setCategoryCounts(locationService.getCategoryCounts());
    });
    return () => unsubscribe();
  }, []);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const selectedCategoryDef = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6 py-6 md:py-8 animate-fadeIn">
      {/* Compact Editorial Header matching Community Page (Low Space Occupancy, No Description) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-3 border-b border-soft-sand">
        {/* Left Side: Eyebrow + Title + Counts (No Description Paragraph) */}
        <div className="space-y-1.5">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider text-slate-500 uppercase">
            <span className="text-slate-400">—</span>
            <span>EXPLORER · MASTER PLACE INDEX</span>
          </div>

          {/* Main Title */}
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-dark-text tracking-tight">
              Pavagada Location Directory
            </h1>
            <span className="font-kannada text-sm md:text-base text-earth-brown font-medium">
              ಸ್ಥಳಗಳ ಸಮಗ್ರ ಕೋಶ
            </span>
          </div>

          {/* Subtitle / Counts */}
          <div className="flex items-center gap-2 text-sm md:text-base text-slate-600 font-sans">
            <span className="font-medium text-slate-800">{totalCount} places</span>
            <span className="text-slate-300">·</span>
            <span>{categories.length} categories</span>
            <span className="hidden sm:inline text-slate-500">across Pavagada taluk</span>

            <button
              type="button"
              onClick={() => fetchLocations(true)}
              className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg border border-soft-sand bg-white hover:bg-warm-cream/60 text-xs font-semibold text-forest-green shadow-2xs transition-colors cursor-pointer"
              title="Refresh from server"
            >
              <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Right Side: Short Search Bar & Category Filter kept aside */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          {/* Short Search Bar */}
          <div className="w-full sm:w-60 md:w-64 relative">
            <label htmlFor="explorer-search" className="sr-only">
              Search places
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="explorer-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a place or monument..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-dark-text placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Dropdown (Kept aside next to search) */}
          <div className="w-full sm:w-48 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full bg-white text-dark-text border border-slate-200 hover:border-terracotta focus:ring-2 focus:ring-forest-green rounded-xl px-3 py-2 text-xs md:text-sm font-sans flex items-center justify-between gap-2 shadow-xs transition-all cursor-pointer"
              aria-expanded={isCategoryOpen}
              aria-label="Filter places by category"
            >
              <div className="flex items-center gap-1.5 truncate">
                {selectedCategory === 'ALL' ? (
                  <Map className="w-3.5 h-3.5 text-forest-green shrink-0" />
                ) : (
                  renderCategoryIcon(selectedCategory, 'w-3.5 h-3.5 text-forest-green shrink-0')
                )}
                <span className="truncate font-medium text-forest-green text-xs md:text-sm">
                  {selectedCategory === 'ALL' ? 'All Categories' : selectedCategoryDef?.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-[10px] bg-forest-green text-white font-bold px-1.5 py-0.2 rounded-full">
                  {categoryCounts[selectedCategory] ?? totalCount}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-text transition-transform duration-200 ${
                    isCategoryOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Floating Category Menu */}
            {isCategoryOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 max-h-72 overflow-y-auto bg-white border border-soft-sand rounded-xl shadow-xl z-50 py-1 divide-y divide-soft-sand/40">
                {/* ALL Option */}
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCategory === 'ALL'
                        ? 'bg-forest-green text-white shadow-xs'
                        : 'text-dark-text hover:bg-warm-cream'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Map className="w-3.5 h-3.5 shrink-0" />
                      <span>All Categories</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCategory === 'ALL'
                          ? 'bg-terracotta text-white'
                          : 'bg-soft-sand text-muted-text'
                      }`}
                    >
                      {categoryCounts['ALL'] || totalCount}
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
                          setSelectedCategory(cat.id as LocationCategory);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-forest-green text-white font-semibold shadow-xs'
                            : 'text-dark-text hover:bg-warm-cream'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {renderCategoryIcon(
                            cat.id,
                            `w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-forest-green'}`
                          )}
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
        </div>
      </div>

      {/* Location Cards Grid */}
      <LocationGrid
        locations={locations}
        isLoading={isLoading}
        error={error}
        onRetry={() => fetchLocations(true)}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onViewOnMap={() => onRouteChange('map')}
        onResetFilters={handleResetFilters}
        emptyTitle={
          searchQuery || selectedCategory !== 'ALL'
            ? 'No places match your search criteria'
            : 'No places have been added to this category yet.'
        }
        emptyMessage={
          searchQuery || selectedCategory !== 'ALL'
            ? 'Try broadening your search keywords or choosing a different category.'
            : 'Check back soon as new verified places are published to the registry.'
        }
      />

      {/* Location Details Modal */}
      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onNavigateToMap={() => {
            setSelectedLocation(null);
            onRouteChange('map');
          }}
        />
      )}
    </div>
  );
};
