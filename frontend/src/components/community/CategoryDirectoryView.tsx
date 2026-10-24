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
  Flag,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { CommunityCategoryMeta, CommunityPlace } from '../../types/community';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';

interface CategoryDirectoryViewProps {
  category: CommunityCategoryMeta;
  places: CommunityPlace[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onBack: () => void;
  onSelectCategory?: (categoryId: string) => void;
  allCategories?: CommunityCategoryMeta[];
}

export const CategoryDirectoryView: React.FC<CategoryDirectoryViewProps> = ({
  category,
  places,
  isLoading = false,
  error = null,
  onRetry,
  onBack,
  onSelectCategory,
  allCategories = [],
}) => {
  const { openFeedback } = useFeedback();
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-forest-green transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green rounded-lg px-2 py-1 cursor-pointer"
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

        {/* Live Search and Quick Filter Row (shown if places exist) */}
        {places.length > 0 && (
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
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
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
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
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState
          message={`Loading verified ${category.name.toLowerCase()} from backend...`}
          submessage="Connecting to central registry"
          count={4}
        />
      ) : error ? (
        <ErrorState
          title={`Could Not Load ${category.name}`}
          message="Failed to retrieve verified records from the server."
          error={error}
          onRetry={onRetry}
        />
      ) : places.length === 0 ? (
        <EmptyState
          title="No places have been added to this category yet."
          message="Records added and published through the administrative dashboard will appear here."
          icon="folder"
        />
      ) : filteredPlaces.length === 0 ? (
        <EmptyState
          title="No records found matching your criteria"
          message={`No ${category.name.toLowerCase()} matched your active search query or filter.`}
          icon="search"
          actionLabel="Clear filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedTypeFilter('ALL');
          }}
        />
      ) : (
        <>
          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>
              Showing {filteredPlaces.length} of {places.length} listings
            </span>
            {searchQuery && (
              <span className="text-terracotta">Filtered by &ldquo;{searchQuery}&rdquo;</span>
            )}
          </div>

          {/* Places Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Card Header Type Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="inline-flex items-center text-[11px] font-semibold tracking-wide text-forest-green font-mono uppercase bg-forest-green/10 px-2 py-0.5 rounded-md">
                      {place.type || 'Official Service'}
                    </span>

                    {place.verificationStatus && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{place.verificationStatus}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-dark-text group-hover:text-forest-green transition-colors leading-snug">
                      {place.name}
                    </h3>
                    {place.kannadaName && (
                      <p className="font-kannada text-xs text-earth-brown mt-0.5">
                        {place.kannadaName}
                      </p>
                    )}
                  </div>

                  {place.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {place.description}
                    </p>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{place.address}</span>
                  </div>

                  {/* Hours */}
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
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePlaceModal(place)}
                    className="text-xs font-semibold text-forest-green hover:text-emerald-800 transition-colors py-1.5 px-3 rounded-lg hover:bg-forest-green/5 cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-warm-cream text-dark-text border border-soft-sand hover:bg-soft-sand transition-colors cursor-pointer"
                    >
                      <span>Inspect</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer Category Switcher */}
      {allCategories.length > 0 && (
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
                  onClick={() => onSelectCategory?.(c.id)}
                  className="text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-forest-green hover:text-forest-green transition-all cursor-pointer"
                >
                  {c.name}
                  <span className="ml-1.5 text-slate-400 font-mono">({c.initialCount})</span>
                </button>
              ))}
          </div>
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
                  <p className="font-kannada text-sm text-earth-brown mt-0.5">
                    {activePlaceModal.kannadaName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActivePlaceModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-sm text-slate-600">
              {activePlaceModal.description && (
                <p className="leading-relaxed">{activePlaceModal.description}</p>
              )}

              {/* Address */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warm-cream/50 border border-soft-sand">
                <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <span className="text-xs text-dark-text leading-relaxed">
                  {activePlaceModal.address}
                </span>
              </div>

              {/* Hours */}
              {activePlaceModal.openingHours && (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Hours:</strong> {activePlaceModal.openingHours}
                  </span>
                </div>
              )}

              {/* Show timings for theatres */}
              {activePlaceModal.showTimings && activePlaceModal.showTimings.length > 0 && (
                <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
                    Daily Show Timings:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePlaceModal.showTimings.map((time, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono font-bold bg-white text-rose-700 px-2.5 py-1 rounded border border-rose-200"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Phone & Report incorrect info */}
              <div className="pt-3 border-t border-soft-sand/50 flex flex-wrap items-center justify-between gap-2">
                {activePlaceModal.phone ? (
                  <a
                    href={`tel:${activePlaceModal.phone.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-forest-green text-white hover:bg-forest-green-dark transition-colors shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call: {activePlaceModal.phone}</span>
                  </a>
                ) : <div />}

                <button
                  type="button"
                  onClick={() => {
                    const place = activePlaceModal;
                    setActivePlaceModal(null);
                    openFeedback({
                      category: 'INCORRECT_INFO',
                      relatedEntityType: category.id.toUpperCase(),
                      relatedEntityId: place.id,
                      relatedEntityName: place.name,
                      defaultMessage: `I noticed an issue or incorrect detail for ${place.name}: `,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-text hover:text-terracotta transition-colors px-2.5 py-1.5 rounded-lg hover:bg-warm-cream cursor-pointer"
                  title="Report outdated address, phone, timings, or service"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report incorrect info</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
