import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  X,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { CommunityCategoryMeta, CommunityPlace } from '../../types/community';

interface CategoryDirectoryViewProps {
  category: CommunityCategoryMeta;
  places: CommunityPlace[];
  onBack: () => void;
  onSelectCategory?: (categoryId: string) => void;
  allCategories?: CommunityCategoryMeta[];
}

export const CategoryDirectoryView: React.FC<CategoryDirectoryViewProps> = ({
  category,
  places,
  onBack,
  onSelectCategory,
  allCategories = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [activePlaceModal, setActivePlaceModal] = useState<CommunityPlace | null>(null);

  // Extract unique types for filter pills
  const typeFilters = useMemo(() => {
    const types = new Set<string>();
    places.forEach((p) => {
      if (p.type) types.add(p.type);
    });
    return ['ALL', ...Array.from(types)];
  }, [places]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return places.filter((p) => {
      // Filter by type
      if (selectedTypeFilter !== 'ALL' && p.type !== selectedTypeFilter) {
        return false;
      }
      // Filter by search query
      if (!q) return true;
      const matchName = p.name.toLowerCase().includes(q);
      const matchKannada = p.kannadaName?.toLowerCase().includes(q);
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchType = p.type?.toLowerCase().includes(q);
      const matchServices = p.services?.some((s) => s.toLowerCase().includes(q));
      const matchCourses = p.courses?.some((c) => c.toLowerCase().includes(q));
      const matchDepartments = p.departments?.some((d) => d.toLowerCase().includes(q));
      return (
        matchName ||
        matchKannada ||
        matchAddress ||
        matchDesc ||
        matchType ||
        matchServices ||
        matchCourses ||
        matchDepartments
      );
    });
  }, [places, searchQuery, selectedTypeFilter]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-soft-sand pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-forest-green transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green rounded-lg px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Categories</span>
        </button>

        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
          {category.eyebrow}
        </span>
      </div>

      {/* Category Hero / Title Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${category.badgeBg} ${category.badgeText} ${category.badgeBorder}`}
              >
                {places.length} verified listings
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">Pavagada Taluk</span>
            </div>

            <h1 className="font-serif text-2xl md:text-4xl font-bold text-dark-text tracking-tight">
              {category.name}
            </h1>

            {category.kannadaName && (
              <p className="font-serif text-sm md:text-base text-slate-600 font-medium">
                {category.kannadaName}
              </p>
            )}

            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-sans">
              {category.description}
            </p>
          </div>

          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${category.accentBg} ${category.accentText}`}
          >
            <Building className="w-8 h-8 stroke-[1.8]" />
          </div>
        </div>

        {/* Live Search and Quick Filter Row */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${category.name.toLowerCase()} by name, service, or locality...`}
                className="w-full pl-10 pr-4 py-2.5 bg-warm-cream/30 border border-slate-200 rounded-xl text-sm text-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-green focus:bg-white transition-all"
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

          {/* Type Filter Pills (if more than 1 type) */}
          {typeFilters.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                Filter:
              </span>
              {typeFilters.map((type) => {
                const isSelected = selectedTypeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                      isSelected
                        ? 'bg-forest-green text-white border-forest-green shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type === 'ALL' ? `All (${places.length})` : type}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
        <span>
          Showing {filteredPlaces.length} of {places.length} listings
        </span>
        {searchQuery && (
          <span className="text-terracotta">
            Filtered by "{searchQuery}"
          </span>
        )}
      </div>

      {/* Places Card Grid */}
      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Type Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {place.type || 'Service'}
                  </span>
                  {place.verificationStatus && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{place.verificationStatus}</span>
                    </span>
                  )}
                </div>

                {/* Name */}
                <div>
                  <h3 className="font-serif text-base md:text-lg font-bold text-dark-text tracking-tight">
                    {place.name}
                  </h3>
                  {place.kannadaName && (
                    <p className="text-xs text-slate-500 font-serif mt-0.5">
                      {place.kannadaName}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{place.address}</span>
                </div>

                {/* Phone */}
                {place.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`tel:${place.phone.split('/')[0].trim()}`}
                      className="font-mono text-forest-green hover:underline"
                    >
                      {place.phone}
                    </a>
                  </div>
                )}

                {/* Opening Hours */}
                {place.openingHours && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{place.openingHours}</span>
                  </div>
                )}

                {/* Key Tags / Services pills */}
                {(place.services || place.courses || place.departments || place.tags) && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {(
                      place.services?.slice(0, 3) ||
                      place.courses?.slice(0, 3) ||
                      place.departments?.slice(0, 3) ||
                      place.tags?.slice(0, 3) ||
                      []
                    ).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-warm-cream/80 text-slate-700 border border-soft-sand/60"
                      >
                        {tag}
                      </span>
                    ))}
                    {((place.services?.length || 0) > 3 || (place.courses?.length || 0) > 3) && (
                      <span className="text-[11px] font-semibold text-slate-400 px-1 py-0.5">
                        +{((place.services?.length || place.courses?.length || 0) - 3)} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActivePlaceModal(place)}
                  className="text-xs font-semibold text-forest-green hover:text-emerald-800 transition-colors py-1.5 px-3 rounded-lg hover:bg-forest-green/5"
                >
                  View Details & Services
                </button>

                {place.phone ? (
                  <a
                    href={`tel:${place.phone.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-forest-green text-white hover:bg-forest-green-dark transition-colors shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActivePlaceModal(place)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-warm-cream text-dark-text border border-soft-sand hover:bg-soft-sand transition-colors"
                  >
                    <span>Inspect</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-600 font-medium">No services found matching your criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTypeFilter('ALL');
            }}
            className="mt-3 text-sm font-semibold text-forest-green hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Place Details Modal */}
      {activePlaceModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setActivePlaceModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest-green/10 text-forest-green">
                  {activePlaceModal.type || 'Official Listing'}
                </span>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-dark-text mt-2">
                  {activePlaceModal.name}
                </h2>
                {activePlaceModal.kannadaName && (
                  <p className="text-sm font-serif text-slate-500 mt-0.5">
                    {activePlaceModal.kannadaName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActivePlaceModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-sm text-slate-600">
              {activePlaceModal.description && (
                <p className="leading-relaxed text-slate-700 bg-warm-cream/40 p-4 rounded-xl border border-soft-sand/50">
                  {activePlaceModal.description}
                </p>
              )}

              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-dark-text block">Address & Location:</span>
                    <span>{activePlaceModal.address}</span>
                  </div>
                </div>

                {activePlaceModal.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-dark-text block">Contact Number:</span>
                      <a
                        href={`tel:${activePlaceModal.phone.split('/')[0].trim()}`}
                        className="text-forest-green font-mono hover:underline"
                      >
                        {activePlaceModal.phone}
                      </a>
                    </div>
                  </div>
                )}

                {activePlaceModal.emergencyPhone && (
                  <div className="flex items-start gap-3">
                    <PhoneCall className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-red-700 block">Emergency Helpline:</span>
                      <a
                        href={`tel:${activePlaceModal.emergencyPhone.split('/')[0].trim()}`}
                        className="text-red-700 font-bold font-mono hover:underline"
                      >
                        {activePlaceModal.emergencyPhone}
                      </a>
                    </div>
                  </div>
                )}

                {activePlaceModal.openingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-dark-text block">Operating Timings:</span>
                      <span>{activePlaceModal.openingHours}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Services / Courses / Departments List */}
              {activePlaceModal.services && activePlaceModal.services.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-dark-text block">Services & Facilities:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activePlaceModal.services.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-green shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePlaceModal.courses && activePlaceModal.courses.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-dark-text block">Academic Courses & Streams:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePlaceModal.courses.map((course, idx) => (
                      <span key={idx} className="text-xs bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-lg">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActivePlaceModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              {activePlaceModal.phone && (
                <a
                  href={`tel:${activePlaceModal.phone.split('/')[0].trim()}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-forest-green text-white rounded-xl hover:bg-forest-green-dark transition-colors shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call {activePlaceModal.name.split(' ')[0]}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Explore Other Categories Footer Switcher */}
      {allCategories.length > 0 && onSelectCategory && (
        <div className="pt-8 border-t border-soft-sand space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Explore Other Categories
          </span>
          <div className="flex flex-wrap gap-2">
            {allCategories
              .filter((c) => c.id !== category.id)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCategory(c.id)}
                  className="text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-forest-green hover:text-forest-green transition-all"
                >
                  {c.name}
                  <span className="ml-1.5 text-slate-400 font-mono">({c.initialCount})</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
