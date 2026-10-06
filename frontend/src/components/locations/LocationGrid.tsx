import React from 'react';
import { LocationDetail } from '../../types/location';
import { LocationCard } from './LocationCard';
import { Search } from 'lucide-react';

export interface LocationGridProps {
  locations: LocationDetail[];
  onSelectLocation: (location: LocationDetail) => void;
  onViewOnMap?: (location: LocationDetail) => void;
  onResetFilters?: () => void;
}

export const LocationGrid: React.FC<LocationGridProps> = ({
  locations,
  onSelectLocation,
  onViewOnMap,
  onResetFilters,
}) => {
  if (locations.length === 0) {
    return (
      <div className="bg-white border border-soft-sand rounded-2xl p-10 md:p-16 text-center my-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-soft-sand/50 text-forest-green flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-forest-green/70" />
        </div>
        <div className="text-xl md:text-2xl font-serif font-bold text-forest-green mb-2">
          No records match active criteria
        </div>
        <p className="text-sm text-muted-text max-w-md mx-auto mb-6 leading-relaxed">
          Adjust the category filter or search keywords to view registered landmarks, fortifications, or local services.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="bg-forest-green hover:bg-forest-green-dark text-white text-xs uppercase tracking-wider font-bold px-6 py-3 rounded-lg shadow-sm transition-colors"
          >
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 md:gap-8">
      {locations.map((location) => (
        <div
          key={location.id}
          className="col-span-12 md:col-span-6 lg:col-span-4 flex"
        >
          <LocationCard
            location={location}
            onSelect={onSelectLocation}
            onViewOnMap={onViewOnMap}
          />
        </div>
      ))}
    </div>
  );
};
