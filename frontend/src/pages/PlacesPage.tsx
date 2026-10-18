import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { LocationGrid } from '../components/locations/LocationGrid';
import { LocationDetailModal } from '../components/locations/LocationDetailModal';
import { locationService } from '../services/locationService';
import { LocationDetail } from '../types/location';
import { PageRoute } from '../types/navigation';
import { RotateCw } from 'lucide-react';

export interface PlacesPageProps {
  onRouteChange: (route: PageRoute) => void;
}

export const PlacesPage: React.FC<PlacesPageProps> = ({ onRouteChange }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPlaces = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await locationService.getLocationsAsync({ limit: 100 }, { forceRefresh });
      setLocations(res.items);
    } catch (err: unknown) {
      console.error('[PlacesPage] Error fetching places:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  return (
    <div className="space-y-10 py-6 md:py-10 animate-fadeIn">
      <SectionHeader
        number="02"
        categoryLabel="Explorer · Local Discovery"
        title="Important Places of Pavagada"
        kannadaTitle="ಪಾವಗಡದ ಪ್ರಮುಖ ಸ್ಥಳಗಳು"
        description="A verified catalogue of the foremost historical edifices, massive clean energy generation hubs, sacred heritage sites, and vital transport nodes in the taluk."
        action={
          <button
            type="button"
            onClick={() => loadPlaces(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-soft-sand bg-white hover:bg-warm-cream/60 text-xs font-semibold text-forest-green shadow-2xs transition-colors cursor-pointer"
            title="Refresh from server"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      <LocationGrid
        locations={locations}
        isLoading={isLoading}
        error={error}
        onRetry={() => loadPlaces(true)}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onViewOnMap={() => onRouteChange('map')}
        emptyTitle="No places have been added to this catalogue yet."
        emptyMessage="Newly created and published places from the admin dashboard will appear here."
      />

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onNavigateToMap={() => onRouteChange('map')}
        />
      )}
    </div>
  );
};
