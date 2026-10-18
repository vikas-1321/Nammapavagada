import React from 'react';
import { LocationDetail } from '../../types/location';
import { LocationCard } from './LocationCard';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';

export interface LocationGridProps {
  locations: LocationDetail[];
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  onSelectLocation: (location: LocationDetail) => void;
  onViewOnMap?: (location: LocationDetail) => void;
  onResetFilters?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

export const LocationGrid: React.FC<LocationGridProps> = ({
  locations,
  isLoading = false,
  error = null,
  onRetry,
  onSelectLocation,
  onViewOnMap,
  onResetFilters,
  emptyTitle = 'No places have been added to this category yet.',
  emptyMessage = 'There are currently no published locations in the central database matching your search or category filter.',
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      <LoadingState
        message="Retrieving verified places from Namma Pavagada database..."
        submessage="Querying active registered locations"
        count={6}
      />
    );
  }

  // 2. Error State
  if (error) {
    return (
      <ErrorState
        title="Could Not Retrieve Locations"
        message="A network or server error occurred while contacting the places registry."
        error={error}
        onRetry={onRetry}
      />
    );
  }

  // 3. Empty State (Zero fake records)
  if (locations.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        icon="search"
        actionLabel={onResetFilters ? 'Reset All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  // 4. Success State with Backend Records
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
